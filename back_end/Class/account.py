import database
import Class.user as user

from fastapi import FastAPI, Depends, APIRouter, HTTPException
from sqlmodel import Session, create_engine, Field, SQLModel, select
from pydantic import BaseModel
from datetime import datetime


router = APIRouter(tags=["Accounts"])


#*--------- Class ----------#

class Account(SQLModel, BaseModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    balance: float = Field(index=True)
    name: str = Field(index=True, nullable=False)
    user_id: int = Field(index=True)
    type: str = Field(index=True, nullable=False) 
    created_at: datetime = Field(default=datetime.now())
    is_main: bool = Field(index=True)
    is_deleted: bool = Field(index=True)


class DepositTransaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    account_id: int = Field(index=True)
    amount: float = Field(index=True)
    created_at: datetime = Field(default=datetime.now())

class Deposit(BaseModel):
    account_id: int
    amount: float
    
class CreateAccount(BaseModel):
    name: str
    type: str 



#*--------- App post ----------#

def create_account_for_user(user_id: int, balance: float = 100) -> Account:
    account = Account(balance=balance, name="Main_account", user_id=user_id, is_main = True, is_deleted= False)
    return account



@router.post("/accounts/")
def create_account(
    body: CreateAccount, user_info=Depends(user.get_user), session=Depends(database.get_session)
) -> Account:
    if user_info:
        if body.type not in ["Epargne", "Courant"]:
            raise HTTPException(400, "Type de compte invalide. Choisissez Épargne ou Courant.")
        
        account = Account(
            balance=0,
            name=body.name,
            user_id=user_info["id"],
            type=body.type,  
            is_main=False,
            is_deleted=False,
        )
        session.add(account)
        session.commit()
        session.refresh(account)
        return account
    raise HTTPException(401, "Veuillez vous connecter.")


@router.post("/my_account/{account_id}")
def my_account(account_id: int, user_info=Depends(user.get_user), session=Depends(database.get_session)):
    statement = select(Account).where(Account.id == account_id, Account.user_id == user_info["id"])  # if account exists and is linked to currently logged in email user
    account = session.exec(statement).first()  # fetch first result

    if not account.is_deleted : 
        return {"account id" : account.id, "account id" : account.name}
    else :
        return {"message" : "un compte supprimé ne peut plus être consulté. crasseux."}


@router.post("/my_accounts")
def my_accounts(user_info=Depends(user.get_user), session=Depends(database.get_session)):
    # Fetch all accounts linked to the user_id
    statement = (
        select(Account)
        .where(Account.user_id == user_info["id"])
        .order_by(Account.created_at.desc())
    )
    accounts = session.exec(statement).all()  # Fetch all matching accounts
    
    if accounts :
        return {
            "accounts": [
                {
                    "id": account.id,  # Return the account id
                    "name": account.name,  # Return the account name
                    "created at": account.created_at,  # Return the account creation date
                    "balance": account.balance  # Return the account balance
                }
                for account in accounts if not account.is_deleted
            ]
        }
    else :
        return {"message" : "You dont have da account please contact tech support"}

#*-----------------------------#

@router.post("/deposit/")
def deposit_money(body: Deposit, user_info=Depends(user.get_user), session=Depends(database.get_session)):
    if user_info:
        if body.amount <= 0:
            raise HTTPException(400, "The amount must be positive")
        
        account = session.get(Account, body.account_id)
        if not account or account.user_id != user_info["id"]:
            raise HTTPException(404, "account not found")
        
        account.balance += body.amount
        session.add(account)
        session.commit()
        session.refresh(account)
        
        transaction = DepositTransaction(account_id=account.id, amount=body.amount, created_at=datetime.now())
        session.add(transaction)
        session.commit()
        return {"message": "Deposit successfully completed.", "new_balance": account.balance}
    raise HTTPException(401, "Please login")



@router.post("/delete_account/")
def delete_account(body: Account, user_info=Depends(user.get_user), session=Depends(database.get_session)):
    # Fetch the account
    statement = (
        select(Account)
        .where(Account.id == body.id)
    )
    account_to_update = session.exec(statement).first()  # Fetch the first matching account

    if not account_to_update:
        raise HTTPException(status_code=404, detail="Account not found")

    # Verify if account belongs to user
    if account_to_update.user_id == user_info["id"]:
        if not account_to_update.is_main:

            if account_to_update.balance > 0:
                # Fetch the main account fully
                statement = (
                    select(Account)
                    .where(Account.user_id == user_info["id"], Account.is_main == True)
                )
                main_account = session.exec(statement).first()  # Fetch the first matching account

                if main_account:
                    # Transfer the remaining balance to the main account
                    from Class.transaction import Transaction
                    transaction = Transaction(sender=body.id, receiver=main_account.id, amount=account_to_update.balance)
                    session.add(transaction)
                    session.commit()
                    session.refresh(transaction)

                    # Update main account balance
                    main_account.balance += account_to_update.balance
                    session.add(main_account)
                    session.commit()
                    session.refresh(main_account)
                else:
                    raise HTTPException(status_code=404, detail="Main account not found")

            # Set account balance to 0 and mark as deleted
            account_to_update.balance = 0
            account_to_update.is_deleted = True
            session.add(account_to_update)
            session.commit()
            session.refresh(account_to_update)

            return {"message": "Account successfully deleted."}
        else:
            return {"message": "You cannot delete the main account."}
    else:
        return {"message": "You are not authorized to delete this account."}
