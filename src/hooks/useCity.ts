import { useState, useEffect } from 'react';

export const useCity = () => {
  const [city, setCity] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCity = localStorage.getItem('userCity');
    if (savedCity) {
      setCity(savedCity);
    }
    setLoading(false);
  }, []);

  const updateCity = (newCity: string) => {
    setCity(newCity);
    localStorage.setItem('userCity', newCity);
  };

  const hasCity = Boolean(city);

  return {
    city,
    updateCity,
    hasCity,
    loading
  };
};