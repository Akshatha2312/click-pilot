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
import { format, formatDistanceToNow } from "date-fns";
import {
  HiLink,
  HiChartBarSquare,
  HiCheck,
  HiCalendarDays,
  HiPlus,
} from "react-icons/hi2";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Dashboard() {
  const [data, setData] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    lastVisitedAt: null,
    latestLinks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timer;
    const fetchDashboard = (showLoading = false) => {
      if (showLoading) setLoading(true);
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
        .finally(() => {
          if (showLoading) setLoading(false);
        });
    };

    fetchDashboard(true);

    // Safe polling every 12 seconds
    timer = setInterval(() => {
      fetchDashboard(false);
    }, 12000);

    // Clean up
    return () => clearInterval(timer);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(191, 201, 209, 0.15)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Clicks",
        data: [12, 19, 8, 15, 22, 18, 25],
        borderColor: "#FF9B51",
        backgroundColor: "rgba(255, 155, 81, 0.1)",
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
          "rgba(255, 155, 81, 0.85)",
          "rgba(37, 52, 63, 0.85)",
          "rgba(191, 201, 209, 0.85)",
          "rgba(16, 185, 129, 0.85)",
          "rgba(236, 72, 153, 0.85)",
        ],
      },
    ],
  };

  const formatLastVisited = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      
      {/* Top Heading Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-customSec/20 dark:border-white/5 pb-4">
        <div>
          <h1 className="heading-lg">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Welcome back! Monitor click rates, track traffic metrics, and deploy shortened links instantly.
          </p>
        </div>
        <Link to="/app/links/new" className="btn-primary self-start md:self-auto flex items-center gap-1.5 shadow-sm">
          <HiPlus className="h-5 w-5" />
          <span>Create Link</span>
        </Link>
      </motion.div>

      {error && (
        <motion.div variants={item} className="card p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
        </motion.div>
      )}

      {/* Stats Cards Grid (Equal Heights managed by StatCard's layout) */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Links"
          value={loading ? "..." : data.totalLinks}
          note="Short links created"
          icon={<HiLink className="h-5 w-5" />}
          tone="cyan"
        />
        <StatCard
          label="Total Clicks"
          value={loading ? "..." : data.totalClicks}
          note="Across all links"
          icon={<HiChartBarSquare className="h-5 w-5" />}
          tone="indigo"
        />
        <StatCard
          label="Active Links"
          value={loading ? "..." : data.activeLinks}
          note="Unexpired links"
          icon={<HiCheck className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Last Visit"
          value={loading ? "..." : data.lastVisitedAt ? formatLastVisited(data.lastVisitedAt) : "Never"}
          note={data.lastVisitedAt ? format(new Date(data.lastVisitedAt), "MMM d, h:mm a") : "No visits recorded"}
          icon={<HiCalendarDays className="h-5 w-5" />}
          tone="orange"
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} className="card p-6 border border-customSec/30">
          <h3 className="mb-4 font-heading text-lg font-bold text-customDark dark:text-white">Clicks Over Time</h3>
          <div className="relative h-64">
            <Line data={lineData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div variants={item} className="card p-6 border border-customSec/30">
          <h3 className="mb-4 font-heading text-lg font-bold text-customDark dark:text-white">Traffic Sources</h3>
          <div className="relative h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Latest Links Section */}
      <motion.div variants={item} className="card p-6 border border-customSec/30">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-customDark dark:text-white">Latest Short Links</h3>
            <p className="text-xs text-slate-400 mt-0.5">Most recent creations in your portal.</p>
          </div>
          <Link to="/app/links" className="text-sm font-semibold text-customAccent hover:underline">
            View all
          </Link>
        </div>

        {loading && data.latestLinks.length === 0 ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-customSec/20 dark:bg-white/5" />
            <div className="h-16 animate-pulse rounded-2xl bg-customSec/20 dark:bg-white/5" />
          </div>
        ) : data.latestLinks.length === 0 ? (
          <EmptyState
            title="No links yet"
            description="Create your first short link to get started"
            action={<Link to="/app/links/new" className="btn-primary">Create Link</Link>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-1">
            {data.latestLinks.map((link) => {
              const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
              return (
                <motion.div
                  key={link._id}
                  whileHover={{ scale: 1.002, x: 4 }}
                  className="rounded-2xl border border-customSec/35 dark:border-white/5 p-4 bg-white/50 dark:bg-customDark/30 hover:bg-white/95 dark:hover:bg-customDark/50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono font-bold text-customAccent text-base leading-none">{link.shortCode}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="truncate text-sm text-slate-600 dark:text-slate-350 font-medium">{link.originalUrl}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-450">
                        <span>Clicks: <strong className="text-customDark dark:text-white font-bold">{link.clicks}</strong></span>
                        {link.lastVisitedAt && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span>Last visit: {formatDistanceToNow(new Date(link.lastVisitedAt), { addSuffix: true })}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="self-start sm:self-center shrink-0">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/20 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-450 whitespace-nowrap border border-red-200/50 dark:border-red-900/30">
                          ● Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-450 whitespace-nowrap border border-emerald-200/50 dark:border-emerald-900/30">
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
