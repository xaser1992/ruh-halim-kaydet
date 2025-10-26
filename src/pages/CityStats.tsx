import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/hooks/useCity";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface CityStatsProps {
  theme: "light" | "dark" | "feminine";
  language: "tr" | "en" | "de" | "fr" | "es" | "it" | "ru";
}

const COLORS = ["#6366F1", "#EC4899", "#22C55E", "#FACC15", "#F97316", "#06B6D4"];

const translations = {
  tr: {
    title: "Ruh Hali İstatistikleri 🌆",
    cityTitle: "Şehrinizin Ruh Hali Dağılımı",
    countryTitle: "Türkiye Ortalaması",
    weeklyTrend: "Son 7 Gün Ruh Hali Trendi",
    topCities: "En Mutlu 5 Şehir 🏆",
    userImpact: "Sizin Katkınız",
    mostCommonMood: "En Sık Görülen Ruh Hali",
    lastEntry: "Son Kayıt Tarihi",
    noData: "Henüz istatistik bulunmuyor",
  },
  en: {
    title: "Mood Statistics 🌆",
    cityTitle: "Your City's Mood Distribution",
    countryTitle: "National Average",
    weeklyTrend: "Last 7 Days Mood Trend",
    topCities: "Top 5 Happiest Cities 🏆",
    userImpact: "Your Contribution",
    mostCommonMood: "Most Common Mood",
    lastEntry: "Last Entry Date",
    noData: "No statistics yet",
  },
  de: {
    title: "Stimmungsstatistiken 🌆",
    cityTitle: "Stimmungsverteilung deiner Stadt",
    countryTitle: "Landesdurchschnitt",
    weeklyTrend: "Stimmungstrend der letzten 7 Tage",
    topCities: "Top 5 der glücklichsten Städte 🏆",
    userImpact: "Dein Beitrag",
    mostCommonMood: "Häufigste Stimmung",
    lastEntry: "Letztes Eintragsdatum",
    noData: "Noch keine Statistiken",
  },
  fr: {
    title: "Statistiques d'Humeur 🌆",
    cityTitle: "Distribution d'Humeur de votre Ville",
    countryTitle: "Moyenne Nationale",
    weeklyTrend: "Tendance d'Humeur des 7 Derniers Jours",
    topCities: "Top 5 des Villes les Plus Heureuses 🏆",
    userImpact: "Votre Contribution",
    mostCommonMood: "Humeur la Plus Fréquente",
    lastEntry: "Date de la Dernière Entrée",
    noData: "Pas encore de statistiques",
  },
  es: {
    title: "Estadísticas de Estado de Ánimo 🌆",
    cityTitle: "Distribución de Estado de Ánimo de tu Ciudad",
    countryTitle: "Promedio Nacional",
    weeklyTrend: "Tendencia de Estado de Ánimo de los Últimos 7 Días",
    topCities: "Top 5 de las Ciudades Más Felices 🏆",
    userImpact: "Tu Contribución",
    mostCommonMood: "Estado de Ánimo Más Común",
    lastEntry: "Fecha de Última Entrada",
    noData: "Aún no hay estadísticas",
  },
  it: {
    title: "Statistiche dell'Umore 🌆",
    cityTitle: "Distribuzione dell'Umore della tua Città",
    countryTitle: "Media Nazionale",
    weeklyTrend: "Tendenza dell'Umore degli Ultimi 7 Giorni",
    topCities: "Top 5 delle Città Più Felici 🏆",
    userImpact: "Il Tuo Contributo",
    mostCommonMood: "Umore Più Comune",
    lastEntry: "Data dell'Ultima Voce",
    noData: "Nessuna statistica ancora",
  },
  ru: {
    title: "Статистика Настроения 🌆",
    cityTitle: "Распределение Настроения в Вашем Городе",
    countryTitle: "Средний Показатель по Стране",
    weeklyTrend: "Тренд Настроения за Последние 7 Дней",
    topCities: "Топ 5 Самых Счастливых Городов 🏆",
    userImpact: "Ваш Вклад",
    mostCommonMood: "Самое Частое Настроение",
    lastEntry: "Дата Последней Записи",
    noData: "Пока нет статистики",
  },
};

