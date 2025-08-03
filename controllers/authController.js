const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Đăng ký
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  const username = email; // dùng email làm username
  const role = '1';    // mặc định role là 'user'

  User.findByUsername(username, (err, user) => {
    if (user) return res.status(400).json({ message: 'Tài khoản đã tồn tại' });

    const hashed = bcrypt.hashSync(password, 8);
    const newUser = { name, username, password: hashed, role };

    User.createUser(newUser, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Đăng ký thành công' });
    });
  });
};
// Đăng nhập
exports.login = (req, res) => {
  const { username, password } = req.body;

  User.findByUsername(username, (err, user) => {
    if (!user) return res.status(400).json({ message: 'Tài khoản không tồn tại' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,          // Trả thêm name
        username: user.username,
        role: user.role
      }
    });
  });
};
