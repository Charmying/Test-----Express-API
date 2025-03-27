const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();

// 驗證 JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未授權' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: '無效的 token' });
  }
};

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { account, email, password, confirmPassword, userName, phone, address, bio } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: '密碼與確認密碼不一致' });
    }
    const newUser = new User({ account, email, password, userName, phone, address, bio });
    await newUser.save();
    res.status(201).json({ message: '註冊成功，請登入' });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({ error: `${field} 已存在` });
    } else {
      res.status(500).json({ error: '註冊失敗' });
    }
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    const { account, password } = req.body;
    const user = await User.findOne({ account });
    if (!user) {
      // 不明確指出是哪個錯誤
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: '登入成功', token });
  } catch (error) {
    res.status(500).json({ error: '登入失敗' });
  }
});

// 修改個人資料（需認證）
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (id !== req.userId) {
      return res.status(403).json({ error: '無權修改其他用戶資料' });
    }
    const { userName, phone, address, bio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { userName, phone, address, bio },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: '使用者不存在' });
    }
    res.status(200).json({ message: '個人資料更新成功', data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: '更新失敗' });
  }
});

// 取得單一使用者資料 (需認證)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (id !== req.userId) {
      return res.status(403).json({ error: '無權查看其他用戶資料' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: '使用者不存在' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: '無法取得資料' });
  }
});

module.exports = router;
