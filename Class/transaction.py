import database
import Class.user as user
from Class.account import Account  # Import the Account class
from pydantic import BaseModel
from fastapi import FastAPI, Depends, APIRouter, HTTPException
from sqlmodel import Session, select, SQLModel, Field

from datetime import datetime

router = APIRouter(tags=["Transactions"])

#*--------- Class ----------#

class Transaction(SQLModel, BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    sender: int = Field(index=True)  # sender account id
    receiver: int = Field(index=True)  # receiver account id
    amount: float = Field(index=True)
    created_at: datetime = Field(default=datetime.now())  # transaction date

#*--------- Function Post ----------#

@router.post("/transactions/")
def create_transaction(body: Transaction, session=Depends(database.get_session), user_info=Depends(user.get_user)):
    # Check if receiver account exists
    statement = select(Account).where(Account.id == body.receiver)  # Use Account class here
    receiver_account = session.exec(statement).first()  # Fetch first result

    if not receiver_account:
        raise HTTPException(status_code=404, detail="Receiver account does not exist")

    # Check if sender account exists
    statement = select(Account).where(Account.id == body.sender)  # Use Account class here
    sender_account = session.exec(statement).first()  # Fetch first result

    if not sender_account:
        raise HTTPException(status_code=404, detail="Sender account does not exist")

    # Check if sufficient balance
    if sender_account.balance < body.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Validate transaction details
    if body.receiver == body.sender:
        raise HTTPException(status_code=400, detail="Cannot send money to the same account")
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Transaction amount must be greater than zero")
    
    if sender_account.user_id != user_info["id"]:
        raise HTTPException(status_code=400, detail="Not your account DUH")

    # Create and save the transaction
    transaction = Transaction(
        sender=body.sender,
        receiver=body.receiver,
        amount=body.amount,
    )
    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    # Update sender and receiver balances
    sender_account.balance -= body.amount
    receiver_account.balance += body.amount
    session.add(sender_account)
    session.add(receiver_account)
    session.commit()

    return {
        "message": "Transaction successfully completed.",
        "sender_account": transaction.sender,
        "receiver_account": transaction.receiver,
        "sender_new_balance": sender_account.balance,
        "receiver_new_balance": receiver_account.balance,
    }
