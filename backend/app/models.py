from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def now() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    phone: str = Field(index=True, unique=True)
    name: str
    role: str = "shipper"  # shipper | carrier
    password_hash: str
    city: Optional[str] = None
    vehicle: Optional[str] = None
    rating: float = 5.0
    trips: int = 0
    verified: bool = False
    created_at: datetime = Field(default_factory=now)


class Shipment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    title: str
    category: str = "furniture"  # furniture | vehicle | motorcycle | pallet | appliance | other
    origin: str
    destination: str
    distance_km: int = 0
    weight_kg: int = 0
    volume_m3: float = 0
    needs_loader: bool = False
    needs_packing: bool = False
    insured: bool = False
    pickup_from: Optional[str] = None
    pickup_to: Optional[str] = None
    description: Optional[str] = None
    photo: Optional[str] = None
    budget: Optional[int] = None  # Toman
    status: str = "open"  # open | assigned | in_transit | delivered | cancelled
    created_at: datetime = Field(default_factory=now)


class Bid(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    shipment_id: int = Field(foreign_key="shipment.id", index=True)
    carrier_id: int = Field(foreign_key="user.id", index=True)
    amount: int
    eta_days: int = 2
    message: Optional[str] = None
    status: str = "pending"  # pending | accepted | rejected
    created_at: datetime = Field(default_factory=now)
