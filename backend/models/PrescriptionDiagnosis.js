const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Prescription = require('./Prescription');

const PrescriptionDiagnosis = sequelize.define('PrescriptionDiagnosis', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
prescription_id: {
  type: DataTypes.INTEGER.UNSIGNED,
  allowNull: false,
  // references: {
  //   model: Prescription,
  //   key: 'id',
  // },
},
  icd_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  diagnosis_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'PrescriptionDiagnoses',
  timestamps: true,
});

// PrescriptionDiagnosis.belongsTo(Prescription, { foreignKey: 'prescription_id' });

module.exports = PrescriptionDiagnosis;