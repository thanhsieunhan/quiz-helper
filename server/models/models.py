from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database.database import Base

class Question(Base):
    __tablename__ = "questions"

    question_id = Column(String(50), primary_key=True, index=True)  # ID từ trang web làm primary key
    content = Column(String(1000))

    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(1000))
    is_correct = Column(Boolean, default=False)
    question_id = Column(String(50), ForeignKey("questions.question_id"))  # Liên kết với question_id của Question

    question = relationship("Question", back_populates="answers") 