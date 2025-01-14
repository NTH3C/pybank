import database

from fastapi import FastAPI, Depends, APIRouter
from sqlmodel import Session, create_engine, Field, SQLModel
from pydantic import BaseModel

router = APIRouter(tags=["Accounts"])

#*--------- Class ----------#

class Account(SQLModel, BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    balance: float = Field(index=True)
    user_id: int = Field(index=True)

#*--------- App post ----------#

@router.post("/accounts/")
def create_account(body: Account, session = Depends(database.get_session)) -> Account:
    account = Account(balance=body.balance, user_id=body.user_id)
    session.add(account)
    session.commit()
    session.refresh(account)
    return account


#*--------- App Get ----------#


