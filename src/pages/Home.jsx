import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Clock, TrendingUp as Trending, ThumbsUp, Award, Search, User } from 'lucide-react';

const Home = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const allMovies = [
    // Hollywood Movies
    { id: 1, title: "Inception", description: "A thief who steals corporate secrets...", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1", rating: "8.8", duration: "2h 28min", genre: ["Action", "Sci-Fi"], director: "Christopher Nolan", year: "2010" },
    { id: 2, title: "Interstellar", description: "A team of explorers travel through a wormhole...", image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0", rating: "8.6", duration: "2h 49min", genre: ["Sci-Fi", "Adventure"], director: "Christopher Nolan", year: "2014" },
    { id: 3, title: "The Dark Knight", description: "Batman faces the Joker...", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26", rating: "9.0", duration: "2h 32min", genre: ["Action", "Crime"], director: "Christopher Nolan", year: "2008" },
    { id: 4, title: "Dune", description: "A noble family controls the desert planet...", image: "https://images.unsplash.com/photo-1547235001-d703406d3f17", rating: "8.0", duration: "2h 35min", genre: ["Sci-Fi", "Adventure"], director: "Denis Villeneuve", year: "2021" },
    { id: 5, title: "The Shawshank Redemption: Special Edition", description: "Two imprisoned men bond...", image: "https://images.unsplash.com/photo-1504615755583-2916b52192a3", rating: "9.3", duration: "2h 22min", genre: ["Drama"], director: "Frank Darabont", year: "1994" },
    
    // Bollywood Movies
    { id: 6, title: "3 Idiots", description: "Three friends in engineering college...", image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b", rating: "8.4", duration: "2h 50min", genre: ["Comedy", "Drama"], director: "Rajkumar Hirani", year: "2009" },
    { id: 7, title: "Dangal", description: "A wrestler trains his daughters...", image: "https://images.unsplash.com/photo-1546484396-fb3fc6f95a79", rating: "8.4", duration: "2h 41min", genre: ["Biography", "Drama"], director: "Nitesh Tiwari", year: "2016" },
    { id: 8, title: "Sholay", description: "Two criminals hired to catch a bandit...", image: "https://images.unsplash.com/photo-1579373905675-2e57fb2e142d", rating: "8.2", duration: "3h 24min", genre: ["Action", "Adventure"], director: "Ramesh Sippy", year: "1975" },
    { id: 9, title: "PK", description: "An alien stranded on Earth...", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", rating: "8.1", duration: "2h 33min", genre: ["Comedy", "Drama"], director: "Rajkumar Hirani", year: "2014" },
    { id: 10, title: "Lagaan", description: "Villagers stake their future on cricket...", image: "https://images.unsplash.com/photo-1620207419186-13b2e9624930", rating: "8.1", duration: "3h 44min", genre: ["Drama", "Sport"], director: "Ashutosh Gowariker", year: "2001" },
    { id: 11, title: "Grown ups", description: "Friends take down the town...", image: "https://images.unsplash.com/photo-1620207419186-13b2e9624930", rating: "8", duration: "3h", genre: ["Drama", "Sport"], director: "Kendrick lamar", year: "2012" }
  ];

  const featuredMovie = allMovies[0];
  const popularMovies = allMovies.slice(0, 10);

  const handleRating = async (movie, rating) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://13.232.194.242:8000/recommend', {
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
          // Find the movie in our allMovies array or create a new one
          const existingMovie = allMovies.find(m => m.title.toLowerCase() === rec.Name.toLowerCase());
          return existingMovie || {
            id: rec.Movie_ID,
            title: rec.Name,
            description: "Recommended for you based on your rating",
            image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
            rating: "8.0",
            duration: "2h",
            genre: ["Action", "Drama"],
            director: "Various",
            year: "2023"
          };
        });
        setRecommendations(recommendedMovies);
      } else {
        console.error('Failed to get recommendations:', data.error);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
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

  const filteredMovies = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const MovieCard = ({ movie, onRating }) => (
    <div 
      onClick={() => handleMovieClick(movie)}
      className={`bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 transform hover:shadow-2xl cursor-pointer group ${
        !isLoggedIn ? 'opacity-80 hover:opacity-100' : ''
      }`}
    >
      <div className="relative">
        <img src={movie.image} alt={movie.title} className="w-full h-64 object-cover" />
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
        {isLoggedIn && (
          <div className="flex items-center gap-1 mt-2">
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
            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
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
            <div className="text-gray-400">{movie.year}</div>
          </div>
          {isLoggedIn && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Rate this movie</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(movie, star)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <Star className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genre.map((genre, index) => (
              <span key={index} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                {genre}
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
            onClick={() => navigate(`/watch/${movie.id}`)}
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
                    <img src={movie.image} alt={movie.title} className="w-16 h-24 object-cover rounded" />
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

      {/* Hero Section */}
      <div className="relative h-[70vh] w-full bg-gray-900">
        <img 
          src={featuredMovie.image} 
          alt={featuredMovie.title} 
          className="w-full h-full object-cover opacity-70" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                {featuredMovie.title}
              </h1>
              <p className="text-lg text-gray-200 mb-6 drop-shadow-md">
                {featuredMovie.description}
              </p>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span>{featuredMovie.rating}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-300 mr-1" />
                  <span>{featuredMovie.duration}</span>
                </div>
              </div>
              <button 
                onClick={() => handleMovieClick(featuredMovie)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 transition duration-300 shadow-lg"
              >
                <Play className="h-5 w-5" /> Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {popularMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onRating={handleRating}
              />
            ))}
          </div>
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