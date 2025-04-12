/**
 * 使用者相關路由處理
 * 包含註冊、登入、個人資料管理等功能
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

/**
 * JWT 身份驗證中間件
 * 驗證用戶是否已登入
 */
const authenticate = (req, res, next) => {
  // 從請求標頭中取得 token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授權，請先登入' });
  }
  
  try {
    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT 驗證錯誤:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登入已過期，請重新登入' });
    }
    
    res.status(401).json({ error: '無效的登入狀態，請重新登入' });
  }
};

/**
 * 使用者註冊
 * POST /users/register
 */
router.post('/register', async (req, res) => {
  try {
    const { account, email, password, confirmPassword, userName, phone, address, bio } = req.body;
    
    // 驗證必要欄位
    if (!account || !email || !password || !confirmPassword || !userName || !phone) {
      return res.status(400).json({ error: '請填寫所有必要欄位' });
    }
    
    // 驗證密碼與確認密碼是否一致
    if (password !== confirmPassword) {
      return res.status(400).json({ error: '密碼與確認密碼不一致' });
    }
    
    // 檢查帳號是否已存在
    const existingAccount = await User.findOne({ account });
    if (existingAccount) {
      return res.status(400).json({ error: '此帳號已被使用' });
    }
    
    // 檢查電子郵件是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: '此電子郵件已被使用' });
    }
    
    // 創建新使用者
    const newUser = new User({ 
      account, 
      email, 
      password, // 密碼會在 user 模型的 pre save hook 中被雜湊處理
      userName, 
      phone, 
      address, 
      bio 
    });
    
    await newUser.save();
    
    res.status(201).json({ message: '註冊成功，請登入' });
  } catch (error) {
    console.error('註冊錯誤:', error);
    
    if (error.code === 11000) {
      // 處理唯一性約束錯誤
      const field = Object.keys(error.keyValue)[0];
      const fieldMap = {
        account: '帳號',
        email: '電子郵件'
      };
      res.status(400).json({ error: `${fieldMap[field] || field} 已存在` });
    } else if (error.name === 'ValidationError') {
      // 處理驗證錯誤
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ error: errors[0] });
    } else {
      res.status(500).json({ error: '註冊失敗，請稍後再試' });
    }
  }
});

/**
 * 使用者登入
 * POST /users/login
 */
router.post('/login', async (req, res) => {
  try {
    const { account, password } = req.body;
    
    // 驗證必要欄位
    if (!account || !password) {
      return res.status(400).json({ error: '請填寫帳號和密碼' });
    }
    
    // 尋找使用者
    const user = await User.findOne({ account });
    if (!user) {
      // 不明確指出是帳號還是密碼錯誤，以增加安全性
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }
    
    // 使用模型中的方法驗證密碼
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }
    
    // 產生 JWT Token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ 
      message: '登入成功', 
      token,
      user: {
        id: user._id,
        account: user.account,
        userName: user.userName
      }
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ error: '登入失敗，請稍後再試' });
  }
});

/**
 * 更新使用者資料
 * PUT /users/:id
 * 需要身份驗證
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 驗證使用者只能修改自己的資料
    if (id !== req.userId) {
      return res.status(403).json({ error: '無權修改其他用戶資料' });
    }
    
    const { userName, phone, address, bio } = req.body;
    
    // 更新使用者資料
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { userName, phone, address, bio },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: '使用者不存在' });
    }
    
    res.status(200).json({ 
      message: '個人資料更新成功', 
      data: {
        id: updatedUser._id,
        account: updatedUser.account,
        email: updatedUser.email,
        userName: updatedUser.userName,
        phone: updatedUser.phone,
        address: updatedUser.address,
        bio: updatedUser.bio
      }
    });
  } catch (error) {
    console.error('更新使用者資料錯誤:', error);
    
    if (error.name === 'ValidationError') {
      // 處理驗證錯誤
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ error: errors[0] });
    } else {
      res.status(500).json({ error: '更新失敗，請稍後再試' });
    }
  }
});

/**
 * 取得使用者資料
 * GET /users/:id
 * 需要身份驗證
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 驗證使用者只能查看自己的資料
    if (id !== req.userId) {
      return res.status(403).json({ error: '無權查看其他用戶資料' });
    }
    
    // 尋找使用者
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: '使用者不存在' });
    }
    
    // 回傳使用者資料（不包含密碼）
    res.status(200).json({
      id: user._id,
      account: user.account,
      email: user.email,
      userName: user.userName,
      phone: user.phone,
      address: user.address,
      bio: user.bio
    });
  } catch (error) {
    console.error('取得使用者資料錯誤:', error);
    res.status(500).json({ error: '無法取得資料，請稍後再試' });
  }
});

module.exports = router;
