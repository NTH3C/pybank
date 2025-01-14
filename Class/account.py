import database
import Class.user as user

from fastapi import FastAPI, Depends, APIRouter, HTTPException
from sqlmodel import Session, create_engine, Field, SQLModel
from pydantic import BaseModel

router = APIRouter(tags=["Accounts"])





#*--------- Class ----------#

class Account(SQLModel, BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    balance: float = Field(index=True)
    name: str = Field(index=True, nullable=False )
    user_id: int = Field(index=True)

class CreateAcount(BaseModel):
    name: str

#*--------- App post ----------#

@router.post("/accounts/")
def create_account(body: CreateAcount, user_info=Depends(user.get_user), session=Depends(database.get_session)) -> Account:
    if user_info:
        account = Account(balance=0, name=body.name, user_id=user_info["id"])  # Access id as a dictionary key
        session.add(account)
        session.commit()
        session.refresh(account)
        return account
    raise HTTPException(401, "Please login")


#*--------- App Get ----------#


