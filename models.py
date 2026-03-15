import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    documents = relationship("Document", back_populates="owner")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    paper_id = Column(String, unique=True, index=True) # UUID
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    summary_text = Column(Text, nullable=True) # Store the generated summary
    
    owner = relationship("User", back_populates="documents")
