const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {signupSchema,loginSchema} = require('../validations/schema')
const { sign } = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/* GET users listing. */
router.post('/signup', async (req, res) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  const { email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists',data:user });
    }

    // Create a new user
    user = new User({
      email,
      password: await bcrypt.hash(password, 10) // Hash password
    });

    await user.save();

    res.status(201).json({ msg: 'User registered successfully',data:user });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});

router.post('/login', async (req, res) => {

  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT
    const token = sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token,userId: user._id,email:user.email });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});
module.exports = router;
