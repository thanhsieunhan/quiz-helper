from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models.models as models
import models.schemas as schemas
from database.database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware
import logging

# Cấu hình logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Tạo database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong môi trường production, nên giới hạn origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/questions/", response_model=schemas.Question)
def create_question(question: schemas.QuestionRequest, db: Session = Depends(get_db)):
    try:
        logger.debug(f"Received question data: {question}")
        
        # Kiểm tra câu hỏi đã tồn tại chưa
        db_question = db.query(models.Question).filter(
            (models.Question.content == question.content) | 
            (models.Question.question_id == question.question_id)
        ).first()
        
        if db_question:
            logger.info(f"Question already exists with ID: {db_question.question_id}")
            return db_question

        # Tạo câu hỏi mới
        logger.debug("Creating new question")
        db_question = models.Question(
            content=question.content,
            question_id=question.question_id
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)

        # Thêm các đáp án
        logger.debug(f"Adding {len(question.answers)} answers")
        for answer in question.answers:
            try:
                logger.debug(f"Processing answer: {answer}")
                db_answer = models.Answer(
                    content=answer.content,
                    is_correct=answer.is_correct,
                    question_id=db_question.question_id
                )
                db.add(db_answer)
            except Exception as e:
                logger.error(f"Error adding answer: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Lỗi khi thêm đáp án: {str(e)}")

        db.commit()
        logger.info(f"Successfully created question with ID: {db_question.question_id}")
        return db_question

    except Exception as e:
        logger.error(f"Error creating question: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/questions/", response_model=schemas.QuestionList)
def read_questions(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    question_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        # Tạo query cơ bản
        query = db.query(models.Question)
        
        # Thêm điều kiện tìm kiếm nếu có
        if search:
            query = query.filter(models.Question.content.ilike(f"%{search}%"))
        if question_id:
            query = query.filter(models.Question.question_id.ilike(f"%{question_id}%"))
        
        # Lấy tổng số câu hỏi sau khi lọc
        total = query.count()
        
        # Tính toán offset
        offset = (page - 1) * page_size
        
        # Lấy danh sách câu hỏi với phân trang và sắp xếp theo question_id
        questions = query.order_by(models.Question.question_id).offset(offset).limit(page_size).all()
        
        # Tính tổng số trang
        total_pages = (total + page_size - 1) // page_size
        
        return {
            "questions": questions,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error reading questions: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/questions/check", response_model=schemas.Question)
def check_question(question: schemas.QuestionCheckRequest, db: Session = Depends(get_db)):
    try:
        logger.debug(f"Checking question: {question}")
        db_question = db.query(models.Question).filter(
            (models.Question.question_id == question.question_id) |
            (models.Question.content == question.content)
        ).first()
        
        if not db_question:
            logger.warning(f"Question not found: {question}")
            raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")
            
        logger.info(f"Found question with ID: {db_question.question_id}")
        return db_question
    except Exception as e:
        logger.error(f"Error checking question: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    try:
        logger.debug(f"Deleting question with ID: {question_id}")
        db_question = db.query(models.Question).filter(models.Question.question_id == question_id).first()
        if not db_question:
            logger.warning(f"Question not found with ID: {question_id}")
            raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")
            
        db.delete(db_question)
        db.commit()
        logger.info(f"Successfully deleted question with ID: {question_id}")
        return {"message": "Đã xóa câu hỏi thành công"}
    except Exception as e:
        logger.error(f"Error deleting question: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e)) 