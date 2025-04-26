const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1"
  },
  rating: {
    type: String,
    default: "8.0"
  },
  duration: {
    type: String,
    default: "2h"
  },
  genre: [{
    type: String,
    default: ["Action", "Drama"]
  }],
  director: {
    type: String,
    default: "Various"
  },
  year: {
    type: String,
    default: "2023"
  },
  movieId: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);