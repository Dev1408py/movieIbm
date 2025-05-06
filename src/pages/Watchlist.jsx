import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import host from "../../Link.js";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchWatchlist = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching watchlist...');
        const response = await fetch(`${import.meta.env.VITE_APP_API_HOST}/api/users/${userId}/watchlist`, {
            headers: { 'x-auth-token': token },
        });
        
        if (!response.ok) {
          console.error('Error fetching watchlist:', response.status);
          setWatchlist([]);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('Watchlist API response:', data);
        
        // Now the backend sends complete movie objects, not just IDs
        if (Array.isArray(data)) {
          // Format the movie data to match our frontend format
          const formattedMovies = data.map(movie => ({
            id: movie._id,
            title: movie.title || 'Unknown Title',
            description: movie.description || 'No description available',
            image: movie.image || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
            rating: movie.rating || 'N/A',
            duration: movie.duration || '2h',
            genre: movie.genre || ['Unknown'],
            director: movie.director || 'Unknown',
            year: movie.year || 'Unknown'
          }));
          
          console.log('Formatted watchlist:', formattedMovies);
          setWatchlist(formattedMovies);
        } else {
          console.log('Unexpected data format, using fallback');
          setWatchlist([]);
        }
      } catch (err) {
        console.error('Error in watchlist fetch:', err);
        setWatchlist([]);
      } finally {
        setLoading(false);
        // Clear the force reload flag
        localStorage.removeItem('forceReloadWatchlist');
      }
    };
    
    fetchWatchlist();
    
    // Set up an interval to check for the force reload flag
    const checkForReload = setInterval(() => {
      if (localStorage.getItem('forceReloadWatchlist')) {
        console.log('Force reloading watchlist...');
        fetchWatchlist();
      }
    }, 1000); // Check every second
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(checkForReload);
  }, []);

  const handleMovieClick = (movie) => {
    // Navigate to movie details or watch page
    navigate(`/watch/${movie.id || movie._id}`);
  };

  const handleRemoveFromWatchlist = async (e, movie) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      setMessage('You must be logged in to perform this action');
      return;
    }
    
    try {
      const movieId = movie.id || movie._id;
      const response = await fetch(`${import.meta.env.VITE_APP_API_HOST}/api/users/${userId}/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Remove movie from state
        setWatchlist(watchlist.filter(m => (m.id || m._id) !== movieId));
        setMessage('Movie removed from watchlist');
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to remove movie from watchlist');
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setMessage('Error removing movie from watchlist');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading watchlist...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>
        
        {watchlist.length === 0 ? (
          <div className="text-white text-center py-12">
            <p className="text-xl mb-4">You haven't added any movies to your watchlist yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {watchlist.map(movie => (
              <div 
                key={movie.id || movie._id} 
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition hover:scale-105 relative"
                onClick={() => handleMovieClick(movie)}
              >
                <button 
                  onClick={(e) => handleRemoveFromWatchlist(e, movie)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full z-10"
                  title="Remove from watchlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <img 
                  src={movie.image || "https://via.placeholder.com/300x450?text=No+Image"} 
                  alt={movie.title || "Movie"} 
                  className="w-full h-48 object-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                  }}
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-white mb-2">{movie.title || "Unknown Title"}</h2>
                  <p className="text-gray-400 text-sm mb-2">{movie.year || ""}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="text-gray-300">{movie.rating || "N/A"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Notification message */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
