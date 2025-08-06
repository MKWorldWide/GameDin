import { useState, useEffect } from 'react';

const getPath = () => window.location.hash.slice(1) || '/';

export const useRouter = () => {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const handleHashChange = () => {
      setPath(getPath());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newPath: string) => {
    window.location.hash = newPath;
  };

  return { path, navigate };
};