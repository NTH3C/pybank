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


origins = [        
    "*",       
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     #Users allowed to use API
    allow_credentials=True,    
    allow_methods=["*"],       #Allow all methods
    allow_headers=["*"],       #Allow all headers
)

# Include route
app.include_router(user.router)
app.include_router(account.router)
app.include_router(transaction.router)


@app.get("/")
def read_root():
    return {"message": "Bienvenue chez pybank!"}


# Création des tables et base de données
database.create_db_and_tables()
