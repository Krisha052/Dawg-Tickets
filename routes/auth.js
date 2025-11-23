const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ 
error: 'Missing fields' });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' 
});
    res.json({ token, user: { id: user._id, username: user.username, 
email: user.email } });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ 
error: 'Missing fields' });
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { 
username: emailOrUsername }] });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' 
});
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' 
});
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' 
});
    res.json({ token, user: { id: user._id, username: user.username, 
email: user.email } });
  } catch (err) { console.error(err); res.status(500).json({ error: 
'server error' }); }
});

module.exports = router;

