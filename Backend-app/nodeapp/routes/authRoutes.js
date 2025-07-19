const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
//   const user = await User.findOne({ username, password }); // Use hashed passwords in production!
//   if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;