/**
 * test1 資料模型的路由處理
 * 提供 CRUD 操作 API
 */

const express = require('express');
const test1 = require('../models/test1');
const router = express.Router();

/**
 * 取得所有資料
 * GET /test1
 */
router.get('/', async (req, res) => {
  try {
    const data = await test1.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('取得所有資料錯誤:', error);
    res.status(500).json({ error: '取得資料失敗' });
  }
});

/**
 * 取得單筆資料
 * GET /test1/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await test1.findById(id);
    
    if (!data) {
      return res.status(404).json({ error: '找不到該筆資料' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('取得單筆資料錯誤:', error);
    res.status(500).json({ error: '取得資料失敗' });
  }
});

/**
 * 新增資料
 * POST /test1
 */
router.post('/', async (req, res) => {
  try {
    const { id, email, password, userName } = req.body;
    
    // 檢查必要欄位
    if (!email || !userName) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }
    
    const newData = new test1({ id, email, password, userName });
    await newData.save();
    
    res.status(201).json({ message: '資料新增成功', data: newData });
  } catch (error) {
    console.error('新增資料錯誤:', error);
    res.status(500).json({ error: '新增資料失敗' });
  }
});

/**
 * 更新資料
 * PUT /test1/:_id
 */
router.put('/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const { id, email, password, userName } = req.body;
    
    const updatedData = await test1.findByIdAndUpdate(
      _id,
      { id, email, password, userName },
      { new: true, runValidators: true }
    );
    
    if (!updatedData) {
      return res.status(404).json({ error: '找不到該筆資料' });
    }
    
    res.status(200).json({ message: '資料更新成功', data: updatedData });
  } catch (error) {
    console.error('更新資料錯誤:', error);
    res.status(500).json({ error: '更新資料失敗' });
  }
});

/**
 * 刪除資料
 * DELETE /test1/:_id
 */
router.delete('/:_id', async (req, res) => {
  try {
    // 使用傳遞的 _id
    const { _id } = req.params;
    
    // 使用 _id 查找並刪除
    const deletedData = await test1.findByIdAndDelete(_id);
    
    if (!deletedData) {
      return res.status(404).json({ error: '找不到該筆資料' });
    }
    
    res.status(200).json({ message: '資料刪除成功' });
  } catch (error) {
    console.error('刪除資料錯誤:', error);
    res.status(500).json({ error: '刪除資料失敗' });
  }
});

module.exports = router;
