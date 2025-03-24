# Test Helper Server

Server API cho Chrome extension hỗ trợ làm bài kiểm tra tự động.

## Cài đặt

1. Tạo môi trường ảo:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```

2. Cài đặt các thư viện:
```bash
pip install -r requirements.txt
```

3. Cấu hình biến môi trường:
- Copy file `.env.example` thành `.env`
- Điền các thông tin cần thiết trong file `.env`

## Chạy server

```bash
uvicorn app.main:app --reload
```

Server sẽ chạy tại `http://localhost:8000`

## API Endpoints

### 1. Tạo câu hỏi mới
- **URL**: `/questions/`
- **Method**: POST
- **Body**:
```json
{
    "content": "Nội dung câu hỏi",
    "answers": [
        {
            "content": "Đáp án A",
            "is_correct": true
        },
        {
            "content": "Đáp án B",
            "is_correct": false
        }
    ]
}
```

### 2. Lấy danh sách câu hỏi
- **URL**: `/questions/`
- **Method**: GET
- **Query Parameters**:
  - `skip`: Số câu hỏi bỏ qua (mặc định: 0)
  - `limit`: Số câu hỏi tối đa (mặc định: 100)

### 3. Kiểm tra câu hỏi
- **URL**: `/questions/check`
- **Method**: POST
- **Body**:
```json
{
    "content": "Nội dung câu hỏi cần kiểm tra"
}
```

### 4. Xóa câu hỏi
- **URL**: `/questions/{question_id}`
- **Method**: DELETE

## API Documentation

Truy cập `http://localhost:8000/docs` để xem tài liệu API đầy đủ. 