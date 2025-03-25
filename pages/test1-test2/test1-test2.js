const API_URL = 'https://test-express-api-x0j9.onrender.com';
let currentCollection = 'test1';

/** 初始化切換按鈕狀態 */
function switchCollection(collection) {
  currentCollection = collection;
  document.getElementById('test1Btn').className = '';
  document.getElementById('test2Btn').className = '';
  document.getElementById(`${collection}Btn`).className = 'active-collection';
  fetchData();
  clearForm();
}

/** 取得資料 */
async function fetchData() {
  try {
    const response = await fetch(`${API_URL}/${currentCollection}`);
    const data = await response.json();
    const tbody = document.getElementById('dataBody');
    tbody.innerHTML = '';
    data.forEach(item => {
      const row = `
        <tr>
          <td>
            <button onclick="editRecord('${item._id}')">編輯</button>
            <button onclick="deleteRecord('${item._id}')">刪除</button>
          </td>
          <td>${item.id}</td>
          <td>${item.userName}</td>
          <td>${item.email}</td>
          <td>${item.password}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error(error)
  }
}

/** 處理表單提交 */
async function handleSubmit(event) {
  event.preventDefault();
  const formData = {
    id: document.getElementById('id').value,
    userName: document.getElementById('userName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };
  const recordId = document.getElementById('recordId').value;
  const url = recordId ? `${API_URL}/${currentCollection}/${recordId}` : `${API_URL}/${currentCollection}`;
  try {
    const response = await fetch(url, {
      method: recordId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error('操作失敗');
    alert(`資料 ${ recordId ? '更新' : '新增' } 成功`);
    fetchData();
    clearForm();
  } catch (error) {
    alert(`發生錯誤: ${error.message}`);
  }
}

/** 編輯資料 */
async function editRecord(recordId) {
  try {
    const response = await fetch(`${API_URL}/${currentCollection}/${recordId}`);
    const data = await response.json();
    document.getElementById('recordId').value = data._id;
    document.getElementById('id').value = data.id;
    document.getElementById('userName').value = data.userName;
    document.getElementById('email').value = data.email;
    document.getElementById('password').value = data.password;
  } catch (error) {
    console.error(error)
  }
}

/** 刪除資料 */
async function deleteRecord(recordId) {
  if (!confirm('確定要刪除這筆資料嗎')) return;
  try {
    const response = await fetch(`${API_URL}/${currentCollection}/${recordId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('刪除失敗');
    alert('資料刪除成功');
    fetchData();
  } catch (error) {
    alert('刪除失敗: ', error.message);
  }
}

/** 清除表單 */
function clearForm() {
  document.getElementById('dataForm').reset();
  document.getElementById('recordId').value = '';
}

/** 初始化載入資料 */
fetchData();
