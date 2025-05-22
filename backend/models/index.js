const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Users = require('./Users');
const Clinician = require('./clinicians');
const ClinicianListFactory = require('./clinicianList');
const Prescription = require('./Prescription');
const PrescriptionDrug = require('./PrescriptionDrug');
const PrescriptionDiagnosis = require('./PrescriptionDiagnosis');
const DrugListFactory = require('./DrugList');
const DiagnosisListFactory = require('./DiagnosisList');
const HealthAuthorityConfig = require('./HealthAuthorityConfig')(sequelize);
const HealthAuthority = require('./HealthAuthority');

try {
  const DiagnosisList = DiagnosisListFactory(sequelize, DataTypes);
  const ClinicianList = ClinicianListFactory(sequelize, DataTypes);
  const DrugList = DrugListFactory(sequelize, DataTypes);

  Clinician.belongsTo(ClinicianList, { foreignKey: 'clinician_list_id' });
  ClinicianList.hasMany(Clinician, { foreignKey: 'clinician_list_id' });

  const models = {
    Users,
    Clinician,
    ClinicianList,
    Prescription,
    PrescriptionDrug,
    DrugList,
    PrescriptionDiagnosis,
    DiagnosisList,
    HealthAuthority,
    HealthAuthorityConfig,
    sequelize,
  };

  sequelize.sync({ force: false }).then(() => {
    console.log('Models synced with database');
  }).catch(err => {
    console.error('Error syncing database:', err);
  });

  module.exports = models;
} catch (err) {
  console.error('Error initializing models:', err);
  throw err;
}