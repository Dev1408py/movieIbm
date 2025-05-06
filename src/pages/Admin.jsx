import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { Users, Film, TrendingUp, Clock, Star, Settings, List, User, ChartBar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import host from "../../Link.js";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        console.log('Admin token:', token); // Debug log

        if (!token) {
          throw new Error('Admin authentication required');
        }

        console.log('Fetching admin stats...'); // Debug log
        const response = await fetch(`${import.meta.env.VITE_APP_API_HOST}/api/admin/stats`, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch admin statistics' }));
          console.error('Error response:', errorData); // Debug log
          throw new Error(errorData.message || 'Failed to fetch admin statistics');
        }

        const data = await response.json();
        console.log('Received data:', data); // Debug log

        if (!data) {
          throw new Error('No data received from server');
        }
        
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError(err.message || 'An error occurred while fetching admin statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
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
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Dashboard</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/admin/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];

  const StatCard = ({ icon: Icon, title, value, className }) => (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <Icon className="text-indigo-600" size={24} />
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-indigo-600 font-medium mt-1">
            {data.value.toFixed(1)}% of total movies
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Navigation Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center">
        <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
</button>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/admin/movies')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <List size={20} className="mr-2" />
              Manage Movies
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <User size={20} className="mr-2" />
              Manage Users
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Settings size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Total Users" value={stats.totalUsers} />
        <StatCard icon={Users} title="Active Users Today" value={stats.activeUsers} />
        <StatCard icon={Film} title="Total Movies" value={stats.totalMovies} />
        <StatCard icon={Clock} title="Recently Added Movies" value={stats.recentMovies} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Movies by Genre</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.genreData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = 25 + innerRadius + (outerRadius - innerRadius);
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      className="text-xs"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                    >
                      {`${stats.genreData[index].name} (${value.toFixed(1)}%)`}
                    </text>
                  );
                }}
              >
                {stats.genreData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Label value="Genre Distribution" position="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Movie Recommendations */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Movie Recommendations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.recommendationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="genre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4F46E5" name="Number of Movies" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Movies by Genre */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Movies by Genre</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={stats.recommendationData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="genre" 
              type="category" 
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip formatter={(value) => [`${value} movies`, 'Count']} />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="#7C3AED" 
              name="Number of Movies" 
              label={{ position: 'right', fill: '#666', fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Movies & Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Movies */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Most Popular Movies</h3>
          <div className="space-y-4">
            {stats.popularMovies.map((movie, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="text-indigo-600 mr-3" size={20} />
                  <span>{movie.title}</span>
                </div>
                <span className="text-gray-600">{movie.views} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
          <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-indigo-100 text-indigo-800 font-semibold px-4 py-2 rounded-full mb-3">
              Coming Soon
            </div>
            <p className="text-gray-500 text-center">
              User feedback functionality will be available in the next update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;