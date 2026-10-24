const mongoose = require('mongoose');
const Task = require('../models/Task');

const allowedFields = ['title', 'description', 'completed', 'priority', 'dueDate', 'category'];

function validationResponse(error, res) {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid task data.',
      errors: error.name === 'ValidationError'
        ? Object.values(error.errors).map((item) => item.message)
        : ['One or more values have an invalid format.']
    });
  }
  return null;
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

async function createTask(req, res, next) {
  try {
    const { title, description, priority, dueDate, category, completed } = req.body;
    const task = await Task.create({
      title, description, priority, dueDate, category, completed,
      user: req.userId
    });
    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (validationResponse(error, res)) return;
    next(error);
  }
}

async function getTasks(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const filter = { user: req.userId };

    if (req.query.completed !== undefined) {
      if (!['true', 'false'].includes(req.query.completed)) {
        return res.status(400).json({ success: false, message: 'completed must be true or false.' });
      }
      filter.completed = req.query.completed === 'true';
    }
    if (req.query.priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(req.query.priority)) {
        return res.status(400).json({ success: false, message: 'priority must be low, medium, or high.' });
      }
      filter.priority = req.query.priority;
    }
    if (req.query.category !== undefined) {
      if (!['work', 'personal', 'shopping', 'health', 'other'].includes(req.query.category)) {
        return res.status(400).json({ success: false, message: 'Invalid category.' });
      }
      filter.category = req.query.category;
    }
    if (req.query.search !== undefined) {
      const search = String(req.query.search).trim().slice(0, 100);
      if (search) filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      dueDate: { dueDate: 1, createdAt: -1 },
      priority: { priority: -1, createdAt: -1 }
    };
    const sort = sortOptions[req.query.sort] || sortOptions.newest;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Task.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    return res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    const keys = Object.keys(req.body || {});
    if (!keys.length) return res.status(400).json({ success: false, message: 'Provide at least one field to update.' });
    const invalid = keys.filter((key) => !allowedFields.includes(key));
    if (invalid.length) {
      return res.status(400).json({ success: false, message: `Fields cannot be updated: ${invalid.join(', ')}.` });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    return res.json({ success: true, data: task });
  } catch (error) {
    if (validationResponse(error, res)) return;
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task ID.' });
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    return res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
