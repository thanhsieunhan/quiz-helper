from pydantic import BaseModel
from typing import List, Optional

class AnswerBase(BaseModel):
    content: str
    is_correct: bool

class AnswerCreate(AnswerBase):
    pass

class Answer(AnswerBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    content: str
    question_id: str

class QuestionRequest(QuestionBase):
    answers: List[AnswerBase]

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    answers: List[Answer]

    class Config:
        from_attributes = True

class QuestionList(BaseModel):
    questions: List[Question]
    total: int
    page: int
    page_size: int
    total_pages: int