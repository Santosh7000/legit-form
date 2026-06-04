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
// Serve static files from root directory
app.use(express.static(__dirname));

// Serve index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
//mysql://root:xNgNVtDcopUASPgXzzIyCWwEwkgFQCOO@acela.proxy.rlwy.net:13278/railway
// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'acela.proxy.rlwy.net',
  user: 'root',
  password: 'xNgNVtDcopUASPgXzzIyCWwEwkgFQCOO', 
  database: 'railway',  // Changed from 'railway' to 'demo_db'
  port: 13278,           // ✅ ADD THIS - Railway uses a specific port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ============ SIGNUP ROUTE ============
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, gender, dateOfBirth } = req.body;

    // Validation
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
      // Check if email already exists
      const [users] = await connection.query('SELECT email FROM users WHERE email = ?', [email]);

      if (users.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 8);

      // Insert user into database
      await connection.query(
        'INSERT INTO users (name, email, password, gender, date_of_birth) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, gender || null, dateOfBirth || null]
      );

      return res.status(201).json({ 
        success: true, 
        message: 'User registered successfully! Please login.' 
      });

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

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const connection = await pool.getConnection();

    try {
      // Find user by email
      const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Email not found' });
      }

      const user = users[0];

      // Compare passwords
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: 'Password is incorrect' });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Login successful!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ============ GET ALL USERS (Optional - for testing) ============
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Login page: http://localhost:${PORT}`);
});
app.delete('/api/users/:id', async (req,res)=>{

    try{

        await pool.query(
            'DELETE FROM users WHERE id=?',
            [req.params.id]
        );

        res.json({
            success:true
        });

    }catch(error){

        console.log(error);

        res.status(500).json({
            success:false
        });

    }

});