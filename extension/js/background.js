import config from './config.js';

const API_URL = config.API_URL;

// Khởi tạo storage khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ questionDatabase: {} });
});

// Lắng nghe tin nhắn từ popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'import') {
    importQuestions(request.tabId)
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({
          success: false,
          message: `Lỗi khi import câu hỏi: ${error.message}`,
        });
      });
    return true; // Giữ kết nối cho async response
  } else if (request.action === 'fill') {
    fillAnswers(request.tabId)
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({
          success: false,
          message: `Lỗi khi fill đáp án: ${error.message}`,
        });
      });
    return true; // Giữ kết nối cho async response
  } else if (request.action === 'getDatabase') {
    chrome.storage.local.get(['questionDatabase'], (result) => {
      sendResponse(result);
    });
    return true;
  }
});

// Hàm import câu hỏi từ trang web
async function importQuestions(tabId) {
  try {
    // Lấy dữ liệu câu hỏi từ trang web
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        const questions = document.querySelectorAll('.q_item');
        return Array.from(questions).map((question) => {
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

          return {
            questionId,
            content: questionContent,
            answers,
          };
        });
      },
    });

    const questions = result[0].result;
    let importedCount = 0;

    for (const question of questions) {
      const response = await fetch(`${API_URL}/questions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: question.content,
          question_id: question.questionId,
          answers: question.answers,
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
async function fillAnswers(tabId) {
  try {
    // Lấy dữ liệu câu hỏi từ trang web
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        const questions = document.querySelectorAll('.q_item');
        return Array.from(questions).map((question) => {
          const questionId = question.id.replace('question_', '');
          const questionContent = question
            .querySelector('.q_content')
            .textContent.trim();
          return {
            questionId,
            content: questionContent,
          };
        });
      },
    });

    const questions = result[0].result;
    let filledCount = 0;

    for (const question of questions) {
      const response = await fetch(`${API_URL}/questions/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: question.content,
          question_id: question.questionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const answers = data.answers;

        // Fill đáp án vào trang web
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: (questionId, answers) => {
            const question = document.querySelector(`#question_${questionId}`);
            if (question) {
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
                  }
                }
              });
            }
          },
          args: [question.questionId, answers],
        });
        filledCount++;
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

// Lắng nghe sự kiện khi tab được cập nhật
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    tab.url &&
    (tab.url.includes('rikkei.vn') || tab.url.startsWith('file://'))
  ) {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
});

// Lắng nghe sự kiện khi tab được kích hoạt
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (
      tab.url &&
      (tab.url.includes('rikkei.vn') || tab.url.startsWith('file://'))
    ) {
      chrome.action.enable(activeInfo.tabId);
    } else {
      chrome.action.disable(activeInfo.tabId);
    }
  });
});
