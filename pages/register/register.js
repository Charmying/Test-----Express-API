const API_URL = 'https://test-express-api-x0j9.onrender.com';
// const API_URL = 'http://localhost:4000';


document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
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

  // 前端驗證
  if (formData.password !== formData.confirmPassword) {
    messageDiv.innerText = '密碼與確認密碼不一致';
    return;
  }
  if (formData.password.length < 6) {
    messageDiv.innerText = '密碼長度需至少 6 位';
    return;
  }

  try {
    messageDiv.innerText = '載入中...';
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '註冊失敗');
    }

    const data = await response.json();
    messageDiv.innerText = '註冊成功！請前往登入';
    setTimeout(() => (window.location.href = '../login/index.html'), 2000);
  } catch (error) {
    messageDiv.innerText = '錯誤：' + error.message;
  }
});
