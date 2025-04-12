/**
 * 定義 API 基礎 URL 常數
 * 正式環境使用線上 API
 * 開發環境可取消註解使用本地 API
 */
// const apiUrl = 'https://test-express-api-x0j9.onrender.com';
const apiUrl = 'http://localhost:4000';

/**
 * 登入表單提交處理
 * 連接後端 API 進行身分驗證
 */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  // 防止表單預設提交行為
  e.preventDefault();
  
  // 取得使用者輸入
  const account = document.getElementById('account').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');

  try {
    // 顯示載入中訊息
    messageDiv.innerText = '載入中...';
    
    // 呼叫登入 API
    const response = await fetch(`${apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, password }),
    });
    
    // 解析回應資料
    const data = await response.json();
    
    // 處理登入結果
    if (response.ok) {
      messageDiv.innerText = '登入成功！';
      // 將 JWT token 存入本地儲存
      localStorage.setItem('token', data.token);
      // 1 秒後導向個人資料頁面
      setTimeout(() => (window.location.href = '../profile/profile.html'), 1000);
    } else {
      // 顯示錯誤訊息
      messageDiv.innerText = data.error || '登入失敗';
    }
  } catch (error) {
    // 處理網路錯誤或其他例外
    messageDiv.innerText = '錯誤：' + error.message;
  }
});
