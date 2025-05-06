import React, { useState, useEffect, useCallback, memo } from 'react';
import { Plus, Edit2, Trash2, X, Film } from 'lucide-react';
import host from "../../Link.js";

// Memoized MovieModal component
const MovieModal = memo(({ 
  showModal, 
  onClose, 
  onSubmit, 
  formData, 
  onInputChange, 
  editingMovie 
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingMovie ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={onInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input
                type="text"
                name="rating"
                value={formData.rating}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Genres (comma-separated)</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={onInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Action, Drama, Sci-Fi"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Director</label>
              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {editingMovie ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    rating: '',
    duration: '',
    genre: '',
    director: '',
    year: ''
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      console.log('Fetching movies with token:', token ? 'Valid token' : 'No token');
      
      const response = await fetch(`${import.meta.env.VITE_APP_API_HOST}/api/movies`, {
        headers: {
          'x-auth-token': token
        }
      });

      console.log('Movies API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} movies`);
      setMovies(data);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingMovie 
        ? `${import.meta.env.VITE_APP_API_HOST}/api/movies/${editingMovie._id}`
        : `${import.meta.env.VITE_APP_API_HOST}/api/movies`;
      
      console.log('Movie action:', editingMovie ? 'Update' : 'Create');
      console.log('Using URL:', url);
      console.log('Movie data:', formData);
      
      // Ensure genre is always an array even if empty
      let genreArray = [];
      if (formData.genre && typeof formData.genre === 'string') {
        genreArray = formData.genre.split(',').map(g => g.trim()).filter(g => g);
      } else if (Array.isArray(formData.genre)) {
        genreArray = formData.genre;
      }
      
      console.log('Processed genre array:', genreArray);
      
      const movieData = {
        ...formData,
        genre: genreArray
      };
      
      console.log('Final movie data being sent:', movieData);
      
      const method = editingMovie ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(movieData)
      });

      console.log('Response status:', response.status);
      
      // Safely parse the response
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('Response data:', responseData);
      } catch (error) {
        console.error('Error parsing response:', error);
        console.log('Raw response:', responseText);
        responseData = { message: 'Invalid server response' };
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save movie');
      }

      setShowModal(false);
      setEditingMovie(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        rating: '',
        duration: '',
        genre: '',
        director: '',
        year: ''
      });
      fetchMovies();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handleEdit = (movie) => {
    console.log('Editing movie:', movie);
    
    // Format genre properly, handling both array and string formats
    let genreValue = '';
    if (Array.isArray(movie.genre)) {
      genreValue = movie.genre.join(', ');
    } else if (typeof movie.genre === 'string') {
      genreValue = movie.genre;
    }
    
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      image: movie.image || '',
      rating: movie.rating || '',
      duration: movie.duration || '',
      genre: genreValue,
      director: movie.director || '',
      year: movie.year || ''
    });
    
    console.log('Form data set for editing:', {
      title: movie.title || '',
      description: movie.description || '',
      image: movie.image || '',
      rating: movie.rating || '',
      duration: movie.duration || '',
      genre: genreValue,
      director: movie.director || '',
      year: movie.year || ''
    });
    
    setShowModal(true);
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_APP_API_HOST}/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }

      fetchMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <div className="m-2">
  <h2 className="text-2xl font-bold inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-md shadow-sm">
    Manage Movies
  </h2>
</div>
        <button
          onClick={() => {
            setEditingMovie(null);
            setFormData({
              title: '',
              description: '',
              image: '',
              rating: '',
              duration: '',
              genre: '',
              director: '',
              year: ''
            });
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus size={20} className="mr-2" />
          Add New Movie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img src={movie.image} alt={movie.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{movie.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{movie.rating}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(movie)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MovieModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        editingMovie={editingMovie}
      />
    </div>
  );
};

export default AdminMovies; 