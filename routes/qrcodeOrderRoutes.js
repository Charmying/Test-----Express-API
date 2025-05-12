const express = require('express');
const QRCodeOrder = require('../models/qrcodeOrder');
const Table = require('../models/table'); // 新增引入桌號模型
const router = express.Router();

/** 提交訂單 */
router.post('/orders', async (req, res) => {
  try {
    const { tableNumber, items } = req.body;
    const newOrder = new QRCodeOrder({ tableNumber, items });
    await newOrder.save();
    /** 即時推播新訂單 */
    const io = req.app.get('io');
    io.emit('newOrder', newOrder);
    res.status(201).json({ message: '訂單已提交', order: newOrder });
  } catch (error) {
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

/** 標示桌號有人並生成 QR Code 網址 */
router.post('/tables/:tableNumber/occupy', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    if (!table) {
      return res.status(404).json({ error: '桌號不存在' });
    }
    if (table.status === 'occupied') {
      return res.status(400).json({ error: '桌號已有人' });
    }
    const qrCodeUrl = `http://localhost:4200/qrcode-order-user-interface?table=${table.tableNumber}`;
    table.status = 'occupied';
    table.qrCodeUrl = qrCodeUrl;
    await table.save();
    res.status(200).json({ message: '桌號已標示有人', qrCodeUrl });
  } catch (error) {
    res.status(500).json({ error: '標示桌號有人失敗' });
  }
});

/** 結帳並使 QR Code 失效 */
router.post('/tables/:tableNumber/checkout', async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber });
    if (!table) {
      return res.status(404).json({ error: '桌號不存在' });
    }
    if (table.status === 'available') {
      return res.status(400).json({ error: '桌號已空' });
    }
    table.status = 'available';
    table.qrCodeUrl = null;
    await table.save();
    res.status(200).json({ message: '結帳成功，QR Code 已失效' });
  } catch (error) {
    res.status(500).json({ error: '結帳失敗' });
  }
});

module.exports = router;
