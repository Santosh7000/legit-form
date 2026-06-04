const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

// Serve index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ MySQL Connection Pool — uses ENV variables (set these in Render Dashboard)
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'acela.proxy.rlwy.net',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'xNgNVtDcopUASPgXzzIyCWwEwkgFQCOO',
  database: process.env.DB_NAME     || 'railway',
  port:     parseInt(process.env.DB_PORT || '13278'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ Auto-create users table if it doesn't exist
async function initDB() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        gender VARCHAR(20),
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    console.log('✅ Database connected and table ready.');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}
initDB();

// ============ SIGNUP ROUTE ============
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, gender, dateOfBirth } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query('SELECT email FROM users WHERE email = ?', [email]);
      if (users.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);
      await connection.query(
        'INSERT INTO users (name, email, password, gender, date_of_birth) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, gender || null, dateOfBirth || null]
      );

      return res.status(201).json({ success: true, message: 'Account created! Please login.' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ============ LOGIN ROUTE ============
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Email not found' });
      }

      const user = users[0];
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: 'Password is incorrect' });
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        user: { id: user.id, name: user.name, email: user.email }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ============ GET ALL USERS ============
app.get('/auth/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query('SELECT id, name, email, gender, date_of_birth, created_at FROM users');
      res.status(200).json({ success: true, data: users });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ DELETE USER ============
app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// ✅ Keep-alive ping endpoint (used by UptimeRobot to prevent Render sleeping)
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// ✅ Start server — must bind to 0.0.0.0 for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
