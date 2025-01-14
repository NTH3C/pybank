import database

from fastapi import FastAPI, Depends, APIRouter
from sqlmodel import Session, create_engine, Field, SQLModel
from pydantic import BaseModel

router = APIRouter(tags=["Transactions"])

#*--------- Class ----------#

class Transaction(SQLModel, BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    sender: int = Field(index=True)
    receiver: int = Field(index=True)
    amount: float = Field(index=True)
    created_at: str = Field(default="1911/02/03", index=True)


#*--------- Function Post ----------#

@router.post("/transactions/")
def create_transaction(body: Transaction, session = Depends(database.get_session)) -> Transaction:
    transaction = Transaction(sender=body.sender, receiver=body.receiver, amount=body.amount)
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction


#*--------- Function Get ----------#

