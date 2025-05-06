import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import host from "../../Link.js";

const MovieModal = memo(({ 
  showModal, 
  onClose, 
  onSubmit, 
  formData, 
  onInputChange, 
  editingMovie 
}) => {
  if (!showModal) return null;
  // ... rest of the modal code
});

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_HOST}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store admin token
      localStorage.setItem('adminToken', data.token);
      
      // Navigate to admin dashboard
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white">
      {/* Background Image for Mobile */}
      <div className="absolute inset-0 bg-cover bg-center md:hidden z-20 animate-fade-in-scale" 
           style={{ backgroundImage: "url('https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/8d8f28105415493.619ded067937d.jpg')" }}>
      </div>
      <div className="absolute inset-0 bg-gray-900 opacity-90 md:hidden z-30"></div>

      {/* Login Form */}
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center z-40">
        <div className="w-full max-w-md p-8 rounded-lg">
          <h1 className="text-6xl font-stretch-extra-expanded font-bold mb-10 text-white animate-slide-in-left">MRS</h1>
          <h2 className="text-2xl font-semibold mb-4 animate-slide-in-left delay-100">Admin Login</h2>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4 animate-slide-in-bottom delay-200">
              <input 
                type="text"
                name="username"
                className="w-full p-3 bg-transparent border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
              />
            </div>

            <div className="mb-4 animate-slide-in-bottom delay-300">
              <input 
                type="password"
                name="password"
                className="w-full p-3 bg-transparent border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 transition animate-slide-in-bottom delay-600 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0H4z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-4 animate-fade-in-scale delay-700">
            <span className="text-blue-400 cursor-pointer" onClick={() => navigate('/')}>Back to Home</span>
          </p>
        </div>
      </div>

      {/* Right Side - Movie Poster (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center animate-fade-in-scale" 
           style={{ backgroundImage: "url('https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/8d8f28105415493.619ded067937d.jpg')" }}>
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

export default AdminLogin; 