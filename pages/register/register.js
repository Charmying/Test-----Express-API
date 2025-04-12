/**
 * 定義 API 基礎 URL 常數
 * 正式環境使用線上 API
 * 開發環境可取消註解使用本地 API
 */
// const apiUrl = 'https://test-express-api-x0j9.onrender.com';
const apiUrl = 'http://localhost:4000';

/**
 * 註冊表單提交處理
 * 驗證資料並呼叫 API 註冊新使用者
 */
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  // 防止表單預設提交行為
  e.preventDefault();
  
  // 收集所有表單資料
  const formData = {
    account: document.getElementById('account').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value,
    userName: document.getElementById('userName').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    bio: document.getElementById('bio').value,
  };
  
  const messageDiv = document.getElementById('message');

  // 前端資料驗證
  // 檢查密碼與確認密碼是否一致
  if (formData.password !== formData.confirmPassword) {
    messageDiv.innerText = '密碼與確認密碼不一致';
    return;
  }
  
  // 檢查密碼長度
  if (formData.password.length < 6) {
    messageDiv.innerText = '密碼長度需至少 6 位';
    return;
  }

  try {
    // 顯示載入中訊息
    messageDiv.innerText = '載入中...';
    
    // 呼叫 API 進行註冊
    const response = await fetch(`${apiUrl}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    // 處理非成功回應
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '註冊失敗');
    }

    // 處理成功回應
    const data = await response.json();
    messageDiv.innerText = '註冊成功！請前往登入';
    
    // 2 秒後導向登入頁面
    setTimeout(() => (window.location.href = '../login/login.html'), 2000);
  } catch (error) {
    // 處理錯誤
    messageDiv.innerText = '錯誤：' + error.message;
  }
});