export default function CityStats({ theme, language }: CityStatsProps) {
  const { city } = useCity();
  const { user } = useAuth();
  const [cityStats, setCityStats] = useState<any[]>([]);
  const [countryStats, setCountryStats] = useState<any[]>([]);
  const [topCities, setTopCities] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const t = translations[language] || translations.tr;

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Şehir mood istatistikleri
        const { data: cityMoodData } = await supabase
          .from("mood_stats")
          .select("mood")
          .eq("city", city);

        // Türkiye mood istatistikleri
        const { data: countryMoodData } = await supabase
          .from("mood_stats")
          .select("mood");

        // Şehirlere göre toplam sayı
        const { data: cityCountData } = await supabase
          .from("mood_stats")
          .select("city");

        // Haftalık trend
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
        const { data: weekly } = await supabase
          .from("stats")
          .select("created_date, mood")
          .gte("created_date", sevenDaysAgo)
          .order("created_date", { ascending: true });

        // Kullanıcı istatistikleri
        const { count: userStats } = await supabase
          .from("stats")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user?.id);

        const { count: totalStats } = await supabase
          .from("stats")
          .select("*", { count: "exact", head: true });

        // Şehir mood dağılımı
        if (cityMoodData) {
          const moodCounts = cityMoodData.reduce((acc: any, curr: any) => {
            acc[curr.mood] = (acc[curr.mood] || 0) + 1;
            return acc;
          }, {});
          setCityStats(Object.entries(moodCounts).map(([mood, count]) => ({ mood, count })));
        }

        // Türkiye mood dağılımı
        if (countryMoodData) {
          const moodCounts = countryMoodData.reduce((acc: any, curr: any) => {
            acc[curr.mood] = (acc[curr.mood] || 0) + 1;
            return acc;
          }, {});
          setCountryStats(Object.entries(moodCounts).map(([mood, count]) => ({ mood, count })));
        }

        // En aktif şehirler
        if (cityCountData) {
          const cityCounts = cityCountData.reduce((acc: any, curr: any) => {
            acc[curr.city] = (acc[curr.city] || 0) + 1;
            return acc;
          }, {});
          const sorted = Object.entries(cityCounts)
            .map(([city, count]) => ({ city, count }))
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5);
          setTopCities(sorted);
        }

        // Haftalık trend
        if (weekly) {
          const grouped = Object.values(
            weekly.reduce((acc: any, curr: any) => {
              const date = curr.created_date;
              acc[date] = acc[date] || { date, count: 0 };
              acc[date].count += 1;
              return acc;
            }, {})
          );
          setWeeklyData(grouped);
        }

        setUserCount(userStats || 0);
        setTotalCount(totalStats || 1);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchStats();
    }
  }, [city, user?.id]);

  const mostMood = cityStats.length
    ? cityStats.reduce((a, b) => (a.count > b.count ? a : b)).mood
    : null;

  const lastEntryDate =
    weeklyData.length > 0 ? weeklyData[weeklyData.length - 1].date : "-";

  const userImpact = totalCount > 0 ? ((userCount / totalCount) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cityStats.length && !weeklyData.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        {t.noData}
      </Card>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-center text-foreground">
        {t.title}
      </h2>

      {/* Şehir & Türkiye Ortalaması */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatPie title={`${t.cityTitle} (${city})`} data={cityStats} theme={theme} />
        <StatPie title={t.countryTitle} data={countryStats} theme={theme} />
      </div>

      {/* Haftalık Trend */}
      {weeklyData.length > 0 && (
        <Card className="p-4 bg-card text-card-foreground">
          <h3 className="text-lg font-semibold mb-2">{t.weeklyTrend}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Kayıt Sayısı"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 5, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* En Mutlu Şehirler */}
      {topCities.length > 0 && (
        <Card className="p-4 bg-card text-card-foreground">
          <h3 className="text-lg font-semibold mb-2">{t.topCities}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topCities}>
              <XAxis dataKey="city" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Bilgi Kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard theme={theme} label={t.mostCommonMood} value={mostMood || "-"} emoji="🌡️" />
        <InfoCard theme={theme} label={t.lastEntry} value={lastEntryDate} emoji="📅" />
        <InfoCard theme={theme} label={t.userImpact} value={`${userImpact}%`} emoji="💪" />
      </div>
    </motion.div>
  );
}

function StatPie({ title, data, theme }: any) {
  return (
    <Card className="p-4 bg-card text-card-foreground">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="mood" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_: any, i: number) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

function InfoCard({ theme, label, value, emoji }: any) {
  return (
    <Card className="p-3 text-center font-medium bg-card text-card-foreground border-border">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </Card>
  );
}