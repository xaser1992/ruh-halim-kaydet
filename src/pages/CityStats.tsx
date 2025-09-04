import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { moodOptions } from '@/utils/moodData';
import { moodCityMapping } from '@/utils/cityData';

interface CityStatsProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
}

interface CityMoodStat {
  city: string;
  mood: string;
  count: number;
}

interface TopCity {
  city: string;
  count: number;
  mood: string;
}

export const CityStats = ({ language, theme }: CityStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [topCities, setTopCities] = useState<Record<string, TopCity>>({});
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchCityStats();
  }, []);

  const fetchCityStats = async () => {
    try {
      // mood_stats tablosundan şehir bazlı ruh hali verilerini çek
      const { data, error } = await supabase
        .from('mood_stats')
        .select('city, mood')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching city stats:', error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Şehir ve ruh hali kombinasyonlarını say
      const cityMoodCounts: Record<string, Record<string, number>> = {};
      
      data.forEach(entry => {
        if (!cityMoodCounts[entry.city]) {
          cityMoodCounts[entry.city] = {};
        }
        if (!cityMoodCounts[entry.city][entry.mood]) {
          cityMoodCounts[entry.city][entry.mood] = 0;
        }
        cityMoodCounts[entry.city][entry.mood]++;
      });

      // Her ruh hali için en yüksek şehri bul
      const moodTopCities: Record<string, TopCity> = {};
      
      Object.keys(moodCityMapping).forEach(moodId => {
        let maxCount = 0;
        let topCity = '';
        
        Object.keys(cityMoodCounts).forEach(city => {
          const count = cityMoodCounts[city][moodId] || 0;
          if (count > maxCount) {
            maxCount = count;
            topCity = city;
          }
        });
        
        if (topCity && maxCount > 0) {
          moodTopCities[moodId] = {
            city: topCity,
            count: maxCount,
            mood: moodId
          };
        }
      });

      setTopCities(moodTopCities);

      // Grafik için veri hazırla - en popüler 10 şehir
      const cityTotals: Record<string, number> = {};
      Object.keys(cityMoodCounts).forEach(city => {
        cityTotals[city] = Object.values(cityMoodCounts[city]).reduce((sum, count) => sum + count, 0);
      });

      const sortedCities = Object.entries(cityTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      const chartDataFormatted = sortedCities.map(([city, total]) => ({
        city,
        total,
        ...Object.keys(moodCityMapping).reduce((acc, moodId) => {
          acc[moodId] = cityMoodCounts[city][moodId] || 0;
          return acc;
        }, {} as Record<string, number>)
      }));

      setChartData(chartDataFormatted);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodInfo = (moodId: string) => {
    const mood = moodOptions.find(m => m.id === moodId);
    return mood ? { emoji: mood.emoji, label: mood.labelTr } : { emoji: '😊', label: moodCityMapping[moodId] || 'Bilinmiyor' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
          }`}>
            İstatistikler yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="text-center space-y-2">
        <h1 className={`text-2xl font-bold transition-colors duration-300 ${
          theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
        }`}>
          Türkiye Ruh Hali Haritası 🇹🇷
        </h1>
        <p className={`text-sm transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
        }`}>
          Şehirlerin ruh hali dağılımını keşfedin
        </p>
      </div>

      {/* En Yüksek Ruh Halleri */}
      {Object.keys(topCities).length > 0 && (
        <Card className={`p-6 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 text-white' 
            : theme === 'feminine'
            ? 'bg-pink-50/80'
            : 'bg-white/80'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            🏆 Ruh Hali Şampiyonları
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(topCities).map(([moodId, cityData]) => {
              const moodInfo = getMoodInfo(moodId);
              return (
                <div
                  key={moodId}
                  className={`p-4 rounded-lg border transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border-gray-600' 
                      : theme === 'feminine'
                      ? 'bg-pink-100/50 border-pink-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{moodInfo.emoji}</span>
                    <Badge className={`transition-colors duration-300 ${
                      theme === 'dark' 
                        ? 'bg-purple-700 text-white' 
                        : theme === 'feminine'
                        ? 'bg-pink-500 text-white'
                        : 'bg-purple-500 text-white'
                    }`}>
                      #{1}
                    </Badge>
                  </div>
                  <h3 className={`font-semibold text-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
                  }`}>
                    En {moodInfo.label} Şehir
                  </h3>
                  <p className={`text-lg font-bold transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
                  }`}>
                    {cityData.city}
                  </p>
                  <p className={`text-xs transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
                  }`}>
                    {cityData.count} kayıt
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Grafik */}
      {chartData.length > 0 && (
        <Card className={`p-6 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 text-white' 
            : theme === 'feminine'
            ? 'bg-pink-50/80'
            : 'bg-white/80'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            📊 En Aktif Şehirler
          </h2>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="city" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                  tick={{ fill: theme === 'dark' ? '#e5e7eb' : theme === 'feminine' ? '#be185d' : '#374151' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: theme === 'dark' ? '#e5e7eb' : theme === 'feminine' ? '#be185d' : '#374151' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#374151' : theme === 'feminine' ? '#fdf2f8' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #4b5563' : theme === 'feminine' ? '1px solid #f3e8ff' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#ffffff' : theme === 'feminine' ? '#be185d' : '#374151'
                  }}
                />
                <Bar 
                  dataKey="total" 
                  fill={theme === 'dark' ? '#8b5cf6' : theme === 'feminine' ? '#ec4899' : '#6366f1'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Veri Yoksa */}
      {Object.keys(topCities).length === 0 && chartData.length === 0 && (
        <Card className={`p-8 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 text-white' 
            : theme === 'feminine'
            ? 'bg-pink-50/80'
            : 'bg-white/80'
        }`}>
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className={`text-lg transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
            }`}>
              Henüz yeterli veri bulunmuyor
            </p>
            <p className={`text-sm mt-2 transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
            }`}>
              Şehir istatistikleri görmek için daha fazla ruh hali kaydedilmesi gerekiyor
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};