from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, create_engine, Field, SQLModel
import fastapi_utilities

from datetime import datetime

import database
import Class.account as account
import Class.transaction as transaction
import Class.user as user

app = FastAPI()
app.include_router(user.router)
app.include_router(account.router)
app.include_router(transaction.router)

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bienvenue chez pybank!"}

database.create_db_and_tables()


