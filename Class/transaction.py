import database
import Class.user as user
from Class.account import Account  # Import the Account class

import logging

from pydantic import BaseModel
from fastapi import FastAPI, Depends, APIRouter, HTTPException
from sqlmodel import Session, select, SQLModel, Field
from fastapi_utilities import repeat_every

from datetime import datetime, timedelta

router = APIRouter(tags=["Transactions"])



    

#*--------- Class ----------#

class Transaction(SQLModel, BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    sender: int = Field(index=True)  # sender account id
    receiver: int = Field(index=True)  # receiver account id
    amount: float = Field(index=True)
    created_at: datetime = Field(default=datetime.now())  # transaction date
    is_deleted: bool = Field(index=True, default=False)
    is_pending: bool = Field(index=True, default=True)

#*--------- Function Post ----------#

@router.on_event('startup')
@repeat_every(seconds=1)
async def verify_transaction(session=Depends(database.get_session)):
    statement = select(Transaction).where(Transaction.is_pending == True)
    transactions_to_send = session.exec(statement).all

    for transaction_to_send in transactions_to_send:
        if timedelta(seconds=20) + transaction_to_send.created_at <= datetime.now():
            transaction_to_send.is_pending == False
            session.add(transaction_to_send)
            session.commit()
            session.refresh()


@router.post("/transactions/")
def create_transaction(body: Transaction, session=Depends(database.get_session), user_info=Depends(user.get_user)):
    # Check if receiver account exists
    statement = select(Account).where(Account.id == body.receiver)  # Use Account class here
    receiver_account = session.exec(statement).first()  # Fetch first result

    if not receiver_account:
        raise HTTPException(status_code=404, detail="Receiver account does not exist")
    
    # check if receiver account is deleted
    if receiver_account.is_deleted :
        raise HTTPException(status_code=404, detail="Receiver account does not exist")

    # Check if sender account exists
    statement = select(Account).where(Account.id == body.sender)  # Use Account class here
    sender_account = session.exec(statement).first()  # Fetch first result

    if not sender_account:
        raise HTTPException(status_code=404, detail="Sender account does not exist")
    
    # check if sender account is deleted
    if sender_account.is_deleted :
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

@router.post("/my_transactions/")
def my_transactions(body: Account, session=Depends(database.get_session)):
    # Ensure the body contains a valid account ID
    if not body.id:
        raise HTTPException(status_code=400, detail="Account ID is required")

    # Fetch transactions where the account is the sender
    sender_statement = (
        select(Transaction)
        .where(Transaction.sender == body.id)
        .order_by(Transaction.created_at.desc())
    )
    sender_transactions = session.exec(sender_statement).all()

    # Fetch transactions where the account is the receiver
    receiver_statement = (
        select(Transaction)
        .where(Transaction.receiver == body.id)
        .order_by(Transaction.created_at.desc())
    )
    receiver_transactions = session.exec(receiver_statement).all()

    # Return the transactions organized in two separate lists
    return {
        "sent_transactions": [
            {
                "sender": transaction.sender,
                "receiver": transaction.receiver,
                "amount": transaction.amount,
                "created_at": transaction.created_at,
            }
            for transaction in sender_transactions
        ],
        "received_transactions": [
            {
                "sender": transaction.sender,
                "receiver": transaction.receiver,
                "amount": transaction.amount,
                "created_at": transaction.created_at,
            }
            for transaction in receiver_transactions
        ],
    }


@router.post("/transactions/")
def all_transactions(body: Transaction, session=Depends(database.get_session), user_info=Depends(user.get_user)):
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


from sqlalchemy import or_, and_

@router.post("/my_transactions/{id_transaction}")
def my_transaction(body: Account, id_transaction: int, user_info=Depends(user.get_user), session=Depends(database.get_session)):

    # vérifier que le compte appartient bien à l'utilisateur connecté
    
    # Ensure the body contains a valid account ID
    if not body.id==0 : # A CHANGER PARTOUT
        raise HTTPException(status_code=400, detail="Account ID is required")

    # Fetch transactions where conditions are met
    statement = (
        select(Transaction)
        .where(
            and_(
                Transaction.id == id_transaction,
                or_(
                    Transaction.sender == body.id,
                    Transaction.receiver == body.id
                )
            )
        )
    )
    transaction = session.exec(statement).first()

    # Check if a transaction was found
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Return the transaction
    return {
        "id": transaction.id,
        "sender": transaction.sender,
        "receiver": transaction.receiver,
        "amount": transaction.amount,
        "created_at": transaction.created_at,
    }



@router.post("/delete_transaction/")
def delete_transaction(body: Transaction, user_info=Depends(user.get_user), session=Depends(database.get_session)):
    # Fetch the user accounts
    user_account_statement = (
        select(Account)
        .where(Account.user_id == user_info["id"])
    )
    user_accounts = session.exec(user_account_statement).all()  # Convert to a list

    # Fetch the transaction
    statement = (
        select(Transaction)
        .where(Transaction.id == body.id)
    )
    transaction = session.exec(statement).first()  # Fetch the first matching transaction

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Return the accounts and transaction info for debugging
    infos = {
        "user_accounts": [{"id": account.id, "name": account.name} for account in user_accounts],
        "transaction": {
            "id": transaction.id,
            "sender": transaction.sender,
            "receiver": transaction.receiver,
            "amount": transaction.amount,
        },
    }

    # verify if transaction was made by user
    for account in user_accounts :
        if int(transaction.sender) == int(account.id) :
            # Fetch created_at from the transaction
            created_at = transaction.created_at

            # Ensure created_at is a datetime object
            if isinstance(created_at, str):
                # Convert string to datetime
                try:
                    created_at = datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")  # Adjust format as needed
                except ValueError as e:
                    raise HTTPException(status_code=400, detail=f"Invalid datetime format: {e}")

            if not Transaction.is_pending:
                receiver_account_statement = (
                select(Account)
                .where(Account.id == transaction.receiver)
            )
                receiver_account = session.exec(receiver_account_statement).first()

                receiver_account.balance -= transaction.amount 

                sender_account_statement = (
                select(Account)
                .where(Account.id == transaction.sender)
            )
                sender_account = session.exec(sender_account_statement).first()

                sender_account.balance += transaction.amount 



                transaction_to_update = session.exec(statement).first()
                transaction_to_update.is_deleted = True # update value

                session.add(transaction_to_update) # push to database
                session.commit()
                session.refresh(transaction_to_update)

                return {"message": "la transaction a bien été supprimée la 6T"}
            return  {"message": "Too late loser"}
        else :
            return {"message": "not your account"}