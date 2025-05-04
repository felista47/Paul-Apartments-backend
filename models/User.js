const { DataTypes } = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = db.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'customer'),
    defaultValue: 'customer'
  }
},
 {
  tableName: 'users',
  timestamps: false,
  createdAt: false,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

User.prototype.isCustomer = function() {
  return this.role === 'customer';
};

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
User.associate = function(models) {
  User.belongsToMany(models.Property, {
    through: models.PropertyUser,
    foreignKey: 'user_id',
    otherKey: 'property_id',
    as: 'favoriteProperties'
  });
};
module.exports = User;