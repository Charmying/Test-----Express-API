const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const QrcodeLogin = require('../models/qrcodeLogin');
const router = express.Router();

/** 登入功能 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await QrcodeLogin.findOne({ username });
  if (!user) return res.status(401).json({ error: '帳號錯誤' });

  const valid = await user.validatePassword(password);
  if (!valid) return res.status(401).json({ error: '密碼錯誤' });

  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

/** 註冊功能 (僅限 admin) */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未授權' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: '沒有權限' });

    const exists = await QrcodeLogin.findOne({ username });
    if (exists) return res.status(400).json({ error: '帳號已存在' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new QrcodeLogin({ username, passwordHash });
    await newUser.save();
    res.json({ message: '註冊成功' });
  } catch (err) {
    res.status(401).json({ error: '無效的 token' });
  }
});

/** 修改密碼 */
router.put('/change-password', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { oldPassword, newPassword } = req.body;
  if (!token) return res.status(401).json({ error: '未授權' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await QrcodeLogin.findOne({ username: decoded.username });
    if (!user) return res.status(404).json({ error: '使用者不存在' });

    const valid = await user.validatePassword(oldPassword);
    if (!valid) return res.status(400).json({ error: '舊密碼錯誤' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: '密碼更新成功' });
  } catch (err) {
    res.status(401).json({ error: '無效的 token' });
  }
});

module.exports = router;
