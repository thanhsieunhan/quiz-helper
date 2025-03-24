const API_URL = 'http://localhost:8000';

// Hàm hiển thị trạng thái
function showStatus(success, message) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = success ? 'success' : 'error';
}

// Hàm cập nhật thống kê
async function updateStats() {
  try {
    const response = await fetch(`${API_URL}/questions/`);
    if (!response.ok) {
      throw new Error('Không thể kết nối đến server');
    }
    const data = await response.json();
    document.getElementById('totalQuestions').textContent = data.length;
    document.getElementById('lastUpdate').textContent =
      new Date().toLocaleString('vi-VN');
  } catch (error) {
    console.error('Lỗi khi cập nhật thống kê:', error);
  }
}

// Hàm xem database
async function viewDatabase() {
  try {
    const response = await fetch(`${API_URL}/questions/`);
    if (!response.ok) {
      throw new Error('Không thể kết nối đến server');
    }
    const data = await response.json();
    const database = document.getElementById('database');
    database.innerHTML = '';

    if (data.length === 0) {
      database.innerHTML = '<p>Chưa có câu hỏi nào trong database</p>';
      return;
    }

    data.forEach((question) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question-item';
      questionDiv.innerHTML = `
        <p><strong>Câu hỏi:</strong> ${question.content}</p>
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
  } catch (error) {
    showStatus(false, 'Lỗi khi xem database: ' + error.message);
  }
}

// Khởi tạo các sự kiện khi popup được mở
document.addEventListener('DOMContentLoaded', () => {
  const importBtn = document.getElementById('importBtn');
  const fillBtn = document.getElementById('fillBtn');
  const viewBtn = document.getElementById('viewBtn');

  // Cập nhật thống kê khi popup mở
  updateStats();

  importBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        throw new Error('Không tìm thấy tab đang mở');
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'import',
      });

      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }

      showStatus(response.success, response.message);
      if (response.success) {
        updateStats();
      }
    } catch (error) {
      showStatus(false, 'Lỗi khi import câu hỏi: ' + error.message);
    }
  });

  fillBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        throw new Error('Không tìm thấy tab đang mở');
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'fill',
      });

      if (chrome.runtime.lastError) {
        throw new Error(chrome.runtime.lastError.message);
      }

      showStatus(response.success, response.message);
    } catch (error) {
      showStatus(false, 'Lỗi khi fill đáp án: ' + error.message);
    }
  });

  viewBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'database.html' });
  });
});
