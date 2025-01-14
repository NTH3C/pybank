from fastapi import FastAPI, Depends
from sqlmodel import Session, create_engine, Field, SQLModel

from datetime import datetime

import database
import Class.account as account
import Class.transaction as transaction
import Class.user as user

app = FastAPI()
app.include_router(user.router)
app.include_router(account.router)
app.include_router(transaction.router)


@app.get("/")
def read_root():
    return {"message": "Bienvenue chez pybank!"}

database.create_db_and_tables()


