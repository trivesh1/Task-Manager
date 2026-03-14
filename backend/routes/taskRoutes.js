const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/task');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { check } = require('express-validator');

// All task routes require authentication
router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post([
      check('title', 'Please add a task title').not().isEmpty(),
      check('description', 'Please add a description').not().isEmpty()
  ], createTask);

router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
