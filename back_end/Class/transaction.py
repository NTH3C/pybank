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
async def verify_transaction():
    with Session(database.engine) as session:
        statement = select(Transaction).where(Transaction.is_pending == True)
        transactions_to_send = session.exec(statement).all()  # Make sure to call .all()
        
        for transaction_to_send in transactions_to_send:
            # Ensure transaction_to_send.created_at is a datetime object
            
            if transaction_to_send.created_at + timedelta(seconds=5) >= datetime.now():
                transaction_to_send.is_pending = False  # Use assignment instead of comparison
                session.add(transaction_to_send)
                session.commit()
                session.refresh(transaction_to_send)  # Refresh the specific object
                

@router.post("/make-transaction/")
def create_transaction(body: Transaction, session=Depends(database.get_session), user_info=Depends(user.get_user)):
    """
    Make a new transaction
    """
    # Check if sender account exists
    statement = select(Account).where(Account.id == body.sender)  # Use Account class here
    sender_account = session.exec(statement).first()  # Fetch first result
    # Check if sender account is currently connected user
    if sender_account.user_id != user_info["id"]:
        raise HTTPException(status_code=400, detail="Not your account DUH")
    # Check if sender account exists
    if not sender_account:
        raise HTTPException(status_code=404, detail="Sender account does not exist")
    # check if sender account is deleted
    if sender_account.is_deleted :
        raise HTTPException(status_code=404, detail="Sender account does not exist")
    

    # Check if receiver account exists
    statement = select(Account).where(Account.id == body.receiver)  # Use Account class here
    receiver_account = session.exec(statement).first()  # Fetch first result
    # check if receiver account exists
    if not receiver_account:
        raise HTTPException(status_code=404, detail="Receiver account does not exist")
    # check if receiver account is deleted
    if receiver_account.is_deleted :
        raise HTTPException(status_code=404, detail="Receiver account does not exist")


    # Validate transaction details
    if body.receiver == body.sender:
        raise HTTPException(status_code=400, detail="Cannot send money to the same account")
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Transaction amount must be greater than zero")
    
    # Check if sufficient balance
    if sender_account.balance < body.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Check if the receiver's balance will exceed 50,000
    if receiver_account.balance + body.amount > 50000:
        difference = receiver_account.balance + body.amount - 50000

        # Fetch the receiver's main account
        statement = select(Account).where(and_(Account.user_id == receiver_account.user_id, Account.is_main == True))
        receiver_main_account = session.exec(statement).first()

        if not receiver_main_account:
            raise HTTPException(status_code=404, detail="Receiver's main account not found")

        # Create a transaction for the difference
        transaction_diff = Transaction(
            sender=body.sender,
            receiver=receiver_main_account.id,
            amount=difference
        )
        session.add(transaction_diff)
        session.commit()
        session.refresh(transaction_diff)

        # Update balances
        receiver_main_account.balance += difference
        receiver_account.balance = 50000
        sender_account.balance -= body.amount

        session.add(receiver_main_account)
        session.add(receiver_account)
        session.add(sender_account)
        session.commit()

        return {
            "message": "Transaction successfully completed.",
            "sender_account_balance": sender_account.balance,
            "receiver_account_balance": receiver_account.balance,
            "receiver_main_account_balance": receiver_main_account.balance if receiver_account.balance == 50000 else None
        }
    else:
        # Normal transaction
        transaction = Transaction(
            sender=body.sender,
            receiver=body.receiver,
            amount=body.amount
        )
        session.add(transaction)
        session.commit()
        session.refresh(transaction)

        # Update balances
        sender_account.balance -= body.amount
        receiver_account.balance += body.amount

        session.add(sender_account)
        session.add(receiver_account)
        session.commit()

        return {
            "message": "Transaction successfully completed.",
            "sender_account_balance": sender_account.balance,
            "receiver_account_balance": receiver_account.balance,
        }













