const API_URL = 'https://test-express-api-x0j9.onrender.com';
// const API_URL = 'http://localhost:4000';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const account = document.getElementById('account').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');

  try {
    // 顯示載入提示
    messageDiv.innerText = '載入中...';
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, password }),
    });
    const data = await response.json();
    if (response.ok) {
      messageDiv.innerText = '登入成功！';
      // 儲存 JWT
      localStorage.setItem('token', data.token);
      setTimeout(() => (window.location.href = '../profile/profile.html'), 1000);
    } else {
      messageDiv.innerText = data.error || '登入失敗';
    }
  } catch (error) {
    messageDiv.innerText = '錯誤：' + error.message;
  }
});
