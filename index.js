require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.set('layout', 'layouts/layout');
// app.set('layout', 'viewapplication');
// ROUTES
app.get('/', (req, res) => {
  res.render('pages/register', { layout: false,title: 'Đăng ký' });
});

app.get('/home', (req, res) => {
  res.render('pages/home', { title: 'Trang chủ' });
});
app.get('/admin', (req, res) => {
  res.render('pages/admin', { title: 'Trang chủ' });
});
app.get('/dashboad', (req, res) => {
  res.render('pages/dashboad', { title: 'Trang chủ' });
});
app.get('/outputsalary', (req, res) => {
  res.render('pages/outputsalary', { title: 'Trang chủ' });
});
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