@router.get("/{account_id}/transactions/")
def my_transactions(account_id: int, session=Depends(database.get_session), user_info=Depends(user.get_user)):
    '''
    Get all transactions made or received through current account.
    '''
    if not user_info:
        raise HTTPException(401, "Please login")

    if account_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid account ID")

    # Fetch transactions where the account is the sender
    sender_statement = (
        select(Transaction)
        .where(Transaction.sender == account_id)
        .order_by(Transaction.created_at.desc())
    )
    sender_transactions = session.exec(sender_statement).all()

    # Fetch transactions where the account is the receiver
    receiver_statement = (
        select(Transaction)
        .where(Transaction.receiver == account_id)
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




















from sqlalchemy import or_, and_

@router.post("/transactions/{id_transaction}")
def my_transaction(body: Account, id_transaction: int, user_info=Depends(user.get_user), session=Depends(database.get_session)):
    """
    Get detail on 1 transaction
    """
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
    """
    Delete a transaction
    """
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

            if Transaction.is_pending:
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
        











@router.get("/all-transactions/")
def my_transactions(user_info=Depends(user.get_user), session=Depends(database.get_session)):
    """
    Returns all transactions of a user.
    """
    if not user_info:
        raise HTTPException(status_code=401, detail="Please login")

    # Fetch all account IDs for the user
    statement = (
        select(Account.id)
        .where(Account.user_id == user_info["id"])
        .order_by(Account.created_at.desc())
    )
    account_ids = session.exec(statement).all()  # List of account IDs

    if not account_ids:
        return {"message": "No accounts found for the user."}
    
    # Flatten the list of account IDs
    statement_account_ids = [account_id for account_id in account_ids]

    # Fetch all transactions where the user's accounts are either the sender or receiver TOUTES LES TRANSACTIONS DU MECS DE TOUS SES COMPTES
    statement = (
        select(Transaction)
        .where(
            or_(
                Transaction.sender.in_(statement_account_ids),
                Transaction.receiver.in_(statement_account_ids)
            )
        )
        .order_by(Transaction.created_at.desc())
    )
    all_transactions = session.exec(statement).all()

    # Separate transactions into sent and received
    transactions = []

    for transaction in all_transactions:

        # CAS TRANSFERT ENTRE LES COMPTES APPARTENANT A L'UTILISATEUR
        if (transaction.sender in statement_account_ids) and (transaction.receiver in statement_account_ids) :
            transactions.append({
                "id": transaction.id,
                "amount": transaction.amount,
                "sender": transaction.sender,
                "receiver": transaction.receiver,
                "created_at": transaction.created_at,
                "transfer" : True,
                "revenue" : False
            }) 

        # s'il est l'envoyeur de la transaction
        elif transaction.sender in statement_account_ids:
            transactions.append({
                "id": transaction.id,
                "amount": transaction.amount,
                "sender": transaction.sender,
                "receiver": transaction.receiver,
                "created_at": transaction.created_at,
                "transfer" : False,
                "revenue" : False
            })
        
        # s'il est le receveur de la transaction
        elif transaction.receiver in statement_account_ids:
            transactions.append({
                "id": transaction.id,
                "amount": transaction.amount,
                "sender": transaction.sender,
                "receiver": transaction.receiver,
                "created_at": transaction.created_at,
                "transfer" : False,
                "revenue" : True
            })

    # Return the separated transactions
    [] 
    return {
        "transactions": transactions
    }






@router.get("/all-transactions/{amount}")
def my_filtered_transactions(amount: float, user_info=Depends(user.get_user), session=Depends(database.get_session)):
    """
    Returns all transactions of a user (filtered by amount).
    """
    if not user_info:
        raise HTTPException(status_code=401, detail="Please login")

    # Fetch all account IDs for the user
    statement = (
        select(Account.id)
        .where(Account.user_id == user_info["id"])
        .order_by(Account.created_at.desc())
    )
    account_ids = session.exec(statement).all()  # List of account IDs

    if not account_ids:
        return {"message": "No accounts found for the user."}
    
    # Flatten the list of account IDs
    statement_account_ids = [account_id for account_id in account_ids]

    # Fetch all transactions where the user's accounts are either the sender or receiver
    statement = (
        select(Transaction)
        .where(
            or_(
                Transaction.sender.in_(statement_account_ids),
                Transaction.receiver.in_(statement_account_ids)
            ),
            Transaction.amount == amount  # Filter by amount
        )
        .order_by(Transaction.created_at.desc())
    )
    all_transactions = session.exec(statement).all()

    # Separate transactions into sent and received
    transactions = []

    for transaction in all_transactions:

        # CAS TRANSFERT ENTRE LES COMPTES APPARTENANT A L'UTILISATEUR
        if (transaction.sender in statement_account_ids) and (transaction.receiver in statement_account_ids) :
            transactions.append({
                "id": transaction.id,
                "amount": transaction.amount,
                "sender": transaction.sender,
                "receiver": transaction.receiver,
                "created_at": transaction.created_at,
                "transfer" : True,
                "revenue" : False
            })

        # s'il est l'envoyeur de la transaction
        elif transaction.sender in statement_account_ids:
            transactions.append({
                "id": transaction.id,
                "amount": transaction.amount,
                "sender": transaction.sender,
                "receiver": transaction.receiver,
                "created_at": transaction.created_at,
                "transfer" : False,
                "revenue" : False
            })
        
        # s'il est le receveur de la transaction
        elif transaction.receiver in statement_account_ids:
            transactions.append({
                "id": transaction.id,
                "amount": transaction.amount,
                "sender": transaction.sender,
                "receiver": transaction.receiver,
                "created_at": transaction.created_at,
                "transfer" : False,
                "revenue" : True
            })

    # Return the separated transactions
    return {
        "transactions": transactions
    }
