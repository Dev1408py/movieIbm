// import React from 'react';
// import { X, Star, Clock, Calendar, User } from 'lucide-react';

// const MovieDetails = ({ movie, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
//       <div className="min-h-screen px-4 text-center">
//         <div className="fixed top-0 right-0 p-4">
//           <button
//             onClick={onClose}
//             className="text-white hover:text-red-500 transition-colors duration-200"
//           >
//             <X className="h-8 w-8" />
//           </button>
//         </div>
        
//         <div className="inline-block w-full max-w-4xl my-8 text-left align-middle">
//           <div className="relative">
//             <img
//               src={movie.image}
//               alt={movie.title}
//               className="w-full h-[60vh] object-cover rounded-t-xl"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
//           </div>
          
//           <div className="bg-gray-800 rounded-b-xl p-8">
//             <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
            
//             <div className="flex flex-wrap gap-6 mb-8">
//               {movie.rating && (
//                 <div className="flex items-center">
//                   <Star className="h-5 w-5 text-yellow-400 mr-2" />
//                   <span className="text-white">{movie.rating}</span>
//                 </div>
//               )}
//               {movie.duration && (
//                 <div className="flex items-center">
//                   <Clock className="h-5 w-5 text-gray-400 mr-2" />
//                   <span className="text-white">{movie.duration}</span>
//                 </div>
//               )}
//               {movie.year && (
//                 <div className="flex items-center">
//                   <Calendar className="h-5 w-5 text-gray-400 mr-2" />
//                   <span className="text-white">{movie.year}</span>
//                 </div>
//               )}
//               {movie.director && (
//                 <div className="flex items-center">
//                   <User className="h-5 w-5 text-gray-400 mr-2" />
//                   <span className="text-white">{movie.director}</span>
//                 </div>
//               )}
//             </div>

//             {movie.genre && (
//               <div className="flex flex-wrap gap-2 mb-6">
//                 {movie.genre.map((g, index) => (
//                   <span
//                     key={index}
//                     className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
//                   >
//                     {g}
//                   </span>
//                 ))}
//               </div>
//             )}

//             {movie.description && (
//               <p className="text-gray-300 text-lg leading-relaxed mb-8">
//                 {movie.description}
//               </p>
//             )}

//             <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition duration-300">
//               Watch Now
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MovieDetails;




// MovieDetails.jsx
import React, { useState } from 'react';
import { X, Star, Clock, Calendar, User, PlayCircle, Heart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MovieDetails = ({ movie, onClose }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [notification, setNotification] = useState('');

  // Sample cast data - in a real app, this could come from props or an API
  const cast = [
    { name: "Lead Actor", role: "Main Character" },
    { name: "Supporting Actor", role: "Side Character" },
    { name: "Director", role: "Director" }
  ];

  // Handlers for favorites and watchlist
  const handleAddToFavorites = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    try {
      console.log('Adding to favorites:', movie);
      
      // Use the correct movie ID format
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
      
      // Show notification
      setNotification('Added to Favorites');
      // Clear notification after 2 seconds
      setTimeout(() => setNotification(''), 2000);
    } catch (err) {
      console.error('Error adding to favorites:', err);
      setNotification('Failed to add to Favorites');
      setTimeout(() => setNotification(''), 2000);
    }
  };
  
  const handleAddToWatchlist = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    try {
      console.log('Adding to watchlist:', movie);
      
      // Use the correct movie ID format
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
      
      // Show notification
      setNotification('Added to Watchlist');
      // Clear notification after 2 seconds
      setTimeout(() => setNotification(''), 2000);
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      setNotification('Failed to add to Watchlist');
      setTimeout(() => setNotification(''), 2000);
    }
  };
  
  const handleWatchNow = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    try {
      console.log('Adding to history:', movie);
      
      // Skip movie creation since it requires admin rights
      // Just directly add the movie ID to history
      const movieId = movie.id.toString();
      console.log('Using Movie ID for history:', movieId);
      
      const response = await fetch(`http://localhost:5000/api/users/${userId}/history/${movieId}`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
      });
      
      console.log('Response status:', response.status);
      
      // Show notification regardless of response
      setNotification('Added to History');
      // Clear notification after 2 seconds
      setTimeout(() => setNotification(''), 2000);
    } catch (err) {
      console.error('Error adding to history:', err);
    }
    
    // Navigate to watch page
    navigate(`/watch/${movie.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        {/* Close Button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={onClose}
            className="text-white hover:text-red-500 transition-colors duration-200 bg-gray-800/50 rounded-full p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
          {/* Header Image */}
          <div className="relative">
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-[50vh] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {movie.title}
              </h1>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            {/* Movie Info */}
            <div className="flex flex-wrap gap-6 mb-6 text-white">
              {movie.rating && (
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span>{movie.rating}/10</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{movie.duration}</span>
                </div>
              )}
              {movie.year && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.director && (
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{movie.director}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genre && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.map((g, index) => (
                  <span
                    key={index}
                    className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm border border-red-500/30"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {movie.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
                <p className="text-gray-300 leading-relaxed">
                  {movie.description}
                </p>
              </div>
            )}

            {/* Cast Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Cast</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cast.map((person, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">{person.name}</p>
                      <p className="text-gray-400 text-sm">{person.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button onClick={handleWatchNow} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition duration-300">
                <PlayCircle className="h-5 w-5" />
                Watch Now
              </button>
              <button onClick={handleAddToFavorites} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition duration-300">
                <Heart className="h-5 w-5" />
                Favorite
              </button>
              <button onClick={handleAddToWatchlist} className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition duration-300">
                <Bookmark className="h-5 w-5" />
                Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification popup */}
      {notification && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
          {notification}
        </div>
      )}
    </div>
  );
};

export default MovieDetails;