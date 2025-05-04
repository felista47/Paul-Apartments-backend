const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./utils/globalErrorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Model associations
const User = require('./models/User');
const Property = require('./models/Property');
const PropertyUser = require('./models/PropertyUser');

// Many-to-many relationship for property likes
User.belongsToMany(Property, {
  through: PropertyUser,
  as: 'likedProperties',
  foreignKey: 'user_id',
  otherKey: 'property_id'
});

Property.belongsToMany(User, {
  through: PropertyUser,
  as: 'likedByUsers',
  foreignKey: 'property_id',
  otherKey: 'user_id'
});

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// Handle 404
// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// Global error handler
app.use(globalErrorHandler);

module.exports = app;