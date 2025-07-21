import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error: authError, user } = useAuth();

  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);

  // Focus email input on mount for accessibility
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async(e: React.FormEvent) => {
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
      <Paper sx={{ p: 4 }} aria-label="Login form" role="form">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }} aria-labelledby="login-form-title">
          <TextField
            inputRef={emailInputRef}
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            inputProps={{
              'aria-label': 'Email address',
              autoComplete: 'username',
            }}
            autoFocus
          />
          <TextField
            inputRef={passwordInputRef}
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            inputProps={{
              'aria-label': 'Password',
              autoComplete: 'current-password',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Move focus to submit button for accessibility
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            aria-label="Submit login form"
          >
            Login
          </Button>
          {/* Accessibility: Announce errors to screen readers */}
          {error && (
            <Alert severity="error" role="alert" aria-live="assertive" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
