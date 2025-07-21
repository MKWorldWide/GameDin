import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import React from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const usernameInputRef = React.useRef<HTMLInputElement>(null);
  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = React.useRef<HTMLInputElement>(null);

  // Focus username input on mount for accessibility
  React.useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body" aria-label="Registration form" role="form">
          <h2 className="card-title justify-center text-2xl mb-4" id="register-form-title">Create Account</h2>

          {/* Accessibility: Announce errors to screen readers */}
          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="register-form-title">
            <div className="form-control">
              <label className="label" htmlFor="register-username">
                <span className="label-text">Username</span>
              </label>
              <input
                ref={usernameInputRef}
                id="register-username"
                type="text"
                name="username"
                placeholder="Choose a username"
                className="input input-bordered"
                value={formData.username}
                onChange={handleChange}
                required
                aria-label="Username"
                autoComplete="username"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="register-email">
                <span className="label-text">Email</span>
              </label>
              <input
                ref={emailInputRef}
                id="register-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                className="input input-bordered"
                value={formData.email}
                onChange={handleChange}
                required
                aria-label="Email address"
                autoComplete="email"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="register-password">
                <span className="label-text">Password</span>
              </label>
              <input
                ref={passwordInputRef}
                id="register-password"
                type="password"
                name="password"
                placeholder="Create a password"
                className="input input-bordered"
                value={formData.password}
                onChange={handleChange}
                required
                aria-label="Password"
                autoComplete="new-password"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="register-confirm-password">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                ref={confirmPasswordInputRef}
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className="input input-bordered"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                aria-label="Confirm password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
              aria-label="Submit registration form"
            >
              Register
            </button>
          </form>

          <div className="divider">OR</div>

          <button
            onClick={() => navigate('/login')}
            className="btn btn-outline btn-block"
            aria-label="Go to login page"
          >
            Login to Existing Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
