const { User, Scan, Disease, Treatment } = require('../models');
const { Op } = require('sequelize');

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const createDisease = async (req, res) => {
  try {
    const { disease_name, disease_code, crop_type, description, symptoms, severity, chemical_solution, organic_solution, prevention_methods, dosage_instructions } = req.body;

    if (!disease_name || !disease_code || !crop_type) {
      return res.status(400).json({ error: 'Disease name, code, and crop type are required' });
    }

    const existingDisease = await Disease.findOne({ where: { disease_code } });
    if (existingDisease) {
      return res.status(400).json({ error: 'Disease code already exists' });
    }

    const disease = await Disease.create({
      disease_name,
      disease_code,
      crop_type,
      description,
      symptoms,
      severity: severity || 'medium'
    });

    const treatment = await Treatment.create({
      disease_id: disease.disease_id,
      chemical_solution,
      organic_solution,
      prevention_methods,
      dosage_instructions
    });

    res.status(201).json({
      message: 'Disease created successfully',
      disease,
      treatment
    });
  } catch (error) {
    console.error('Create disease error:', error);
    res.status(500).json({ error: 'Failed to create disease' });
  }
};

const updateDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const { disease_name, crop_type, description, symptoms, severity, chemical_solution, organic_solution, prevention_methods, dosage_instructions } = req.body;

    const disease = await Disease.findByPk(id);
    if (!disease) {
      return res.status(404).json({ error: 'Disease not found' });
    }

    if (disease_name) disease.disease_name = disease_name;
    if (crop_type) disease.crop_type = crop_type;
    if (description) disease.description = description;
    if (symptoms) disease.symptoms = symptoms;
    if (severity) disease.severity = severity;

    await disease.save();

    const treatment = await Treatment.findOne({ where: { disease_id: id } });
    if (treatment) {
      if (chemical_solution !== undefined) treatment.chemical_solution = chemical_solution;
      if (organic_solution !== undefined) treatment.organic_solution = organic_solution;
      if (prevention_methods !== undefined) treatment.prevention_methods = prevention_methods;
      if (dosage_instructions !== undefined) treatment.dosage_instructions = dosage_instructions;
      await treatment.save();
    }

    res.json({
      message: 'Disease updated successfully',
      disease,
      treatment
    });
  } catch (error) {
    console.error('Update disease error:', error);
    res.status(500).json({ error: 'Failed to update disease' });
  }
};

const deleteDisease = async (req, res) => {
  try {
    const { id } = req.params;

    const disease = await Disease.findByPk(id);
    if (!disease) {
      return res.status(404).json({ error: 'Disease not found' });
    }

    await disease.destroy();

    res.json({ message: 'Disease deleted successfully' });
  } catch (error) {
    console.error('Delete disease error:', error);
    res.status(500).json({ error: 'Failed to delete disease' });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalScans = await Scan.count();
    const totalDiseases = await Disease.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const scansToday = await Scan.count({
      where: {
        created_at: {
          [Op.gte]: today
        }
      }
    });

    const recentScans = await Scan.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    const scansByCrop = await Disease.findAll({
      attributes: [
        'crop_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('Scans.scan_id')), 'count']
      ],
      include: [{
        model: Scan,
        as: 'scans',
        attributes: []
      }],
      group: ['Disease.disease_id'],
      raw: false
    });

    res.json({
      stats: {
        totalUsers,
        totalScans,
        totalDiseases,
        scansToday,
        recentScans,
        scansByCrop
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Failed to get system stats' });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  createDisease,
  updateDisease,
  deleteDisease,
  getSystemStats
};
