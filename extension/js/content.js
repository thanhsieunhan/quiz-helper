const API_URL = 'http://localhost:8000';

// Lưu trữ câu hỏi và đáp án
let questionDatabase = {};

// Hàm import câu hỏi từ trang web
async function importQuestions() {
  try {
    const questions = document.querySelectorAll('.q_item');
    let importedCount = 0;

    for (const question of questions) {
      // Lấy question_id từ id của thẻ div
      const questionId = question.id.replace('question_', '');
      const questionContent = question
        .querySelector('.q_content')
        .textContent.trim();
      const answers = Array.from(question.querySelectorAll('.aw_item')).map(
        (item) => {
          const answerContent = item
            .querySelector('.aw_content')
            .textContent.trim();
          const isCorrect = item.classList.contains('aw_true');
          return {
            content: answerContent,
            is_correct: isCorrect,
          };
        },
      );

      // Gửi câu hỏi lên server
      const response = await fetch(`${API_URL}/questions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: questionContent,
          question_id: questionId,
          answers: answers,
        }),
      });

      if (response.ok) {
        importedCount++;
      }
    }

    return {
      success: true,
      message: `Đã import thành công ${importedCount} câu hỏi`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Lỗi khi import câu hỏi: ${error.message}`,
    };
  }
}

// Hàm fill đáp án
async function fillAnswers() {
  try {
    const questions = document.querySelectorAll('.q_item');
    let filledCount = 0;

    for (const question of questions) {
      // Lấy question_id từ id của thẻ div
      const questionId = question.id.replace('question_', '');
      const questionContent = question
        .querySelector('.q_content')
        .textContent.trim();

      // Gửi câu hỏi lên server để lấy đáp án
      const response = await fetch(`${API_URL}/questions/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: questionContent,
          question_id: questionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const answers = data.answers;

        const answerElements = question.querySelectorAll('.aw_item');
        answerElements.forEach((element) => {
          const answerContent = element
            .querySelector('.aw_content')
            .textContent.trim();
          const correctAnswer = answers.find(
            (a) => a.content === answerContent,
          );

          if (correctAnswer && correctAnswer.is_correct) {
            const input = element.querySelector('input');
            if (input && !input.disabled) {
              input.click();
              filledCount++;
            }
          }
        });
      }
    }

    return {
      success: true,
      message: `Đã fill thành công ${filledCount} câu trả lời`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Lỗi khi fill đáp án: ${error.message}`,
    };
  }
}

// Lắng nghe tin nhắn từ popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'import') {
    importQuestions().then(sendResponse);
    return true;
  } else if (request.action === 'fill') {
    fillAnswers().then(sendResponse);
    return true;
  }
});
