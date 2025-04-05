import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
// Import the background image directly
import backgroundImage from './background.png';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login(username, password);
      
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-4 bg-opacity-10 bg-white border-b border-blue-800">
          <div className="container mx-auto px-4 flex items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">
                <span className="text-red-600">STUDENT</span> <span className="text-white">ATTENDANCE SYSTEM</span>
              </h1>
            </div>
            <nav className="ml-auto">
              <ul className="flex gap-6">
                <li><a href="#" className="text-white hover:text-blue-300">Home</a></li>
                <li><a href="#" className="text-white hover:text-blue-300">About</a></li>
                <li><a href="#" className="text-white hover:text-blue-300">Services</a></li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center">
          <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Left content */}
            <div className="w-1/2 pr-12">
              <h2 className="text-5xl font-bold text-white mb-4">Efficient Attendance Management</h2>
              <p className="text-xl text-gray-300 mb-6">
                Track student attendance seamlessly with our smart solution.
              </p>
              <a href="#" className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded transition duration-200">
                Get Started
              </a>
            </div>

            {/* Login Box */}
            <div className="w-96 bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-lg shadow-xl p-8">
              <h3 className="text-2xl font-medium text-white text-center mb-6">LOGIN</h3>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                {error && (
                  <div className="text-center text-red-500 font-medium">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;