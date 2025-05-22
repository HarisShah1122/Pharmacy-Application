module.exports = (sequelize, DataTypes) => {
    const PrescriptionDrug = sequelize.define('PrescriptionDrug', {
      prescription_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ndc_drug_code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      dispensed_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      days_of_supply: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      instructions: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      tableName: 'prescription_drugs',
      timestamps: false
    });
  
    // PrescriptionDrug.associate = (models) => {
    //   PrescriptionDrug.belongsTo(models.Prescription, {
    //     foreignKey: 'prescription_id',
    //     as: 'prescription'
    //   });
    // };
  
    return PrescriptionDrug;
  };
  