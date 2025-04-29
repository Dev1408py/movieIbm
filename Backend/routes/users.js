const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Movie = require('../models/Movie');
const { authenticateUser } = require('../middleware/auth');

// User Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: 'user' },
      '1234',
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      token, 
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: 'user' },
      '1234',
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user data by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Watchlist, Favorites, and Watch History Endpoints ---
// Get user's watchlist
router.get('/:id/watchlist', authenticateUser, async (req, res) => {
  try {
    // Populate the watchlist with movie data instead of just IDs
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get the movie data for each ID in the watchlist
    const moviePromises = user.watchlist.map(async (movieId) => {
      try {
        const movie = await Movie.findById(movieId);
        return movie ? movie : null;
      } catch (err) {
        console.error(`Error fetching movie ${movieId}:`, err);
        return null;
      }
    });
    
    const movies = await Promise.all(moviePromises);
    // Filter out any null values (movies that weren't found)
    const validMovies = movies.filter(movie => movie !== null);
    
    console.log('Sending watchlist with full movie data:', validMovies.length, 'movies');
    res.json(validMovies);
  } catch (err) {
    console.error('Error in get watchlist:', err);
    res.status(500).json({ message: err.message });
  }
});
// Add to watchlist
router.post('/:id/watchlist/:movieId', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.watchlist.includes(req.params.movieId)) {
      user.watchlist.push(req.params.movieId);
      await user.save();
    }
    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Remove from watchlist
router.delete('/:id/watchlist/:movieId', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.watchlist = user.watchlist.filter(mid => mid.toString() !== req.params.movieId);
    await user.save();
    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get user's favorites
router.get('/:id/favorites', authenticateUser, async (req, res) => {
  try {
    // Populate the favorites with movie data instead of just IDs
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get the movie data for each ID in the favorites
    const moviePromises = user.favorites.map(async (movieId) => {
      try {
        console.log('Fetching movie with ID:', movieId);
        const movie = await Movie.findById(movieId);
        return movie ? movie : null;
      } catch (err) {
        console.error(`Error fetching movie ${movieId}:`, err);
        return null;
      }
    });
    
    const movies = await Promise.all(moviePromises);
    // Filter out any null values (movies that weren't found)
    const validMovies = movies.filter(movie => movie !== null);
    
    console.log('Sending favorites with full movie data:', validMovies.length, 'movies');
    res.json(validMovies);

  } catch (err) {
    console.error('Error in get favorites:', err);
    res.status(500).json({ message: err.message });
  }
});
// Add to favorites
router.post('/:id/favorites/:movieId', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.favorites.includes(req.params.movieId)) {
      user.favorites.push(req.params.movieId);
      await user.save();
    }
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Remove from favorites
router.delete('/:id/favorites/:movieId', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.favorites = user.favorites.filter(mid => mid.toString() !== req.params.movieId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get user's watch history
router.get('/:id/history', authenticateUser, async (req, res) => {
  try {
    // Populate the watch history with movie data instead of just IDs
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Get the movie data for each ID in the watch history
    const moviePromises = user.watchHistory.map(async (movieId) => {
      try {
        const movie = await Movie.findById(movieId);
        return movie ? movie : null;
      } catch (err) {
        console.error(`Error fetching movie ${movieId}:`, err);
        return null;
      }
    });
    
    const movies = await Promise.all(moviePromises);
    // Filter out any null values (movies that weren't found)
    const validMovies = movies.filter(movie => movie !== null);
    
    console.log('Sending watch history with full movie data:', validMovies.length, 'movies');
    res.json(validMovies);
  } catch (err) {
    console.error('Error in get watch history:', err);
    res.status(500).json({ message: err.message });
  }
});
// Add to watch history
router.post('/:id/history/:movieId', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.watchHistory.includes(req.params.movieId)) {
      user.watchHistory.push(req.params.movieId);
      await user.save();
    }
    res.json(user.watchHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Remove from watch history
router.delete('/:id/history/:movieId', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.watchHistory = user.watchHistory.filter(mid => mid.toString() !== req.params.movieId);
    await user.save();
    res.json(user.watchHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;