import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Star, Clock, X } from 'lucide-react';

const WatchMovie = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // In a real app, you would fetch the movie details from your API
    // For now, we'll use a mock movie data
    const mockMovie = {
      id: movieId,
      title: "Inception",
      description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      rating: "8.8",
      duration: "2h 28min",
      year: "2010",
      videoId: "YoHD9XEInc0" // This is the YouTube video ID for Inception trailer
    };
    setMovie(mockMovie);
  }, [movieId, navigate, isLoggedIn]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      {/* Video Player */}
      <div className="relative w-full aspect-video">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${movie.videoId}?autoplay=1`}
          title={movie.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Movie Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-4">{movie.title}</h1>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="text-gray-300">{movie.rating}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-300 mr-1" />
              <span className="text-gray-300">{movie.duration}</span>
            </div>
            <span className="text-gray-400">{movie.year}</span>
          </div>
          <p className="text-gray-300">{movie.description}</p>
        </div>
      </div>
    </div>
  );
};

export default WatchMovie; 