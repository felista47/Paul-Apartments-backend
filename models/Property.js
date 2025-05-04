const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Property = db.define('Property', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  beds: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  baths: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  guest_wc: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  square_meters: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  
  price_per_night: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  price_per_month: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true
  },
  featured_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gallery_images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  videos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
},
{
  tableName: 'properties',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Property.associate = function(models) {
  Property.belongsToMany(models.User, {
    through: models.PropertyUser,
    foreignKey: 'property_id',
    otherKey: 'user_id',
    as: 'likedByUsers'
  });
};

Property.prototype.getSquareFeet = function() {
  return this.square_meters * 10.764;
};

module.exports = Property;
