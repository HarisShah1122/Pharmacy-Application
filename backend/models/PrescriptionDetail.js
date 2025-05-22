const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PrescriptionDetail = sequelize.define(
  "PrescriptionDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    insuredMember: { type: DataTypes.ENUM("Yes", "No"), allowNull: true  },
    validatedBy: { type: DataTypes.STRING, allowNull: true },
    memberId: { type: DataTypes.STRING, allowNull: false, unique: true },
    payerTpa: { type: DataTypes.STRING, allowNull: false },
    emiratesId: { type: DataTypes.STRING, allowNull: false, unique: true },
    reasonOfUnavailability: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: true, validate: { min: 0 } },
    physician: { type: DataTypes.STRING, allowNull: false },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { is: /^[0-9]{10,15}$/ },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    fillDate: { type: DataTypes.DATEONLY, allowNull: true },
  },
  {
    tableName: "PrescriptionDetail",
    timestamps: true,
  }
);

module.exports = PrescriptionDetail;
