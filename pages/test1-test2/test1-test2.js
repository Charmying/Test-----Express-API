/**
 * 定義 API 基礎 URL 常數
 */
// const apiUrl = 'https://test-express-api-x0j9.onrender.com';
const apiUrl = 'http://localhost:4000';

/**
 * 目前操作的資料集合
 * 預設為 test1 集合
 */
let currentCollection = 'test1';

/**
 * 切換操作的資料集合
 * 更新按鈕狀態並重新載入資料
 * @param {string} collection - 目標集合名稱 ('test1' 或 'test2')
 */
function switchCollection(collection) {
  // 更新當前集合
  currentCollection = collection;
  
  // 重設按鈕樣式
  document.getElementById('test1Btn').className = '';
  document.getElementById('test2Btn').className = '';
  
  // 設定目前選中集合按鈕樣式
  document.getElementById(`${collection}Btn`).className = 'active-collection';
  
  // 重新載入資料並清空表單
  fetchData();
  clearForm();
}

/**
 * 從 API 取得資料並顯示在表格中
 */
async function fetchData() {
  try {
    // 呼叫 API 取得資料列表
    const response = await fetch(`${apiUrl}/${currentCollection}`);
    const data = await response.json();
    
    // 取得表格內容區域
    const tbody = document.getElementById('dataBody');
    tbody.innerHTML = '';
    
    // 為每筆資料建立表格列
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
    // 錯誤處理
    console.error('資料載入錯誤:', error);
    alert('無法載入資料，請檢查網路連線');
  }
}

/**
 * 處理表單提交 (新增或更新資料)
 * @param {Event} event - 表單提交事件
 */
async function handleSubmit(event) {
  event.preventDefault(); // 防止表單預設提交行為
  
  // 收集表單資料
  const formData = {
    id: document.getElementById('id').value,
    userName: document.getElementById('userName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };
  
  // 取得記錄ID (若有)
  const recordId = document.getElementById('recordId').value;
  
  // 依據是否有記錄ID決定使用新增或更新API
  const url = recordId 
    ? `${apiUrl}/${currentCollection}/${recordId}` // 更新現有資料
    : `${apiUrl}/${currentCollection}`; // 新增資料
  
  try {
    // 呼叫API
    const response = await fetch(url, {
      method: recordId ? 'PUT' : 'POST', // 依據操作類型選擇 HTTP 方法
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    // 檢查回應是否成功
    if (!response.ok) throw new Error('操作失敗');
    
    // 顯示成功訊息
    alert(`${recordId ? '更新' : '新增'}成功`);
    
    // 重新載入資料並清空表單
    fetchData();
    clearForm();
  } catch (error) {
    // 錯誤處理
    alert(`發生錯誤: ${error.message}`);
  }
}

/**
 * 載入資料到編輯表單中
 * @param {string} recordId - 要編輯的記錄 ID
 */
async function editRecord(recordId) {
  try {
    // 呼叫 API 取得指定記錄的詳細資料
    const response = await fetch(`${apiUrl}/${currentCollection}/${recordId}`);
    const data = await response.json();
    
    // 將資料填入表單
    document.getElementById('recordId').value = data._id;
    document.getElementById('id').value = data.id;
    document.getElementById('userName').value = data.userName;
    document.getElementById('email').value = data.email;
    document.getElementById('password').value = data.password;
  } catch (error) {
    // 錯誤處理
    console.error('載入資料錯誤:', error);
    alert('無法載入資料，請稍後再試');
  }
}

/**
 * 刪除指定記錄
 * @param {string} recordId - 要刪除的記錄 ID
 */
async function deleteRecord(recordId) {
  // 確認是否要刪除
  if (!confirm('確定要刪除這筆資料嗎？此操作無法復原')) return;
  
  try {
    // 呼叫 API 刪除資料
    const response = await fetch(`${apiUrl}/${currentCollection}/${recordId}`, {
      method: 'DELETE'
    });
    
    // 檢查回應是否成功
    if (!response.ok) throw new Error('刪除失敗');
    
    // 顯示成功訊息並重新載入資料
    alert('資料刪除成功');
    fetchData();
  } catch (error) {
    // 錯誤處理
    alert(`刪除失敗: ${error.message}`);
  }
}

/**
 * 清空表單
 * 重設所有輸入欄位並清除隱藏的記錄 ID
 */
function clearForm() {
  // 重設表單
  document.getElementById('dataForm').reset();
  // 清除記錄ID
  document.getElementById('recordId').value = '';
}

/**
 * 初始化頁面時載入資料
 */
document.addEventListener('DOMContentLoaded', () => {
  fetchData();
});
