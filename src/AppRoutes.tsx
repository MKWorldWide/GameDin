import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useUser } from './hooks/useUser';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Token from './pages/Token';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotificationSettings from './pages/NotificationSettings';
import Games from './pages/Games';
import GameDetails from './pages/GameDetails';

// Components
import Feed from './components/Feed';
import Messaging from './components/Messaging';
import Forums from './components/Forums';
import Achievements from './components/Achievements';
import Tournaments from './components/Tournaments';
import Jobs from './components/Jobs';
import GameAnalytics from './components/GameAnalytics';

interface IPrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<IPrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/token" element={<Token />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Box sx={{ p: 3, mt: 8 }}>
                <Messaging />
              </Box>
            </PrivateRoute>
          }
        />
        <Route
          path="/forums"
          element={
            <PrivateRoute>
              <Box sx={{ mt: 8 }}>
                <Forums />
              </Box>
            </PrivateRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <PrivateRoute>
              <Box sx={{ mt: 8 }}>
                <Achievements />
              </Box>
            </PrivateRoute>
          }
        />
        <Route
          path="/tournaments"
          element={
            <PrivateRoute>
              <Box sx={{ mt: 8 }}>
                <Tournaments />
              </Box>
            </PrivateRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <Box sx={{ mt: 8 }}>
                <Jobs />
              </Box>
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Box sx={{ mt: 8 }}>
                <GameAnalytics />
              </Box>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <PrivateRoute>
              <Box sx={{ mt: 8 }}>
                <NotificationSettings />
              </Box>
            </PrivateRoute>
          }
        />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetails />} />
      </Routes>
    </Box>
  );
};

export default AppRoutes;
