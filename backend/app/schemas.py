from typing import List, Optional

from pydantic import BaseModel


class RegisterIn(BaseModel):
    phone: str
    name: str
    password: str
    role: str = "shipper"
    city: Optional[str] = None
    vehicle: Optional[str] = None


class LoginIn(BaseModel):
    phone: str
    password: str


class UserOut(BaseModel):
    id: int
    phone: str
    name: str
    role: str
    city: Optional[str] = None
    vehicle: Optional[str] = None
    rating: float
    trips: int
    verified: bool


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ShipmentIn(BaseModel):
    title: str
    category: str = "furniture"
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
    budget: Optional[int] = None


class BidOut(BaseModel):
    id: int
    amount: int
    eta_days: int
    message: Optional[str]
    status: str
    created_at: str
    carrier: UserOut


class ShipmentOut(BaseModel):
    id: int
    title: str
    category: str
    origin: str
    destination: str
    distance_km: int
    weight_kg: int
    volume_m3: float
    needs_loader: bool
    needs_packing: bool
    insured: bool
    pickup_from: Optional[str]
    pickup_to: Optional[str]
    description: Optional[str]
    photo: Optional[str]
    budget: Optional[int]
    status: str
    created_at: str
    owner: UserOut
    bid_count: int
    best_bid: Optional[int]
    bids: List[BidOut] = []


class BidIn(BaseModel):
    amount: int
    eta_days: int = 2
    message: Optional[str] = None


class StatsOut(BaseModel):
    shipments: int
    carriers: int
    bids: int
    avg_saving_pct: int
    co2_saved_tons: int
