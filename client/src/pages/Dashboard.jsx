import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiLink, HiEye, HiChartBarSquare, HiArrowTrendingUp } from "react-icons/hi2";
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
import api, { API_BASE_URL } from "../api/axios";
import StatCard from "../components/StatCard";
import SkeletonCard from "../components/SkeletonCard";
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

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <motion.div variants={item}>
              <StatCard
                label="Total Links"
                value={data.totalLinks}
                note="All-time created"
                icon={<HiLink className="h-6 w-6" />}
                tone="indigo"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                label="Total Clicks"
                value={data.totalClicks}
                note="Traffic tracked"
                icon={<HiEye className="h-6 w-6" />}
                tone="cyan"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                label="Avg. CTR"
                value={data.totalLinks > 0 ? Math.round((data.totalClicks / data.totalLinks / 10) * 100) / 100 : 0}
                note="Clicks per link"
                icon={<HiChartBarSquare className="h-6 w-6" />}
                tone="emerald"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                label="Growth"
                value="+12%"
                note="This week"
                icon={<HiArrowTrendingUp className="h-6 w-6" />}
                tone="orange"
              />
            </motion.div>
          </>
        )}
      </motion.div>

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
            {data.latestLinks.map((link) => (
              <motion.div
                key={link._id}
                whileHover={{ scale: 1.01, x: 4 }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <p className="truncate font-semibold text-slate-900 dark:text-white">{link.shortCode}</p>
                <p className="truncate text-sm text-slate-600 dark:text-slate-300">{link.originalUrl}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {link.clicks} clicks • {new Date(link.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
