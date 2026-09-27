import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, SQLModel, create_engine

DB_URL = os.getenv("DATABASE_URL", "sqlite:///./data/shiply.db")
SECRET_KEY = os.getenv("SECRET_KEY", "shiply-iran-dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_TTL_MIN = 60 * 24 * 7

os.makedirs(os.path.dirname(DB_URL.replace("sqlite:///", "")) or ".", exist_ok=True)
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def hash_password(raw: str) -> str:
    return pwd.hash(raw[:72])


def verify_password(raw: str, hashed: str) -> bool:
    return pwd.verify(raw[:72], hashed)


def create_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_TTL_MIN)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def current_user_optional(token: Optional[str] = Depends(oauth2), session: Session = Depends(get_session)):
    from app.models import User

    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return session.get(User, int(payload.get("sub")))
    except (JWTError, ValueError, TypeError):
        return None


def current_user(user=Depends(current_user_optional)):
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "NOT_AUTHENTICATED")
    return user
