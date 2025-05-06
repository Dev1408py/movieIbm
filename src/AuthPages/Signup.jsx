import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import host from "../../Link.js";

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters required.");
    if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter.");
    if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter.");
    if (!/[0-9]/.test(password)) errors.push("At least one number.");
    if (!/[\W_]/.test(password)) errors.push("At least one special character.");
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join(" ");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    setErrors(prev => ({
      ...prev,
      [name]: '',
      general: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_HOST}/api/users/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          }),
        });

        // Check if response is empty
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (error) {
          console.error('Failed to parse response:', text);
          throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        // Store the token and userId in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', formData.username);
        localStorage.setItem('email', formData.email);

        // Store user data
        localStorage.setItem('user', JSON.stringify({
          username: formData.username,
          email: formData.email
        }));

        setLoading(false);
        navigate('/'); // Navigate to home page after successful registration
      } catch (error) {
        console.error('Signup error:', error);
        setLoading(false);
        setErrors({
          general: error.message || 'An error occurred during registration. Please try again.'
        });
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white">
      {/* Background Image for Mobile */}
      <div className="absolute inset-0 bg-cover bg-center md:hidden z-20 animate-fade-in-scale" 
           style={{ backgroundImage: "url('https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX700_.jpg')" }}>
      </div>
      <div className="absolute inset-0 bg-gray-900 opacity-90 md:hidden z-30"></div>

      {/* Left Side - Signup Form */}
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center z-40">
        <div className="w-full max-w-md p-8 rounded-lg">
          <h1 className="text-6xl font-stretch-extra-expanded font-bold mb-10 text-white animate-slide-in-left">MRS</h1>
          <h2 className="text-2xl font-semibold mb-4 animate-slide-in-left delay-100">Signup</h2>
          
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-500 text-sm">
                {errors.general}
              </div>
            )}
            
            <div className="mb-4 animate-slide-in-bottom delay-200">
              <input 
                type="text"
                name="username"
                className={`w-full p-3 bg-transparent border ${errors.username ? 'border-red-500' : 'border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>

            <div className="mb-4 animate-slide-in-bottom delay-300">
              <input 
                type="email"
                name="email"
                className={`w-full p-3 bg-transparent border ${errors.email ? 'border-red-500' : 'border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4 animate-slide-in-bottom delay-400">
              <input 
                type="password"
                name="password"
                className={`w-full p-3 bg-transparent border ${errors.password ? 'border-red-500' : 'border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="mb-4 animate-slide-in-bottom delay-500">
              <input 
                type="password"
                name="confirmPassword"
                className={`w-full p-3 bg-transparent border ${errors.confirmPassword ? 'border-red-500' : 'border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
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
                  Creating Account...
                </span>
              ) : (
                "SIGN UP"
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-4 animate-fade-in-scale delay-700">
            Already have an account? <span className="text-blue-400 cursor-pointer" onClick={() => navigate('/login')}>Login Here</span>
          </p>
        </div>
      </div>

      {/* Right Side - Movie Poster (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center animate-fade-in-scale" 
           style={{ backgroundImage: "url('https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX700_.jpg')" }}>
      </div>
    </div>
  );
}

export default Signup;