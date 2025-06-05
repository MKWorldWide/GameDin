<<<<<<< HEAD
import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
=======
import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { loginFormSchema } from '../utils/validation';
import { useNetwork } from '../hooks/useNetwork';

// Define the shape of our form data
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, connectionQuality } = useNetwork();
  const { 
    login, 
    loginWithGoogle, 
    loginWithDiscord, 
    loginWithTwitch,
    handleOAuthRedirect,
    isAuthenticated, 
    isLoading, 
    error: authError 
  } = useAuth();

  // Parse the redirect URL from query parameters
  const query = useMemo(() => new URLSearchParams(location.search), [location]);
  const from = query.get('redirect') || '/dashboard';
  const isOAuthRedirect = query.has('code') && query.has('state');
  const oauthError = query.get('error');

  // Initialize the form with Zod validation
  const form = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    schema: loginFormSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      await login(values.email, values.password, values.rememberMe);
    }
  });

  // Handle OAuth redirect on component mount
  useEffect(() => {
    if (isOAuthRedirect) {
      handleOAuthRedirect(window.location.href);
    }
  }, [isOAuthRedirect, handleOAuthRedirect]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle OAuth login buttons
  const handleGoogleLogin = () => loginWithGoogle();
  const handleDiscordLogin = () => loginWithDiscord();
  const handleTwitchLogin = () => loginWithTwitch();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            className="mx-auto h-12 w-auto" 
            src="/logo.png" 
            alt="GameDin Logo" 
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link 
              to="/register" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
              aria-label="Register for a new account"
            >
              register for a new account
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error message section */}
          <AnimatePresence mode="wait">
            {(form.errors.form || authError || oauthError) && (
              <motion.div 
                className="mb-4 bg-red-50 border-l-4 border-red-400 p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                role="alert"
                aria-live="polite"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {form.errors.form || authError || oauthError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offline warning */}
          <AnimatePresence mode="wait">
            {!isOnline && (
              <motion.div 
                className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                role="alert"
                aria-live="polite"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You are currently offline. Login requires an internet connection.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={form.handleSubmit} noValidate>
            {/* Email field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    form.touched.email && form.errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  {...form.getFieldProps('email')}
                  aria-describedby={form.touched.email && form.errors.email ? "email-error" : undefined}
                />
                <AnimatePresence mode="wait">
                  {form.touched.email && form.errors.email && (
                    <motion.p 
                      className="mt-2 text-sm text-red-600" 
                      id="email-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {form.errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                    aria-label="Forgot your password"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    form.touched.password && form.errors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  {...form.getFieldProps('password')}
                  aria-describedby={form.touched.password && form.errors.password ? "password-error" : undefined}
                />
                <AnimatePresence mode="wait">
                  {form.touched.password && form.errors.password && (
                    <motion.p 
                      className="mt-2 text-sm text-red-600" 
                      id="password-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {form.errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  {...form.getFieldProps('rememberMe')}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <motion.button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !isOnline}
                whileHover={{ scale: isLoading || !isOnline ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !isOnline ? 1 : 0.98 }}
                aria-disabled={isLoading || !isOnline}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {/* Google login button */}
              <motion.button
                onClick={handleGoogleLogin}
                disabled={isLoading || !isOnline}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading || !isOnline ? 1 : 1.05 }}
                whileTap={{ scale: isLoading || !isOnline ? 1 : 0.95 }}
                aria-label="Sign in with Google"
                aria-disabled={isLoading || !isOnline}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
              </motion.button>

              {/* Discord login button */}
              <motion.button
                onClick={handleDiscordLogin}
                disabled={isLoading || !isOnline}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading || !isOnline ? 1 : 1.05 }}
                whileTap={{ scale: isLoading || !isOnline ? 1 : 0.95 }}
                aria-label="Sign in with Discord"
                aria-disabled={isLoading || !isOnline}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.39-.444.885-.608 1.279a18.271 18.271 0 0 0-5.489 0 12.407 12.407 0 0 0-.617-1.278.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419Z" />
                </svg>
              </motion.button>

              {/* Twitch login button */}
              <motion.button
                onClick={handleTwitchLogin}
                disabled={isLoading || !isOnline}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading || !isOnline ? 1 : 1.05 }}
                whileTap={{ scale: isLoading || !isOnline ? 1 : 0.95 }}
                aria-label="Sign in with Twitch"
                aria-disabled={isLoading || !isOnline}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
