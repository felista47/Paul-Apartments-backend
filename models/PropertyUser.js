const { DataTypes } = require('sequelize');
const db = require('../config/db');

const PropertyUser = db.define('PropertyUser', {}, {
  timestamps: false,
  tableName: 'property_user'
});

module.exports = PropertyUser;