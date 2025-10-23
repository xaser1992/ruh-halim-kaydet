import { useState, useEffect } from 'react';

// Türkiye'deki illeri koordinatlara göre bulmak için basit bir fonksiyon
const getCityFromCoordinates = async (lat: number, lon: number): Promise<string> => {
  try {
    // Nominatim API kullanarak reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
    );
    const data = await response.json();
    
    // principalSubdivision (il) alanını kullan
    const city = data.address?.['ISO3166-2-lvl4']?.split('-')[1] || 
                 data.address?.state || 
                 data.address?.province || 
                 data.address?.city || 
                 'Bilinmiyor';
    return city;
  } catch (error) {
    console.error('Konum bilgisi alınamadı:', error);
    return 'Bilinmiyor';
  }
};

export const useCity = () => {
  const [city, setCity] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCity = localStorage.getItem('userCity');
    if (savedCity) {
      setCity(savedCity);
      setLoading(false);
      return;
    }

    // Konum izni al ve otomatik şehir bul
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const detectedCity = await getCityFromCoordinates(latitude, longitude);
          setCity(detectedCity);
          localStorage.setItem('userCity', detectedCity);
          setLoading(false);
        },
        (error) => {
          console.error('Konum izni alınamadı:', error);
          setCity('Bilinmiyor');
          localStorage.setItem('userCity', 'Bilinmiyor');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setCity('Bilinmiyor');
      localStorage.setItem('userCity', 'Bilinmiyor');
      setLoading(false);
    }
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