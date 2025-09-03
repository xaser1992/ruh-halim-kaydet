import { useState, useEffect } from 'react';

export const useUsername = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load username from localStorage on mount
    const storedUsername = localStorage.getItem('selected_username');
    setUsername(storedUsername);
    setLoading(false);
  }, []);

  const updateUsername = (newUsername: string) => {
    localStorage.setItem('selected_username', newUsername);
    setUsername(newUsername);
  };

  const clearUsername = () => {
    localStorage.removeItem('selected_username');
    setUsername(null);
  };

  return {
    username,
    updateUsername,
    clearUsername,
    hasUsername: !!username,
    loading
  };
};