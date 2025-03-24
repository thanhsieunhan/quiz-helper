// Khởi tạo storage khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ questionDatabase: {} });
});

// Lắng nghe tin nhắn từ content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDatabase') {
    chrome.storage.local.get(['questionDatabase'], (result) => {
      sendResponse(result);
    });
    return true;
  }
});

// Lắng nghe sự kiện khi tab được cập nhật
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Kiểm tra xem tab có phải là trang Rikkei hoặc file local không
  if (
    tab.url &&
    (tab.url.includes('rikkei.vn') || tab.url.startsWith('file://'))
  ) {
    // Kích hoạt extension
    chrome.action.enable(tabId);
  } else {
    // Vô hiệu hóa extension
    chrome.action.disable(tabId);
  }
});

// Lắng nghe sự kiện khi tab được kích hoạt
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    // Kiểm tra xem tab có phải là trang Rikkei hoặc file local không
    if (
      tab.url &&
      (tab.url.includes('rikkei.vn') || tab.url.startsWith('file://'))
    ) {
      // Kích hoạt extension
      chrome.action.enable(activeInfo.tabId);
    } else {
      // Vô hiệu hóa extension
      chrome.action.disable(activeInfo.tabId);
    }
  });
});
