import database

import jwt
from fastapi import FastAPI, Depends, APIRouter, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, create_engine, Field, SQLModel, select
from pydantic import BaseModel
from passlib.context import CryptContext


import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

router = APIRouter(tags=["Users"])

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "cf9b7cad0e2b97bf20b1055e64bbe1bca861bfa9abd08538b63bd32931985a1f"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

BEARER_SCHEME = HTTPBearer()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

#*--------- Class ----------#

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True) # AJOUTER UN MESSAGE POUR L'UTILISATEUR
    password: str = Field(index=True)

class UserData(BaseModel):
    email: str # AJOUTER UN MESSAGE POUR L'UTILISATEUR
    password: str

class TokenData(BaseModel):
    email: str
    id: int

#*--------- Authentication ----------#

'''
def get_user(email: str, session: Session):
    statement = select(User).where(User.email == email)  # if user email exists
    result = session.exec(statement).first()  # fetch first result
    return result
'''

def get_user(authorization: HTTPAuthorizationCredentials = Depends(BEARER_SCHEME)) :
    return jwt.decode(authorization.credentials, SECRET_KEY, algorithms=[ALGORITHM])

def generate_token(user: TokenData) : 
    return jwt.encode(user.model_dump(), SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password) # compare plain and hashed pwd

def authenticate_user(email: str, password: str, session: Session):
    statement = select(User).where(User.email == email)  # if user email exists
    user = session.exec(statement).first()  # fetch first result
    if not user:  # case user doesn't exist
        return False
    if not verify_password(password, user.password):  # case pwd not correct
        return False
    return user

#*--------- App post ----------#

@router.post("/users/")
def create_user(body: User,  session: Session = Depends(database.get_session)) -> User:
    user = User(email=body.email, password=get_password_hash(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/login/")
def login(body: UserData, session: Session = Depends(database.get_session)):
    user = authenticate_user(body.email, body.password, session)
    email = user.email
    id = user.id
    token_data = TokenData(id= id,email= email)
    if not user:
        raise HTTPException(401, "invalid credentials")
    return {"token": generate_token(token_data)}

@router.post("/me/")
def me(user = Depends(get_user)):
    return user
#*--------- App Get ----------#