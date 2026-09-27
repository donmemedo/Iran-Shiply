from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, func, select

from app.core import create_token, current_user, current_user_optional, get_session, hash_password, verify_password
from app.models import Bid, Shipment, User
from app.schemas import (BidIn, BidOut, LoginIn, RegisterIn, ShipmentIn, ShipmentOut, StatsOut, TokenOut, UserOut)

router = APIRouter(prefix="/api")


def user_out(u: User) -> UserOut:
    return UserOut.model_validate(u, from_attributes=True)


def bid_out(b: Bid, carrier: User) -> BidOut:
    return BidOut(id=b.id, amount=b.amount, eta_days=b.eta_days, message=b.message, status=b.status,
                  created_at=b.created_at.isoformat(), carrier=user_out(carrier))


def shipment_out(s: Shipment, session: Session, with_bids: bool = False) -> ShipmentOut:
    rows = session.exec(select(Bid, User).join(User, Bid.carrier_id == User.id)
                        .where(Bid.shipment_id == s.id).order_by(Bid.amount)).all()
    owner = session.get(User, s.owner_id)
    return ShipmentOut(
        **{k: getattr(s, k) for k in ShipmentIn.model_fields},
        id=s.id, status=s.status, created_at=s.created_at.isoformat(), owner=user_out(owner),
        bid_count=len(rows), best_bid=rows[0][0].amount if rows else None,
        bids=[bid_out(b, c) for b, c in rows] if with_bids else [],
    )


# ---------- auth ----------
@router.post("/auth/register", response_model=TokenOut)
def register(body: RegisterIn, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.phone == body.phone)).first():
        raise HTTPException(409, "PHONE_TAKEN")
    user = User(phone=body.phone, name=body.name, role=body.role, city=body.city, vehicle=body.vehicle,
                password_hash=hash_password(body.password), verified=True)
    session.add(user)
    session.commit()
    session.refresh(user)
    return TokenOut(access_token=create_token(user.id), user=user_out(user))


@router.post("/auth/login", response_model=TokenOut)
def login(body: LoginIn, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.phone == body.phone)).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "BAD_CREDENTIALS")
    return TokenOut(access_token=create_token(user.id), user=user_out(user))


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user_out(user)


# ---------- shipments ----------
@router.get("/shipments", response_model=List[ShipmentOut])
def list_shipments(session: Session = Depends(get_session), q: Optional[str] = None,
                   category: Optional[str] = None, origin: Optional[str] = None,
                   destination: Optional[str] = None, status: Optional[str] = None,
                   sort: str = "new", limit: int = Query(30, le=100), offset: int = 0):
    stmt = select(Shipment)
    if q:
        stmt = stmt.where(Shipment.title.contains(q))
    if category and category != "all":
        stmt = stmt.where(Shipment.category == category)
    if origin:
        stmt = stmt.where(Shipment.origin == origin)
    if destination:
        stmt = stmt.where(Shipment.destination == destination)
    stmt = stmt.where(Shipment.status == (status or "open"))
    stmt = stmt.order_by(Shipment.distance_km.desc() if sort == "distance" else Shipment.id.desc())
    items = session.exec(stmt.offset(offset).limit(limit)).all()
    return [shipment_out(s, session) for s in items]


@router.post("/shipments", response_model=ShipmentOut)
def create_shipment(body: ShipmentIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    s = Shipment(owner_id=user.id, **body.model_dump())
    session.add(s)
    session.commit()
    session.refresh(s)
    return shipment_out(s, session, with_bids=True)


@router.get("/shipments/{sid}", response_model=ShipmentOut)
def get_shipment(sid: int, session: Session = Depends(get_session)):
    s = session.get(Shipment, sid)
    if not s:
        raise HTTPException(404, "NOT_FOUND")
    return shipment_out(s, session, with_bids=True)


@router.get("/my/shipments", response_model=List[ShipmentOut])
def my_shipments(user: User = Depends(current_user), session: Session = Depends(get_session)):
    items = session.exec(select(Shipment).where(Shipment.owner_id == user.id).order_by(Shipment.id.desc())).all()
    return [shipment_out(s, session, with_bids=True) for s in items]


@router.get("/my/bids", response_model=List[ShipmentOut])
def my_bids(user: User = Depends(current_user), session: Session = Depends(get_session)):
    ids = session.exec(select(Bid.shipment_id).where(Bid.carrier_id == user.id)).all()
    items = session.exec(select(Shipment).where(Shipment.id.in_(ids)).order_by(Shipment.id.desc())).all() if ids else []
    return [shipment_out(s, session, with_bids=True) for s in items]


# ---------- bids ----------
@router.post("/shipments/{sid}/bids", response_model=ShipmentOut)
def place_bid(sid: int, body: BidIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    s = session.get(Shipment, sid)
    if not s:
        raise HTTPException(404, "NOT_FOUND")
    if s.status != "open":
        raise HTTPException(400, "SHIPMENT_CLOSED")
    if s.owner_id == user.id:
        raise HTTPException(400, "OWN_SHIPMENT")
    existing = session.exec(select(Bid).where(Bid.shipment_id == sid, Bid.carrier_id == user.id)).first()
    if existing:
        existing.amount, existing.eta_days, existing.message = body.amount, body.eta_days, body.message
        session.add(existing)
    else:
        session.add(Bid(shipment_id=sid, carrier_id=user.id, **body.model_dump()))
    session.commit()
    return shipment_out(s, session, with_bids=True)


@router.post("/bids/{bid_id}/accept", response_model=ShipmentOut)
def accept_bid(bid_id: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    b = session.get(Bid, bid_id)
    if not b:
        raise HTTPException(404, "NOT_FOUND")
    s = session.get(Shipment, b.shipment_id)
    if s.owner_id != user.id:
        raise HTTPException(403, "FORBIDDEN")
    for other in session.exec(select(Bid).where(Bid.shipment_id == s.id)).all():
        other.status = "accepted" if other.id == b.id else "rejected"
        session.add(other)
    s.status = "assigned"
    session.add(s)
    session.commit()
    session.refresh(s)
    return shipment_out(s, session, with_bids=True)


# ---------- meta ----------
@router.get("/stats", response_model=StatsOut)
def stats(session: Session = Depends(get_session)):
    shipments = session.exec(select(func.count(Shipment.id))).one()
    carriers = session.exec(select(func.count(User.id)).where(User.role == "carrier")).one()
    bids = session.exec(select(func.count(Bid.id))).one()
    km = session.exec(select(func.coalesce(func.sum(Shipment.distance_km), 0))).one()
    return StatsOut(shipments=shipments, carriers=carriers, bids=bids, avg_saving_pct=43,
                    co2_saved_tons=int(km * 0.9 / 1000) + 12)


@router.get("/cities", response_model=List[str])
def cities():
    return ["تهران", "کرج", "قم", "اصفهان", "مشهد", "شیراز", "تبریز", "بندرعباس", "اهواز", "رشت",
            "کرمان", "یزد", "ارومیه", "کرمانشاه", "ساری"]
