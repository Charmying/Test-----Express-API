const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCodeOrder = require('../models/qrcodeOrder');
const Table = require('../models/table');
const router = express.Router();

/** 新增的 URL 常數 */
const localUrl = 'http://localhost:4200/qrcode-order-user-interface';
const vercelUrl = 'https://test-angular-git-master-charmys-projects.vercel.app/qrcode-order-user-interface';

/** 提交訂單（驗證 token） */
router.post('/orders', async (req, res) => {
  try {
    const { tableNumber, items, token } = req.body;
    // 驗證桌號 + token 是否有效
    const table = await Table.findOne({ tableNumber, status: 'occupied', qrCodeToken: token });
    if (!table) {
      return res.status(400).json({ error: '無效的桌號或連結已失效' });
    }
    const newOrder = new QRCodeOrder({ tableNumber, items });
    await newOrder.save();
    // 即時推播新訂單
    const io = req.app.get('io');
    io.emit('newOrder', newOrder);
    res.status(201).json({ message: '訂單已提交', order: newOrder });
  } catch (error) {
    console.error('提交訂單失敗:', error);
    res.status(500).json({ error: '提交訂單失敗' });
  }
});

/** 查看所有待處理訂單 */
router.get('/orders', async (req, res) => {
  try {
    const orders = await QRCodeOrder.find({ status: 'pending' });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: '無法取得訂單' });
  }
});

/** 標記訂單完成 */
router.put('/orders/:id/complete', async (req, res) => {
  try {
    const order = await QRCodeOrder.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    res.status(200).json({ message: '訂單已完成', order });
  } catch (error) {
    res.status(500).json({ error: '更新訂單狀態失敗' });
  }
});

/** 生成營業報表 */
router.get('/reports', async (req, res) => {
  try {
    const completedOrders = await QRCodeOrder.find({ status: 'completed' });
    // 計算總營收：單價 * 數量
    const totalRevenue = completedOrders.reduce((sum, order) => {
      return sum + order.items.reduce((s, i) => s + i.price * i.quantity, 0);
    }, 0);
    res.status(200).json({ totalRevenue, completedOrders });
  } catch (error) {
    res.status(500).json({ error: '生成報表失敗' });
  }
});

/** 清空資料庫 */
router.delete('/clear', async (req, res) => {
  try {
    await QRCodeOrder.deleteMany({});
    res.status(200).json({ message: '資料庫已清空' });
  } catch (error) {
    res.status(500).json({ error: '清空資料庫失敗' });
  }
});

/** 取得所有桌號資訊 */
router.get('/tables', async (req, res) => {
  try {
    const tables = await Table.find();
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ error: '無法取得桌號資訊' });
  }
});

/** 標示桌號有人並生成唯一 QR Code 網址 */
router.post('/tables/:tableNumber/occupy', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    if (!table) return res.status(404).json({ error: '桌號不存在' });
    if (table.status === 'occupied') return res.status(400).json({ error: '桌號已有人' });
    const token = uuidv4(); // 產生唯一 token
    const clientBase = vercelUrl;
    const qrCodeUrl = `${clientBase}?table=${table.tableNumber}&token=${token}`;
    table.status = 'occupied';
    table.qrCodeUrl = qrCodeUrl;
    table.qrCodeToken = token;
    await table.save();
    res.status(200).json({ message: '桌號已標示有人', qrCodeUrl, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '標示桌號有人失敗' });
  }
});

/** 結帳並使 QR Code 失效 */
router.post('/tables/:tableNumber/checkout', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    if (!table) return res.status(404).json({ error: '桌號不存在' });
    if (table.status === 'available') return res.status(400).json({ error: '桌號已空' });
    table.status = 'available';
    table.qrCodeUrl = null;
    table.qrCodeToken = null;
    await table.save();
    res.status(200).json({ message: '結帳成功，QR Code 已失效' });
  } catch (error) {
    console.error('結帳失敗:', error);
    res.status(500).json({ error: '結帳失敗' });
  }
});

module.exports = router;
