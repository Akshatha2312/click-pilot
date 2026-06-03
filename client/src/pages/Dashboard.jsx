import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const [data, setData] = useState({ totalLinks: 0, totalClicks: 0, latestLinks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/links/dashboard")
      .then((r) => {
        setData(r.data);
        setError(null);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "Failed to load dashboard";
        setError(message);
        toast.error(`❌ ${message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Clicks",
        data: [12, 19, 8, 15, 22, 18, 25],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: ["Direct", "Search", "Social", "Referral", "Email"],
    datasets: [
      {
        label: "Traffic",
        data: [65, 59, 80, 81, 56],
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)",
          "rgba(34, 211, 238, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(249, 115, 22, 0.8)",
        ],
      },
    ],
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="heading-lg">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your link performance overview.</p>
      </motion.div>

      {error && (
        <motion.div variants={item} className="card p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} className="card p-6">
          <h3 className="mb-4 font-heading text-lg font-bold">Clicks Over Time</h3>
          <div className="relative h-64">
            <Line data={lineData} options={{ ...chartOptions, maintainAspectRatio: false }} />
          </div>
        </motion.div>

        <motion.div variants={item} className="card p-6">
          <h3 className="mb-4 font-heading text-lg font-bold">Traffic Sources</h3>
          <div className="relative h-64">
            <Bar data={barData} options={{ ...chartOptions, maintainAspectRatio: false }} />
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold">Latest Links</h3>
          <Link to="/app/links" className="text-sm text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : data.latestLinks.length === 0 ? (
          <EmptyState
            title="No links yet"
            description="Create your first short link to get started"
            action={<Link to="/app/links/new" className="btn-primary">Create Link</Link>}
          />
        ) : (
          <div className="space-y-3">
            {data.latestLinks.map((link) => {
              const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
              return (
                <motion.div
                  key={link._id}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{link.shortCode}</p>
                      <p className="truncate text-sm text-slate-600 dark:text-slate-300">{link.originalUrl}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {link.clicks} clicks • {new Date(link.createdAt).toLocaleDateString()}
                        {link.expiresAt && ` • Expires: ${new Date(link.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="ml-2">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                          ● Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ● Active
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
