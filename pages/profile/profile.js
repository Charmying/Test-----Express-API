const API_URL = 'https://test-express-api-x0j9.onrender.com';
// const API_URL = 'http://localhost:4000';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../login/index.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/${getUserIdFromToken(token)}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    const messageDiv = document.getElementById('message');
    if (response.ok) {
      document.getElementById('account').innerText = data.account;
      document.getElementById('email').innerText = data.email;
      document.getElementById('userName').innerText = data.userName;
      document.getElementById('phone').innerText = data.phone;
      document.getElementById('address').innerText = data.address || '未填寫';
      document.getElementById('bio').innerText = data.bio || '未填寫';
    } else {
      messageDiv.innerText = data.error || '無法載入資料';
    }
  } catch (error) {
    document.getElementById('message').innerText = '錯誤：' + error.message;
  }
});

document.getElementById('editButton').addEventListener('click', () => {
  document.getElementById('editForm').style.display = 'block';
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const userId = getUserIdFromToken(token);
  const formData = {
    userName: document.getElementById('editUserName').value,
    phone: document.getElementById('editPhone').value,
    address: document.getElementById('editAddress').value,
    bio: document.getElementById('editBio').value,
  };
  const messageDiv = document.getElementById('message');

  try {
    messageDiv.innerText = '載入中...';
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      messageDiv.innerText = '資料更新成功';
      window.location.reload();
    } else {
      messageDiv.innerText = data.error || '更新失敗';
    }
  } catch (error) {
    messageDiv.innerText = '錯誤：' + error.message;
  }
});

// 從 JWT 中提取 userId
function getUserIdFromToken(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.userId;
}
