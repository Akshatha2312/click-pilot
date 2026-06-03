import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiArrowLeft, HiLink, HiEye, HiCalendarDays, HiCheck, HiDevicePhoneMobile, HiGlobeAlt } from "react-icons/hi2";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";
import api, { API_BASE_URL } from "../api/axios";
import StatCard from "../components/StatCard";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/links/analytics/${id}`)
      .then((r) => {
        setData(r.data.analytics);
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

  if (error || !data) {
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

  const shortUrl = `${API_BASE_URL}/api/links/${data.shortCode}`;

  // Generate click trend data
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Clicks",
        data: [3, 5, 2, 8, 12, 9, data.totalClicks],
        borderColor: "#4f46e5",
        fill: true,
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Device distribution chart
  const deviceData = {
    labels: ["Mobile", "Tablet", "Desktop"],
    datasets: [
      {
        data: [data.deviceStats?.mobile || 0, data.deviceStats?.tablet || 0, data.deviceStats?.desktop || 0],
        backgroundColor: ["#4f46e5", "#22d3ee", "#10b981"],
      },
    ],
  };

  // Browser distribution chart
  const browserData = {
    labels: ["Chrome", "Firefox", "Safari", "Edge", "Other"],
    datasets: [
      {
        data: [
          data.browserStats?.chrome || 0,
          data.browserStats?.firefox || 0,
          data.browserStats?.safari || 0,
          data.browserStats?.edge || 0,
          data.browserStats?.other || 0,
        ],
        backgroundColor: ["#4f46e5", "#f97316", "#f59e0b", "#06b6d4", "#8b5cf6"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Link copied!");
  };

  return (
    <motion.div initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center gap-3">
        <Link to="/app/links" className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <HiArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="heading-lg">Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Performance for <code className="font-mono">{data.shortCode}</code>
          </p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div initial="hidden" animate="show" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <StatCard
            label="Total Clicks"
            value={data.totalClicks || 0}
            note="All-time"
            icon={<HiEye className="h-6 w-6" />}
            tone="indigo"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Created"
            value={new Date(data.createdAt).toLocaleDateString()}
            note="Start date"
            icon={<HiCalendarDays className="h-6 w-6" />}
            tone="cyan"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Status"
            value={data.status === "expired" ? "Expired" : "Active"}
            note={data.status === "expired" ? "No longer active" : "Live"}
            icon={<HiCheck className="h-6 w-6" />}
            tone={data.status === "expired" ? "orange" : "emerald"}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Last Visit"
            value={data.lastVisitedAt ? new Date(data.lastVisitedAt).toLocaleDateString() : "Never"}
            note="Recent activity"
            icon={<HiLink className="h-6 w-6" />}
            tone="pink"
          />
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} className="card p-6">
          <h3 className="mb-4 font-heading text-lg font-bold">Click Trend</h3>
          <div className="relative h-64">
            <Line data={lineData} options={{ ...chartOptions, maintainAspectRatio: false }} />
          </div>
        </motion.div>

        <motion.div variants={item} className="card p-6">
          <h3 className="mb-4 font-heading text-lg font-bold">Device Distribution</h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative h-48 w-48">
              <Doughnut data={deviceData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} className="card p-6">
          <h3 className="mb-4 font-heading text-lg font-bold">Browser Distribution</h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative h-48 w-48">
              <Doughnut data={browserData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="card p-6">
          <h3 className="mb-4 font-heading text-lg font-bold">Device & Browser Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Devices</p>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Mobile</span>
                  <span className="font-semibold">{data.deviceStats?.mobile || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tablet</span>
                  <span className="font-semibold">{data.deviceStats?.tablet || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Desktop</span>
                  <span className="font-semibold">{data.deviceStats?.desktop || 0}</span>
                </div>
              </div>
            </div>
            <hr className="border-slate-200 dark:border-slate-700" />
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Browsers</p>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Chrome</span>
                  <span className="font-semibold">{data.browserStats?.chrome || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Firefox</span>
                  <span className="font-semibold">{data.browserStats?.firefox || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Safari</span>
                  <span className="font-semibold">{data.browserStats?.safari || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Edge</span>
                  <span className="font-semibold">{data.browserStats?.edge || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Visits Table */}
      <motion.div variants={item} className="card p-6">
        <h3 className="mb-4 font-heading text-lg font-bold">Recent Visits</h3>
        {data.recentVisits && data.recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Device</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Browser</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits.map((visit, idx) => (
                  <tr key={idx} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(visit.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-300 capitalize">
                        {visit.device}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">{visit.browser}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 dark:text-slate-400">{visit.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">No visits recorded yet</p>
        )}
      </motion.div>

      {/* Link Details */}
      <motion.div variants={item} className="card p-6">
        <h3 className="mb-4 font-heading text-lg font-bold">Link Details</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Short URL</p>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
              <code className="flex-1 truncate font-mono text-sm text-slate-900 dark:text-white">{shortUrl}</code>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <HiCheck className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Original URL</p>
            <p className="mt-2 truncate rounded-lg bg-slate-100 dark:bg-slate-800 p-3 font-mono text-sm text-slate-900 dark:text-white">
              {data.originalUrl}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</p>
            <p className="mt-2 rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white">
              {new Date(data.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <a href={shortUrl} target="_blank" rel="noreferrer" className="btn-primary">
          Visit Short Link
        </a>
      </motion.div>
    </motion.div>
  );
}
