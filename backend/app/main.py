# backend/app/main.py
from fastapi import FastAPI
from app.router import router
from app.db.database import Base, engine
from contextlib import asynccontextmanager
from app.models import user_model
from dotenv import load_dotenv
from app.models import user_model, pooling_model
from fastapi.middleware.cors import CORSMiddleware
from app.models import user_model, pooling_model, profile_model
load_dotenv()
# This function will create the database tables.
def create_db_and_tables():
    Base.metadata.create_all(bind=engine)

# This is a "lifespan" event handler.
# The code within this "startup" event will run once, before the app starts receiving requests.
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    create_db_and_tables()
    print("Database tables created.")
    yield
    print("Shutting down...")

# Create the FastAPI app instance with the lifespan event handler
app = FastAPI(title="TripSync API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)
# Include the main router
app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "TripSync API is running!"}