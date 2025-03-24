const API_URL = 'https://quiz.rikkei.online';
const PAGE_SIZE = 10;
let currentPage = 1;

async function loadDatabase(page = 1) {
  try {
    const response = await fetch(
      `${API_URL}/questions/?page=${page}&page_size=${PAGE_SIZE}`,
    );
    if (!response.ok) {
      throw new Error('Không thể kết nối đến server');
    }
    const data = await response.json();

    // Cập nhật thống kê
    document.getElementById('totalQuestions').textContent = data.total;
    document.getElementById('lastUpdate').textContent =
      new Date().toLocaleString('vi-VN');

    // Hiển thị danh sách câu hỏi
    const database = document.getElementById('database');
    database.innerHTML = '';

    if (data.questions.length === 0) {
      database.innerHTML = '<p>Chưa có câu hỏi nào trong database</p>';
      return;
    }

    // Tính số thứ tự bắt đầu cho trang hiện tại
    const startIndex = (page - 1) * PAGE_SIZE;

    data.questions.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question-item';
      questionDiv.innerHTML = `
        <p><strong>${startIndex + index + 1}. Câu hỏi:</strong> ${
        question.content
      }</p>
        <p><strong>ID:</strong> ${question.question_id}</p>
        <p><strong>Đáp án:</strong></p>
        <ul>
          ${question.answers
            .map(
              (answer) =>
                `<li class="${answer.is_correct ? 'correct' : ''}">${
                  answer.content
                }</li>`,
            )
            .join('')}
        </ul>
      `;
      database.appendChild(questionDiv);
    });

    // Hiển thị phân trang
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    // Tạo nút Trang trước
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Trang trước';
    prevButton.disabled = page === 1;
    prevButton.addEventListener('click', () => changePage(page - 1));
    pagination.appendChild(prevButton);

    // Tạo span hiển thị số trang
    const pageSpan = document.createElement('span');
    pageSpan.textContent = `Trang ${page} / ${data.total_pages}`;
    pagination.appendChild(pageSpan);

    // Tạo nút Trang sau
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Trang sau';
    nextButton.disabled = page === data.total_pages;
    nextButton.addEventListener('click', () => changePage(page + 1));
    pagination.appendChild(nextButton);

    database.appendChild(pagination);
  } catch (error) {
    document.getElementById(
      'database',
    ).innerHTML = `<p style="color: red;">Lỗi khi tải database: ${error.message}</p>`;
  }
}

// Hàm chuyển trang
function changePage(page) {
  if (page < 1) return;
  currentPage = page;
  loadDatabase(page);
}

// Tải database khi trang được mở
document.addEventListener('DOMContentLoaded', () => {
  loadDatabase(currentPage);

  // Thêm sự kiện lắng nghe cho thanh tìm kiếm
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const questions = document.querySelectorAll('.question-item');

    questions.forEach((question) => {
      const questionText = question.textContent.toLowerCase();
      if (questionText.includes(searchTerm)) {
        question.style.display = 'block';
      } else {
        question.style.display = 'none';
      }
    });
  });
});
