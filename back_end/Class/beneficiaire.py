import database
import Class.user as user
import Class.account as account

from fastapi import FastAPI, Depends, APIRouter, HTTPException
from sqlmodel import Session, create_engine, Field, SQLModel, select
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(tags=["Beneficiaires"])

class Beneficiaires (SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    account_id: int = Field(index=True)
    user_id: int = Field(index=True)

class AddBeneficiaires (BaseModel):
    name: str = Field(index=True, nullable=False)
    account_id: int = Field(index=True)


#*--------- app post ----------#


@router.post("/add_beneficaire")
def add_beneficiaire(
    body:AddBeneficiaires, user_info=Depends(user.get_user), session=Depends(database.get_session)) -> Beneficiaires:

    if not user_info:
        raise HTTPException(401, "Veuillez vous connecter.")
    
    statement = select(account.Account.id).where(account.Account.id == body.account_id)
    account_id = session.exec(statement).first()

    if not account_id:
        raise HTTPException(404, "account not found")

    beneficiaire = Beneficiaires(
    name=body.name,
    account_id=body.account_id,
    user_id=user_info["id"]

    )
    session.add(beneficiaire)
    session.commit()
    session.refresh(beneficiaire)
    return beneficiaire    

#*--------- app get ----------#
    
@router.get("/beneficiaires")
def get_beneficiaire(user_info=Depends(user.get_user), session=Depends(database.get_session)):
    
    if not user_info:
        raise HTTPException(401, "Veuillez vous connecter.")
    
    statement = (
        select(Beneficiaires)
        .where(Beneficiaires.user_id == user_info["id"])
        )
    
    beneficiaires = session.exec(statement).all()

    if beneficiaires :
        return {
            "beneficiaires": [
                {
                    "id": beneficiaire.account_id,
                    "name": beneficiaire.name,
                }
                for beneficiaire in beneficiaires
            ]
        }
    else :
        return {"message" : "You dont have any beneficiaires"}