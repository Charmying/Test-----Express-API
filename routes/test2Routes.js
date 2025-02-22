const express = require('express');
const test2 = require('../models/test2');
const router = express.Router();

// 查詢所有資料
router.get('/', async (req, res) => {
  try {
    const data = await test2.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: '查詢資料失敗' });
  }
});

// 查詢單筆資料
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await test2.findById(id);
    if (!data) {
      return res.status(404).json({ error: '找不到該筆資料' });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: '查詢資料失敗' });
  }
});

// 新增資料
router.post('/', async (req, res) => {
  try {
    const { id, email, password, userName } = req.body;
    const newData = new test2({ id, email, password, userName });
    await newData.save();
    res.status(201).json({ message: '資料新增成功', data: newData });
  } catch (error) {
    res.status(500).json({ error: '新增資料失敗' });
  }
});

// 更新資料
router.put('/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const { id, email, password, userName } = req.body;
    const updatedData = await test2.findByIdAndUpdate(
      _id,
      { id, email, password, userName },
      { new: true, runValidators: true }
    );
    if (!updatedData) {
      return res.status(404).json({ error: '找不到該筆資料' });
    }
    res.status(200).json({ message: '資料更新成功', data: updatedData });
  } catch (error) {
    res.status(500).json({ error: '更新資料失敗' });
  }
});

// 刪除資料
router.delete('/:_id', async (req, res) => {
  try {
    const { _id } = req.params;  // 使用傳遞的 _id
    
    // 使用 _id 查找並刪除
    const deletedData = await test2.findOneAndDelete({ _id: _id });

    if (!deletedData) {
      return res.status(404).json({ error: '找不到該筆資料' });
    }

    res.status(200).json({ message: '資料刪除成功' });
  } catch (error) {
    res.status(500).json({ error: '刪除資料失敗' });
  }
});

module.exports = router;
