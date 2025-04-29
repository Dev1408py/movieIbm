import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Clock, TrendingUp as Trending, ThumbsUp, Award, Search, User, Heart, Bookmark } from 'lucide-react';

const Home = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const adminToken = localStorage.getItem('adminToken');
    return userId ? {
      name: username || "User",
      email: localStorage.getItem('email') || "user@example.com",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      isAdmin: !!adminToken
    } : null;
  });
  const navigate = useNavigate();

  // Fallback movies data in case API fails
  const fallbackMovies = [
    // Hollywood Movies
    { id: 1, title: "Inception", description: "A thief who steals corporate secrets...", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1", rating: "8.8", duration: "2h 28min", genre: "Action, Sci-Fi", director: "Christopher Nolan", year: "2010" },
    { id: 2, title: "Interstellar", description: "A team of explorers travel through a wormhole...", image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0", rating: "8.6", duration: "2h 49min", genre: "Sci-Fi, Adventure", director: "Christopher Nolan", year: "2014" },
    { id: 3, title: "The Dark Knight", description: "Batman faces the Joker...", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26", rating: "9.0", duration: "2h 32min", genre: "Action, Crime", director: "Christopher Nolan", year: "2008" },
    { id: 4, title: "Dune", description: "A noble family controls the desert planet...", image: "https://images.unsplash.com/photo-1547235001-d703406d3f17", rating: "8.0", duration: "2h 35min", genre: "Sci-Fi, Adventure", director: "Denis Villeneuve", year: "2021" },
    { id: 5, title: "The Shawshank Redemption: Special Edition", description: "Two imprisoned men bond...", image: "https://images.unsplash.com/photo-1504615755583-2916b52192a3", rating: "9.3", duration: "2h 22min", genre: "Drama", director: "Frank Darabont", year: "1994" },
    
    // Bollywood Movies
    { id: 6, title: "3 Idiots", description: "Three friends in engineering college...", image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b", rating: "8.4", duration: "2h 50min", genre: "Comedy, Drama", director: "Rajkumar Hirani", year: "2009" },
    { id: 7, title: "Dangal", description: "A wrestler trains his daughters...", image: "https://images.unsplash.com/photo-1546484396-fb3fc6f95a79", rating: "8.4", duration: "2h 41min", genre: "Biography, Drama", director: "Nitesh Tiwari", year: "2016" },
    { id: 8, title: "Sholay", description: "Two criminals hired to catch a bandit...", image: "https://images.unsplash.com/photo-1579373905675-2e57fb2e142d", rating: "8.2", duration: "3h 24min", genre: "Action, Adventure", director: "Ramesh Sippy", year: "1975" },
    { id: 9, title: "PK", description: "An alien stranded on Earth...", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", rating: "8.1", duration: "2h 33min", genre: "Comedy, Drama", director: "Rajkumar Hirani", year: "2014" },
    { id: 10, title: "Lagaan", description: "Villagers stake their future on cricket...", image: "https://images.unsplash.com/photo-1620207419186-13b2e9624930", rating: "8.1", duration: "3h 44min", genre: "Drama, Sport", director: "Ashutosh Gowariker", year: "2001" },
    { id: 11, title: "Grown ups", description: "Friends take down the town...", image: "https://images.unsplash.com/photo-1620207419186-13b2e9624930", rating: "8", duration: "3h", genre: "Drama, Sport", director: "Kendrick lamar", year: "2012" }
  ];

  // Fetch movies from backend
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        console.log('Fetching movies from backend...');
        const response = await fetch('http://localhost:5000/api/movies');
        
        if (!response.ok) {
          console.error('Error fetching movies:', response.status);
          setMovies(fallbackMovies);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('Movies API response:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          // Map backend movie data to our format
          const formattedMovies = data.map(movie => ({
            id: movie._id,
            title: movie.title || 'Unknown Title',
            description: movie.description || 'No description available',
            image: movie.image || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
            rating: movie.rating || 'N/A',
            duration: movie.duration || '2h',
            genre: movie.genre || 'Unknown',
            director: movie.director || 'Unknown',
            year: movie.year || 'Unknown'
          }));
          
          setMovies(formattedMovies);
        } else {
          console.log('No movies found in database, using fallback data');
          setMovies(fallbackMovies);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setMovies(fallbackMovies);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  // Filter movies by genre
  const getMoviesByGenre = (genre) => {
    return movies.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase())).slice(0, 5);
  };

  // Get featured movies for the slideshow
  const featuredMovies = movies.length >= 4 ? movies.slice(0, 4) : movies.slice(0, movies.length);
  const popularMovies = movies.slice(0, 10);

  // Function to handle slideshow navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === featuredMovies.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1));
  };

  // Auto-advance slideshow
  useEffect(() => {
    if (featuredMovies.length > 1) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [featuredMovies.length, currentSlide]);

  const handleRating = async (movie, rating) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      console.log('Rating movie:', movie.title, 'with rating:', rating);
      
      // First, try the recommendation endpoint
      try {
        const response = await fetch('http://localhost:8000/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            movie_name: movie.title,
            rating: rating,
            n_recommendations: 5
          }),
        });

        const data = await response.json();
        if (response.ok) {
          // Update recommendations
          const recommendedMovies = data.recommendations.map(rec => {
            // Find the movie in our movies array or create a new one
            const existingMovie = movies.find(m => m.title.toLowerCase() === rec.Name.toLowerCase());
            return existingMovie || {
              id: rec.Movie_ID,
              title: rec.Name,
              description: "Recommended for you based on your rating",
              image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
              rating: "8.0",
              duration: "2h",
              genre: "Action, Drama",
              director: "Various",
              year: "2023"
            };
          });
          setRecommendations(recommendedMovies);
          alert(`You rated ${movie.title} ${rating}/5 stars!`);
        } else {
          console.error('Failed to get recommendations:', data.error);
          // If recommendation endpoint fails, still show the rating alert
          alert(`You rated ${movie.title} ${rating}/5 stars!`);
          
          // Generate some basic recommendations based on genre for better UX
          const sameGenreMovies = movies
            .filter(m => m.id !== movie.id && m.genre.includes(movie.genre))
            .slice(0, 5);
          
          if (sameGenreMovies.length > 0) {
            setRecommendations(sameGenreMovies);
            console.log('Using fallback genre-based recommendations');
          }
        }
      } catch (error) {
        console.error('Error getting recommendations:', error);
        // If recommendation endpoint fails, still show the rating alert
        alert(`You rated ${movie.title} ${rating}/5 stars!`);
        
        // Generate some basic recommendations based on genre for better UX
        const sameGenreMovies = movies
          .filter(m => m.id !== movie.id && m.genre.includes(movie.genre))
          .slice(0, 5);
        
        if (sameGenreMovies.length > 0) {
          setRecommendations(sameGenreMovies);
          console.log('Using fallback genre-based recommendations');
        }
      }
      
      // Also save the rating to the user's profile if needed
      // This would be a separate API call to your backend
      
    } catch (error) {
      console.error('Error in handleRating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowUserDropdown(false);
    navigate('/');
  };

  const handleMovieClick = (movie) => {
    if (isLoggedIn) {
      setSelectedMovie(movie);
    } else {
      navigate('/login');
    }
  };

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToFavorites = async (movie) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    try {
      console.log('Adding to favorites from Home:', movie);
      
      // Skip movie creation since it requires admin rights
      // Just directly add the movie ID to favorites
      const movieId = movie.id.toString();
      console.log('Using Movie ID for favorites:', movieId);
      
      // Log the request details for debugging
      console.log('Request URL:', `http://localhost:5000/api/users/${userId}/favorites/${movieId}`);
      console.log('Request headers:', { 'x-auth-token': token });
      
      const response = await fetch(`http://localhost:5000/api/users/${userId}/favorites/${movieId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
      });
      
      console.log('Response status:', response.status);
      
      // Force reload the favorites page to ensure it shows the latest data
      localStorage.setItem('forceReloadFavorites', 'true');
      
      // Show notification regardless of response
      alert('Added to favorites!');
    } catch (err) {
      console.error('Error adding to favorites:', err);
      alert('Error adding to favorites');
    }
  };

  const handleAddToWatchlist = async (movie) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    try {
      console.log('Adding to watchlist from Home:', movie);
      
      // Skip movie creation since it requires admin rights
      // Just directly add the movie ID to watchlist
      const movieId = movie.id.toString();
      console.log('Using Movie ID for watchlist:', movieId);
      
      // Log the request details for debugging
      console.log('Request URL:', `http://localhost:5000/api/users/${userId}/watchlist/${movieId}`);
      console.log('Request headers:', { 'x-auth-token': token });
      
      const response = await fetch(`http://localhost:5000/api/users/${userId}/watchlist/${movieId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
      });
      
      console.log('Response status:', response.status);
      
      // Force reload the watchlist page to ensure it shows the latest data
      localStorage.setItem('forceReloadWatchlist', 'true');
      
      // Show notification regardless of response
      alert('Added to watchlist!');
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      alert('Error adding to watchlist');
    }
  };

  const MovieCard = ({ movie, onRating }) => (
    <div 
      onClick={() => handleMovieClick(movie)}
      className={`bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 transform hover:shadow-2xl cursor-pointer group ${
        !isLoggedIn ? 'opacity-80 hover:opacity-100' : ''
      }`}
    >
      <div className="relative">
        <img 
          src={movie.image} 
          alt={movie.title} 
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <Play className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300" />
        </div>
        {!isLoggedIn && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-gray-900/90 text-white px-3 py-1 rounded-full text-sm">
              Login to view
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-2">{movie.title}</h3>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 mr-1" />
            <span className="text-gray-300">{movie.rating}</span>
          </div>
          <span className="text-gray-400 text-sm">{movie.year}</span>
        </div>
        <div className="mb-2 overflow-hidden">
          <span className="text-gray-400 text-sm bg-gray-700 px-2 py-1 rounded-full inline-block">
            {movie.genre}
          </span>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.stopPropagation();
                  onRating(movie, star);
                }}
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Star className="h-5 w-5" />
              </button>
            ))}
            <button
              onClick={e => { e.stopPropagation(); handleAddToFavorites(movie); }}
              title="Add to Favorites"
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleAddToWatchlist(movie); }}
              title="Add to Watchlist"
              className="ml-1 text-blue-400 hover:text-blue-600"
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MovieDetails = ({ movie, onClose }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-800 rounded-full p-2 z-10 hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative h-64 w-full">
            <img 
              src={movie.image} 
              alt={movie.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/1200x500?text=No+Image";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
          </div>
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="text-gray-300">{movie.rating}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-300 mr-1" />
              <span>{movie.duration}</span>
            </div>
          </div>
          {isLoggedIn && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleAddToFavorites(movie)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center gap-2"
              >
                <Heart className="h-5 w-5" /> Favorite
              </button>
              <button
                onClick={() => handleAddToWatchlist(movie)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2"
              >
                <Bookmark className="h-5 w-5" /> Watchlist
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genre.split(',').map((genre, index) => (
              <span key={index} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                {genre.trim()}
              </span>
            ))}
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
            <p className="text-gray-300">{movie.description}</p>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Director</h2>
            <p className="text-gray-300">{movie.director}</p>
          </div>
          <button 
            onClick={async () => {
              if (!isLoggedIn) { navigate('/login'); return; }
              // Add to history
              const token = localStorage.getItem('token');
              const userId = localStorage.getItem('userId');
              await fetch(`http://localhost:5000/api/users/${userId}/history/${movie.id}`, {
                method: 'POST', headers: { 'x-auth-token': token }
              });
              navigate(`/watch/${movie.id}`);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition duration-300"
          >
            <Play className="h-5 w-5" /> Watch Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-16 bg-gray-900 min-h-screen">
      {/* Search Bar with User Dropdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center mr-4">
            <h1 onClick={() => navigate('/')} className="text-red-600 text-2xl font-bold cursor-pointer">MRS</h1>
          </div>
          <div className="relative flex-1">
            <div className="flex items-center bg-gray-800 rounded-lg p-2">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="bg-transparent text-white w-full focus:outline-none"
              />
            </div>
            
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 bg-gray-800 rounded-lg mt-2 max-h-96 overflow-y-auto z-10 shadow-xl">
                {filteredMovies.map(movie => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      handleMovieClick(movie);
                      setSearchQuery('');
                    }}
                    className="p-3 hover:bg-gray-700 cursor-pointer text-white flex items-center gap-4"
                  >
                    <img 
                      src={movie.image} 
                      alt={movie.title} 
                      className="w-16 h-24 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                      }}
                    />
                    <div>
                      <h3 className="font-semibold">{movie.title}</h3>
                      <p className="text-sm text-gray-400">{movie.year} • {movie.rating}</p>
                    </div>
                  </div>
                ))}
                {filteredMovies.length === 0 && (
                  <div className="p-3 text-gray-400">No movies found</div>
                )}
              </div>
            )}
          </div>
          
          {/* User Dropdown with Profile Button */}
          <div className="relative">
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-full p-1 pr-3 transition-colors duration-200"
            >
              {isLoggedIn ? (
                <>
                   <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x300?text=User";
                    }}
                   />
                  <span className="text-gray-200 text-sm hidden md:inline">{currentUser.name}</span>
                </>
              ) : (
                <div className="p-1">
                  <User className="h-6 w-6 text-gray-300" />
                </div>
              )}
            </button>
            
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-700">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                    {currentUser.isAdmin && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-700 flex items-center"
                      >
                        <span className="mr-2">⚙️</span> Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/watchlist');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      My Watchlist
                    </button>
                    <button
                      onClick={() => {
                        navigate('/favorites');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      My Favorites
                    </button>
                    <button
                      onClick={() => {
                        navigate('/history');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Watch History
                    </button>
                    <div className="border-t border-gray-700"></div>
                    <button
                       onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setShowUserDropdown(false);
                        handleLogin();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        navigate('/register');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Create Account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section - Slideshow */}
      {featuredMovies.length > 0 && (
        <div className="relative h-[70vh] w-full bg-gray-900 overflow-hidden">
          {/* Slideshow Images */}
          {featuredMovies.map((movie, index) => (
            <div 
              key={movie.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img 
                src={movie.image} 
                alt={movie.title} 
                className="w-full h-full object-cover opacity-70"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/1200x500?text=No+Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                      {movie.title}
                    </h1>
                    <p className="text-lg text-gray-200 mb-6 drop-shadow-md">
                      {movie.description}
                    </p>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 mr-1" />
                        <span>{movie.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-300 mr-1" />
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMovieClick(movie)}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 transition duration-300 shadow-lg"
                    >
                      <Play className="h-5 w-5" /> Watch Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide} 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-20 hover:bg-black/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextSlide} 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-20 hover:bg-black/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
      {/* Movies Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <ThumbsUp className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-3xl font-bold text-white">Recommended for You</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {recommendations.map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onRating={handleRating}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Rate some movies to get personalized recommendations!
            </p>
          )}
        </div>

        <div className="mb-16">
          <div className="flex items-center mb-8">
            <Trending className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-3xl font-bold text-white">Popular Now</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {popularMovies.map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onRating={handleRating}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comedy Movies */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-white">Comedy</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {getMoviesByGenre('Comedy').map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onRating={handleRating}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Movies */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-3xl font-bold text-white">Action</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {getMoviesByGenre('Action').map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onRating={handleRating}
                />
              ))}
            </div>
          )}
        </div>

        {/* Drama Movies */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <h2 className="text-3xl font-bold text-white">Drama</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {getMoviesByGenre('Drama').map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onRating={handleRating}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sci-Fi Movies */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-3xl font-bold text-white">Sci-Fi</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {getMoviesByGenre('Sci-Fi').map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onRating={handleRating}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedMovie && (
        <MovieDetails 
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
};

export default Home;