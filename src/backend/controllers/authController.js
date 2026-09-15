// authController.js
const jwt = require('jsonwebtoken');
const store = require('../data/store');

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Email and password required' } });
  }

  const user = store.findOne('users', u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Invalid credentials' } });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'supplyshield_secret',
    { expiresIn: '1d' }
  );

  res.json({
    success: true,
    data: {
      token,
      user: { name: user.name, email: user.email, role: user.role },
    },
  });
};

module.exports = { login };
