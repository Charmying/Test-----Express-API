const express = require('express');
const QRCodeOrder = require('../models/qrcodeOrder');
const router = express.Router();

// 提交訂單
router.post('/orders', async (req, res) => {
  try {
    const { tableNumber, items } = req.body;
    const newOrder = new QRCodeOrder({ tableNumber, items });
    await newOrder.save();
    res.status(201).json({ message: '訂單已提交', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: '提交訂單失敗' });
  }
});

// 查看所有待處理訂單
router.get('/orders', async (req, res) => {
  try {
    const orders = await QRCodeOrder.find({ status: 'pending' });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: '無法取得訂單' });
  }
});

// 標記訂單完成
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

// 生成營業報表
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

// 清空資料庫
router.delete('/clear', async (req, res) => {
  try {
    await QRCodeOrder.deleteMany({});
    res.status(200).json({ message: '資料庫已清空' });
  } catch (error) {
    res.status(500).json({ error: '清空資料庫失敗' });
  }
});

module.exports = router;
