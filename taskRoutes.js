const express = require('express');
const {
  createTask, getTasks, getTask, updateTask, deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
