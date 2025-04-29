const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Movie = require('../models/Movie');
const { authenticateAdmin } = require('../middleware/auth');


// Admin signup (in production, this should be protected or invitation-only)
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create new admin
    const newAdmin = new Admin({
      username,
      password // This will be hashed by the pre-save hook
    });

    // Save admin (password will be hashed automatically)
    await newAdmin.save();

    // Create JWT token for immediate login
    const payload = {
      id: newAdmin.id,
      username: newAdmin.username,
      role: 'admin'
    };

    jwt.sign(
      payload,
      '1234',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          message: 'Admin created successfully',
          token 
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      id: admin.id,
      username: admin.username,
      role: 'admin'
    };

    jwt.sign(
      payload,
      '1234',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get admin dashboard statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Get total users and active users (users who logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: today }
    });

    // Get total movies and recently added movies (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const totalMovies = await Movie.countDocuments();
    const recentMovies = await Movie.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get popular movies (based on views)
    const popularMovies = await Movie.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title views');

    // Get genre distribution
    const genreData = await Movie.aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: { $multiply: [{ $divide: ['$count', totalMovies] }, 100] },
          _id: 0
        }
      }
    ]);

    // Get movie recommendations by genre
    const recommendationData = await Movie.aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          genre: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get recent feedback (last 5 reviews)
    const recentFeedback = await Movie.aggregate([
      { $unwind: '$reviews' },
      { $sort: { 'reviews.createdAt': -1 } },
      { $limit: 5 },
      {
        $project: {
          user: '$reviews.userName',
          movie: '$title',
          rating: '$reviews.rating',
          comment: '$reviews.comment'
        }
      }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalMovies,
      recentMovies,
      popularMovies,
      genreData,
      recommendationData,
      recentFeedback
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (admin only)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new user (admin only)
router.post('/users', authenticateAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'user'
    });

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user (admin only)
router.put('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData = { name, email, role };
    
    if (password) {
      updateData.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;