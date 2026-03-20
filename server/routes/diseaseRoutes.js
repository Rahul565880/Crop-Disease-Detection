const express = require('express');
const router = express.Router();
const { getAllDiseases, getDiseaseById, getDiseaseByCode } = require('../controllers/diseaseController');

router.get('/', getAllDiseases);
router.get('/:id', getDiseaseById);
router.get('/code/:code', getDiseaseByCode);

module.exports = router;
