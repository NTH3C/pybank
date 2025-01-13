from fastapi import FastAPI, Depends
from sqlmodel import Field, SQLModel
from datetime import datetime
from sqlmodel import Session, create_engine

app = FastAPI()

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

@app.get("/")
def read_root():
    return {"message": "Bienvenue chez pybank!"}

#*----------------------------------------------------------------

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# ----------------------------------------------------------------

class Account(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    balance: float = Field(index=True)
    user_id: int = Field(index=True)

class Transaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    sender: int = Field(index=True)
    receiver: int = Field(index=True)
    amount: float = Field(index=True)
    created_at: str = Field(default="1911/02/03", index=True) # VOIR SI CA MARCHE

# ----------------------------------------------------------------

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/accounts/")
def create_account(body: Account, session = Depends(get_session)) -> Account:
    account = Account(balance=body.balance, user_id=body.user_id)
    session.add(account)
    session.commit()
    session.refresh(account)
    return account