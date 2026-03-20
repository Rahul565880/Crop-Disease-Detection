const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');
const { 
  getAllUsers, 
  deleteUser, 
  createDisease, 
  updateDisease, 
  deleteDisease,
  getSystemStats 
} = require('../controllers/adminController');

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.post('/diseases', createDisease);
router.put('/diseases/:id', updateDisease);
router.delete('/diseases/:id', deleteDisease);

router.get('/stats', getSystemStats);

module.exports = router;
