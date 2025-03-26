const API_URL = 'https://quiz.rikkei.online';
let currentPage = 1;
let currentPageSize = 10;

async function loadDatabase(page = 1) {
  try {
    const response = await fetch(
      `${API_URL}/questions/?page=${page}&page_size=${currentPageSize}`,
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
    const startIndex = (page - 1) * currentPageSize;

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

    // Thêm điều khiển số lượng câu hỏi mỗi trang
    const pageSizeControls = document.createElement('div');
    pageSizeControls.className = 'pagination-controls';
    pageSizeControls.innerHTML = `
      <label>Số câu hỏi mỗi trang:</label>
      <select id="pageSizeSelect">
        <option value="5">5</option>
        <option value="10" ${
          currentPageSize === 10 ? 'selected' : ''
        }>10</option>
        <option value="20" ${
          currentPageSize === 20 ? 'selected' : ''
        }>20</option>
        <option value="50" ${
          currentPageSize === 50 ? 'selected' : ''
        }>50</option>
      </select>
    `;
    pagination.appendChild(pageSizeControls);

    // Tạo nút Trang trước
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Trang trước';
    prevButton.disabled = page === 1;
    prevButton.addEventListener('click', () => changePage(page - 1));
    pagination.appendChild(prevButton);

    // Tạo danh sách các trang
    const pageList = document.createElement('div');
    pageList.className = 'page-list';

    // Hiển thị tối đa 5 trang xung quanh trang hiện tại
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(data.total_pages, startPage + maxVisiblePages - 1);

    // Điều chỉnh startPage nếu endPage đạt đến tổng số trang
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Thêm nút trang đầu
    if (startPage > 1) {
      const firstPageButton = document.createElement('button');
      firstPageButton.className = 'page-number';
      firstPageButton.textContent = '1';
      firstPageButton.addEventListener('click', () => changePage(1));
      pageList.appendChild(firstPageButton);

      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.margin = '0 5px';
        pageList.appendChild(ellipsis);
      }
    }

    // Thêm các nút trang
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.className = `page-number ${i === page ? 'active' : ''}`;
      pageButton.textContent = i;
      pageButton.addEventListener('click', () => changePage(i));
      pageList.appendChild(pageButton);
    }

    // Thêm nút trang cuối
    if (endPage < data.total_pages) {
      if (endPage < data.total_pages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.margin = '0 5px';
        pageList.appendChild(ellipsis);
      }

      const lastPageButton = document.createElement('button');
      lastPageButton.className = 'page-number';
      lastPageButton.textContent = data.total_pages;
      lastPageButton.addEventListener('click', () =>
        changePage(data.total_pages),
      );
      pageList.appendChild(lastPageButton);
    }

    pagination.appendChild(pageList);

    // Tạo nút Trang sau
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Trang sau';
    nextButton.disabled = page === data.total_pages;
    nextButton.addEventListener('click', () => changePage(page + 1));
    pagination.appendChild(nextButton);

    database.appendChild(pagination);

    // Thêm lại các event listeners cho các điều khiển mới
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    pageSizeSelect.addEventListener('change', function (e) {
      currentPageSize = parseInt(e.target.value);
      currentPage = 1; // Reset về trang 1 khi thay đổi số lượng
      loadDatabase(currentPage);
    });

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
});
