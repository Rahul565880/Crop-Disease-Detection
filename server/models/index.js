const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(config);

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user'
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Disease = sequelize.define('Disease', {
  disease_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  disease_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  disease_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  crop_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  symptoms: {
    type: DataTypes.TEXT
  },
  severity: {
    type: DataTypes.STRING(20),
    defaultValue: 'medium'
  }
}, {
  tableName: 'diseases',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Treatment = sequelize.define('Treatment', {
  treatment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  disease_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chemical_solution: {
    type: DataTypes.TEXT
  },
  organic_solution: {
    type: DataTypes.TEXT
  },
  prevention_methods: {
    type: DataTypes.TEXT
  },
  dosage_instructions: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'treatments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Scan = sequelize.define('Scan', {
  scan_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  disease_name: {
    type: DataTypes.STRING(100)
  },
  confidence_score: {
    type: DataTypes.DECIMAL(5, 2)
  },
  treatment_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'scans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

User.hasMany(Scan, { foreignKey: 'user_id', as: 'scans' });
Scan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Disease.hasOne(Treatment, { foreignKey: 'disease_id', as: 'treatment' });
Treatment.belongsTo(Disease, { foreignKey: 'disease_id', as: 'disease' });

Scan.belongsTo(Treatment, { foreignKey: 'treatment_id', as: 'treatment' });

module.exports = {
  sequelize,
  User,
  Disease,
  Treatment,
  Scan
};
