from fastapi import FastAPI, Depends
from sqlmodel import Session, create_engine, Field, SQLModel
import fastapi_utilities
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

import database
import Class.account as account
import Class.transaction as transaction
import Class.user as user

app = FastAPI()
app.include_router(user.router)
app.include_router(account.router)
app.include_router(transaction.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bienvenue chez pybank!"}



database.create_db_and_tables()


