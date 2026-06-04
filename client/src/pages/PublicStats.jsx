import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiArrowLeft, HiLink, HiEye, HiCalendarDays } from "react-icons/hi2";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";
import { API_BASE_URL, getShortUrl } from "../api/axios";
import axios from "axios";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function PublicStats() {
  const { shortCode } = useParams();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE_URL}/api/links/stats/${shortCode}`),
      axios.get(`${API_BASE_URL}/api/links/stats/${shortCode}/trends`),
    ])
      .then(([statsRes, trendsRes]) => {
        setStats(statsRes.data.stats);
        setTrends(trendsRes.data.data || []);
        setError(null);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "Link not found";
        setError(message);
        toast.error(`❌ ${message}`);
      })
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen animated-bg bg-hero-light dark:bg-hero-dark flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen animated-bg bg-hero-light dark:bg-hero-dark flex items-center justify-center px-4">
        <div className="card p-8 text-center max-w-md">
          <h1 className="heading-lg mb-2">Link Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error || "This link may have been deleted or expired."}</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = getShortUrl(stats.shortCode);
  const isExpired = stats.status === "expired";

  return (
    <div className="min-h-screen animated-bg bg-hero-light dark:bg-hero-dark py-8 px-4">
      <motion.div initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
        <motion.div variants={item} className="flex items-center justify-between">
          <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <HiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="heading-lg">Link Stats</h1>
          <div className="w-10" />
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <HiEye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.clicks}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Total Clicks</p>
          </div>

          <div className="card p-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <HiCalendarDays className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{new Date(stats.createdAt).toLocaleDateString()}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Created</p>
          </div>

          <div className="card p-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <HiCalendarDays className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.lastVisitedAt ? new Date(stats.lastVisitedAt).toLocaleDateString() : "Never"}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Last Visited</p>
          </div>

          <div className="card p-6 text-center">
            <div
              className={`mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                isExpired ? "bg-red-100 dark:bg-red-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"
              }`}
            >
              <span
                className={`text-sm font-bold ${isExpired ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                {isExpired ? "✕" : "✓"}
              </span>
            </div>
            <p className="text-lg font-bold capitalize text-slate-900 dark:text-white">{stats.status}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {stats.expiresAt ? new Date(stats.expiresAt).toLocaleDateString() : "No expiry"}
            </p>
          </div>
        </motion.div>

        {/* Trends Chart */}
        {trends.length > 0 ? (
          <motion.div variants={item} className="card p-6">
            <h2 className="font-heading text-lg font-bold mb-4">Daily Click Trend</h2>
            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.5} />
                  <YAxis stroke="currentColor" opacity={0.5} />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "rgb(226, 232, 240)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="rgb(79, 70, 229)"
                    strokeWidth={2}
                    dot={{ fill: "rgb(79, 70, 229)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : null}

        {/* Details Card */}
        <motion.div variants={item} className="card p-6">
          <h2 className="font-heading text-lg font-bold mb-4">Link Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Short URL</p>
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3 font-mono text-sm break-all text-slate-900 dark:text-white">
                {shortUrl}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Original URL</p>
              <a
                href={stats.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 break-all underline"
              >
                {stats.originalUrl}
              </a>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} className="flex gap-3 justify-center">
          <a href={stats.originalUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Visit Link
          </a>
          <Link to="/" className="btn-secondary">
            Create Your Own
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
