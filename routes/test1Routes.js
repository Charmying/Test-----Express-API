const express = require('express');
const test1 = require('../models/test1');
const router = express.Router();

// Fetch all data
router.get('/', async (req, res) => {
  try {
    const data = await test1.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Fetch a single record
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await test1.findById(id);
    if (!data) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Add new data
router.post('/', async (req, res) => {
  try {
    const { id, email, password, userName } = req.body;
    const newData = new test1({ id, email, password, userName });
    await newData.save();
    res.status(201).json({ message: 'Data added successfully', data: newData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add data' });
  }
});

// Update data
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
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(200).json({ message: 'Data updated successfully', data: updatedData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Delete data
router.delete('/:_id', async (req, res) => {
  try {
    // Use the provided _id
    const { _id } = req.params;
    // Find and delete by _id
    const deletedData = await test1.findOneAndDelete({ _id: _id });

    if (!deletedData) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(200).json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

module.exports = router;
