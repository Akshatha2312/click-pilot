import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiArrowLeft, HiLink, HiEye, HiCalendarDays, HiCheck } from "react-icons/hi2";
import api, { API_BASE_URL } from "../api/axios";
import StatCard from "../components/StatCard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Analytics() {
  const { id } = useParams();
  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState([]);
  const [trends, setTrends] = useState([]);
  const [browsers, setBrowsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const endpoints = [
      api.get(`/links/analytics/${id}/overview`),
api.get(`/links/analytics/${id}/recent`),
api.get(`/links/analytics/${id}/daily-trends?days=30`),
api.get(`/links/analytics/${id}/browser-breakdown`),
api.get(`/links/analytics/${id}/device-breakdown`),
api.get(`/links/analytics/${id}/country-breakdown`),
    ];

    Promise.all(endpoints)
      .then(([
        overviewRes,
        recentRes,
        trendsRes,
        browsersRes,
        devicesRes,
        countriesRes,
      ]) => {
        setOverview(overviewRes.data.overview || null);
        setRecent(recentRes.data.recent || []);
        setTrends(trendsRes.data.trends || []);
        setBrowsers(browsersRes.data.browsers || []);
        setDevices(devicesRes.data.devices || []);
        setCountries(countriesRes.data.countries || []);
        setError(null);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "Failed to load analytics";
        setError(message);
        toast.error(`❌ ${message}`);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </motion.div>
    );
  }

  if (error || !overview) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <Link to="/app/links" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700">
          <HiArrowLeft className="h-4 w-4" /> Back to Links
        </Link>
        <div className="card p-6 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error || "Analytics not found"}</p>
        </div>
      </motion.div>
    );
  }

  const shortUrl = `${API_BASE_URL}/api/links/${overview.shortCode}`;

  const dailyData = trends.map((t) => ({ date: t.date, clicks: t.clicks }));
  const browserData = browsers.map((b) => ({ name: b.browser || "Other", value: b.count }));
  const deviceData = devices.map((d) => ({ name: d.device || "Unknown", value: d.count }));
  const countryData = countries.map((c) => ({ name: c.country || "Unknown", value: c.count }));

  const copyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Link copied!");
  };

  return (
    <motion.div initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item} className="flex items-center gap-3">
        <Link to="/app/links" className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <HiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="heading-lg">Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Performance for <code className="font-mono">{overview.shortCode}</code>
          </p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div initial="hidden" animate="show" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <StatCard label="Total Clicks" value={overview.totalClicks || 0} note="All-time" icon={<HiEye className="h-6 w-6" />} tone="indigo" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Created" value={new Date(overview.createdAt).toLocaleDateString()} note="Start date" icon={<HiCalendarDays className="h-6 w-6" />} tone="cyan" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Status" value={overview.status === "expired" ? "Expired" : "Active"} note={overview.status === "expired" ? "No longer active" : "Live"} icon={<HiCheck className="h-6 w-6" />} tone={overview.status === "expired" ? "orange" : "emerald"} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Last Visit" value={overview.lastVisited
  ? new Date(overview.lastVisited).toLocaleString()
  : "Never"} note="Recent activity" icon={<HiLink className="h-6 w-6" />} tone="pink" />
        </motion.div>
        {overview.expiresAt && (
          <motion.div variants={item}>
            <StatCard label="Expires" value={new Date(overview.expiresAt).toLocaleDateString()} note={overview.status === "expired" ? "Expired" : "In future"} icon={<HiCalendarDays className="h-6 w-6" />} tone={overview.status === "expired" ? "red" : "blue"} />
          </motion.div>
        )}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item} className="card p-6 border border-slate-200/50 dark:border-slate-800/40 shadow-sm bg-white/50 dark:bg-slate-900/30">
          <h3 className="mb-4 font-heading text-lg font-bold text-slate-800 dark:text-white">Click Trend</h3>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800/50" />
                <XAxis dataKey="date" stroke="currentColor" className="text-slate-400 dark:text-slate-500" style={{ fontSize: '11px' }} />
                <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" style={{ fontSize: '11px' }} />
                <ReTooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                  labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="card p-6 border border-slate-200/50 dark:border-slate-800/40 shadow-sm bg-white/50 dark:bg-slate-900/30">
          <h3 className="mb-4 font-heading text-lg font-bold text-slate-800 dark:text-white">Device Distribution</h3>
          <div className="flex items-center justify-center h-40">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} fill="#6366f1" paddingAngle={3}>
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#6366f1", "#a855f7", "#ec4899"][index % 3]} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {(browserData.length > 0 || countryData.length > 0) && (
  <div className="grid gap-4 lg:grid-cols-2">
    {browserData.length > 0 && (
      <motion.div
        variants={item}
        className="card p-6 border border-slate-200/50 dark:border-slate-800/40 shadow-sm"
      >
        <h3 className="mb-4 font-heading text-lg font-bold">
          Browser Distribution
        </h3>

        <div className="flex items-center justify-center h-48">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={browserData}
                dataKey="value"
                nameKey="name"
                outerRadius={70}
              >
                {browserData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={[
                      "#4f46e5",
                      "#6366f1",
                      "#8b5cf6",
                      "#a855f7",
                      "#ec4899",
                    ][index % 5]}
                  />
                ))}
              </Pie>

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    )}

    {countryData.length > 0 && (
      <motion.div
        variants={item}
        className="card p-6 border border-slate-200/50 dark:border-slate-800/40 shadow-sm"
      >
        <h3 className="mb-4 font-heading text-lg font-bold">
          Country Distribution
        </h3>

        <div className="relative h-40">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={countryData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    )}
  </div>
)}
      
      {/* Recent Visits Table */}
<div className="card p-6 mt-8 shadow-lg border border-slate-200 dark:border-slate-700">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold">
      Recent Visits
    </h2>

    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
      {recent.length} Visits
    </span>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left p-3">Timestamp</th>
          <th className="text-left p-3">Device</th>
          <th className="text-left p-3">Browser</th>
          <th className="text-left p-3">OS</th>
        </tr>
      </thead>

      <tbody>
        {recent.map((visit, index) => (
          <tr
            key={index}
            className="border-b hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <td className="py-2 px-3">
              {new Date(visit.timestamp).toLocaleString()}
            </td>

            <td className="p-3 capitalize">
              {visit.device}
            </td>

            <td className="p-3 capitalize">
              {visit.browser}
            </td>

            <td className="p-3">
              {visit.os}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
{/* Link Details */}
      {/* Link Details */}
{/* Link Details */}
<motion.div variants={item} className="card p-6">        <h3 className="mb-4 font-heading text-lg font-bold">Link Details</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Short URL</p>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
              <code className="flex-1 truncate font-mono text-sm text-slate-900 dark:text-white">{shortUrl}</code>
              <motion.button whileTap={{ scale: 0.95 }} onClick={copyLink} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><HiCheck className="h-4 w-4" /></motion.button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Original URL</p>
            <p className="mt-2 truncate rounded-lg bg-slate-100 dark:bg-slate-800 p-3 font-mono text-sm text-slate-900 dark:text-white">{overview.originalUrl}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</p>
            <p className="mt-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white">{new Date(overview.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <a href={shortUrl} target="_blank" rel="noreferrer" className="btn-primary">Visit Short Link</a>
      </motion.div>
    </motion.div>
  );
}
