import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { mapCognitoUserToIUser } from '../utils/userMapper';
import { IUser } from '../types/social';

export function useUser() {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();
        const mappedUser = mapCognitoUserToIUser(cognitoUser);
        setUser(mappedUser);
        setIsAuthenticated(true);
      } catch (err) {
        setError(err as Error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isAuthenticated, loading, error };
} 