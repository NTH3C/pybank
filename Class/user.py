import database

from fastapi import FastAPI, Depends, APIRouter
from sqlmodel import Session, create_engine, Field, SQLModel
from pydantic import BaseModel
from passlib.context import CryptContext

router = APIRouter(tags=["Users"])

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "cf9b7cad0e2b97bf20b1055e64bbe1bca861bfa9abd08538b63bd32931985a1f"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

#*--------- Class ----------#

db = Depends(database.get_session)

class User(SQLModel, BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password: str = Field(index=True)

#*--------- Authentication ----------#


#*--------- App post ----------#

@router.post("/users/")
def create_user(body: User, session = db) -> User:
    user = User(email=body.email, password=get_password_hash(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

#*--------- App Get ----------#