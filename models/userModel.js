const db = require('../config/db');

exports.findByUsername = (username, cb) => {
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    cb(err, results[0]);
  });
};

exports.createUser = (user, cb) => {
  db.query('INSERT INTO users SET ?', user, (err, result) => {
    cb(err, result);
  });
};
