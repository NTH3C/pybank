from fastapi import FastAPI, Depends, APIRouter, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, Field, SQLModel, select
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt
import database

router = APIRouter(tags=["Users"])

SECRET_KEY = "cf9b7cad0e2b97bf20b1055e64bbe1bca861bfa9abd08538b63bd32931985a1f"
ALGORITHM = "HS256"

BEARER_SCHEME = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#*--------- Models ----------#

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: EmailStr = Field(index=True, unique=True)
    password: str = Field(index=True)

class UserData(BaseModel):
    email: EmailStr
    password: str

class TokenData(BaseModel):
    email: EmailStr
    id: int

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

#*--------- Utility Functions ----------#

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_token(user: TokenData) -> str:
    return jwt.encode(user.dict(), SECRET_KEY, algorithm=ALGORITHM)

def get_user(authorization: HTTPAuthorizationCredentials = Depends(BEARER_SCHEME)):
    try:
        return jwt.decode(authorization.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def authenticate_user(email: str, password: str, session: Session):
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    if not user or not verify_password(password, user.password):
        return None
    return user

#*--------- Routes ----------#

@router.post("/users/")
def create_user(body: UserData, session: Session = Depends(database.get_session)):
    from Class.account import create_account_for_user

    # Vérifier si l'utilisateur existe déjà
    existing_user = session.exec(select(User).where(User.email == body.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Créer un nouvel utilisateur
    user = User(email=body.email, password=get_password_hash(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)

    # Créer un compte associé
    account = create_account_for_user(user.id)
    session.add(account)
    session.commit()
    session.refresh(account)

    return {"message": "User and account created successfully"}

@router.post("/login/")
def login(body: UserData, session: Session = Depends(database.get_session)):
    user = authenticate_user(body.email, body.password, session)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = TokenData(id=user.id, email=user.email)
    return {"token": generate_token(token_data)}

@router.get("/me/")
def me(user=Depends(get_user)):
    return user

@router.put("/change_password/")
def change_password(
    body: PasswordChange, 
    session: Session = Depends(database.get_session), 
    user_info=Depends(get_user)
):
    # Retrieve the hashed password for the user
    statement = select(User.password).where(User.id == user_info["id"])
    hashed_password = session.exec(statement).first()

    if not hashed_password:
        return {"error": "User not found"}

    # Verify the old password
    if not pwd_context.verify(body.old_password, hashed_password):
        return {"error": "Old password is incorrect"}

    # Hash the new password and update it
    hashed_new_password = pwd_context.hash(body.new_password)
    user = session.get(User, user_info["id"])
    if user:
        user.password = hashed_new_password
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"message": "Password has been changed successfully"}
    else:
        return {"error": "User not found"}
