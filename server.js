const app = require('./app');
const db = require('./config/db');
const port = process.env.PORT || 3000;

// Test DB connection and sync models
db.authenticate()
  .then(() => {
    console.log('Database connected...');
    return db.sync();
  })
  .then(() => {
    console.log('Models synced...');
    app.listen(port, () => {
      console.log(`Server running on port ${port}...`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database', err);
  });