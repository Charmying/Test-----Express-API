/**
 * 定義 API 基礎 URL 常數
 * 正式環境使用線上 API
 * 開發環境可取消註解使用本地 API
 */
// const apiUrl = 'https://test-express-api-x0j9.onrender.com';
const apiUrl = 'http://localhost:4000';

/**
 * 頁面載入時執行
 * 檢查用戶登入狀態並載入個人資料
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 從本地儲存取得 JWT token
  const token = localStorage.getItem('token');
  
  // 如果沒有 token 則導向登入頁面
  if (!token) {
    window.location.href = '../login/index.html';
    return;
  }

  try {
    // 從 token 中取得使用者 ID
    const userId = getUserIdFromToken(token);
    
    // 呼叫 API 取得使用者資料
    const response = await fetch(`${apiUrl}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    const data = await response.json();
    const messageDiv = document.getElementById('message');
    
    // 更新頁面顯示資料
    if (response.ok) {
      document.getElementById('account').innerText = data.account;
      document.getElementById('email').innerText = data.email;
      document.getElementById('userName').innerText = data.userName;
      document.getElementById('phone').innerText = data.phone;
      document.getElementById('address').innerText = data.address || '未填寫';
      document.getElementById('bio').innerText = data.bio || '未填寫';
      
      // 同步更新編輯表單的預設值
      document.getElementById('editUserName').value = data.userName;
      document.getElementById('editPhone').value = data.phone;
      document.getElementById('editAddress').value = data.address || '';
      document.getElementById('editBio').value = data.bio || '';
    } else {
      // 顯示錯誤訊息
      messageDiv.innerText = data.error || '無法載入資料';
    }
  } catch (error) {
    // 處理網路錯誤或其他例外
    document.getElementById('message').innerText = '錯誤：' + error.message;
  }
});

/**
 * 編輯按鈕點擊事件
 * 顯示編輯表單
 */
document.getElementById('editButton').addEventListener('click', () => {
  document.getElementById('editForm').style.display = 'block';
});

/**
 * 編輯表單提交處理
 * 儲存使用者資料變更
 */
document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // 防止表單預設提交行為
  
  // 從本地儲存取得 JWT token
  const token = localStorage.getItem('token');
  const userId = getUserIdFromToken(token);
  
  // 整理表單資料
  const formData = {
    userName: document.getElementById('editUserName').value,
    phone: document.getElementById('editPhone').value,
    address: document.getElementById('editAddress').value,
    bio: document.getElementById('editBio').value,
  };
  
  const messageDiv = document.getElementById('message');

  try {
    // 顯示載入中訊息
    messageDiv.innerText = '載入中...';
    
    // 呼叫 API 更新資料
    const response = await fetch(`${apiUrl}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    // 處理更新結果
    if (response.ok) {
      messageDiv.innerText = '資料更新成功';
      // 重新載入頁面以顯示更新後資料
      window.location.reload();
    } else {
      messageDiv.innerText = data.error || '更新失敗';
    }
  } catch (error) {
    // 處理網路錯誤或其他例外
    messageDiv.innerText = '錯誤：' + error.message;
  }
});

/**
 * 從JWT token 中提取使用者 ID
 * @param {string} token - JWT token
 * @returns {string} 使用者 ID
 */
function getUserIdFromToken(token) {
  // 解析 JWT 的 Payload 部分
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.userId;
}
