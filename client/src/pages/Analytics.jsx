import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion as motionFramer } from "framer-motion";
import { toast } from "react-toastify";
import { HiArrowLeft, HiLink, HiCalendarDays, HiCheck, HiGlobeAlt, HiTv, HiArrowTopRightOnSquare } from "react-icons/hi2";
import { format, formatDistanceToNow } from "date-fns";
import api, { API_BASE_URL } from "../api/axios";
import StatCard from "../components/StatCard";
import LoadingScreen from "../components/LoadingScreen";
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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

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
    let timer;
    const fetchAnalytics = (showLoading = false) => {
      if (showLoading) setLoading(true);
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
        .finally(() => {
          if (showLoading) setLoading(false);
        });
    };

    fetchAnalytics(true);

    // Safe polling every 12 seconds
    timer = setInterval(() => {
      fetchAnalytics(false);
    }, 12000);

    return () => clearInterval(timer);
  }, [id]);

  if (loading && !overview) {
    return <LoadingScreen text="Analyzing clicks and building insights..." />;
  }

  if (error || !overview) {
    return (
      <motionFramer.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <Link to="/app/links" className="inline-flex items-center gap-2 text-customAccent hover:underline font-semibold">
          <HiArrowLeft className="h-4 w-4" /> Back to Links
        </Link>
        <div className="card p-6 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-650 dark:text-red-400">{error || "Analytics not found"}</p>
        </div>
      </motionFramer.div>
    );
  }

  const shortUrl = `${API_BASE_URL}/api/links/${overview.shortCode}`;

  const dailyData = trends.map((t) => ({ date: format(new Date(t.date), "MMM d"), clicks: t.clicks }));
  const browserData = browsers.map((b) => ({ name: b.browser || "Other", value: b.count }));
  const deviceData = devices.map((d) => ({ name: d.device || "Unknown", value: d.count }));
  const countryData = countries.map((c) => ({ name: c.country || "Unknown", value: c.count }));

  const copyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Link copied!");
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return format(date, "MMM d, yyyy • h:mm a");
  };

  const formatRelativeLabel = (dateStr) => {
    if (!dateStr) return "";
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  return (
    <motionFramer.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motionFramer.div variants={item} className="flex items-center gap-3">
        <Link to="/app/links" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-customDark/50 border border-customSec/40 dark:border-white/10 hover:bg-customSec/10 dark:hover:bg-white/5 transition-colors">
          <HiArrowLeft className="h-5 w-5 text-customDark dark:text-white" />
        </Link>
        <div>
          <h1 className="heading-lg">Detailed Analytics</h1>
          <p className="text-slate-650 dark:text-slate-400 font-medium">
            Performance stats for short code: <code className="font-mono font-bold text-customAccent">{overview.shortCode}</code>
          </p>
        </div>
      </motionFramer.div>

      {/* Quick Stats Grid */}
      <motionFramer.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Clicks"
          value={overview.totalClicks || 0}
          note="All-time visits"
          icon={<HiLink className="h-5 w-5" />}
          tone="indigo"
        />
        <StatCard
          label="Created Date"
          value={format(new Date(overview.createdAt), "MMM d, yyyy")}
          note={formatRelativeLabel(overview.createdAt)}
          icon={<HiCalendarDays className="h-5 w-5" />}
          tone="cyan"
        />
        <StatCard
          label="Link Status"
          value={overview.status === "expired" ? "Expired" : "Active"}
          note={overview.expiresAt ? `Expires: ${format(new Date(overview.expiresAt), "MMM d, yyyy")}` : "Never expires"}
          icon={<HiCheck className="h-5 w-5" />}
          tone={overview.status === "expired" ? "orange" : "emerald"}
        />
        <StatCard
          label="Last Visited"
          value={overview.lastVisited ? formatRelativeLabel(overview.lastVisited) : "Never"}
          note={overview.lastVisited ? format(new Date(overview.lastVisited), "h:mm a") : "No recorded clicks"}
          icon={<HiGlobeAlt className="h-5 w-5" />}
          tone="pink"
        />
      </motionFramer.div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motionFramer.div variants={item} className="card p-6 border border-customSec/30">
          <h3 className="mb-4 font-heading text-lg font-bold text-customDark dark:text-white">Daily Clicks Trend</h3>
          <div className="relative h-56">
            {dailyData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">No clicks recorded in this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(191,201,209,0.15)" />
                  <XAxis dataKey="date" stroke="currentColor" className="text-slate-400 dark:text-slate-500" style={{ fontSize: '11px', fontWeight: 550 }} />
                  <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" style={{ fontSize: '11px', fontWeight: 550 }} />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "rgba(37, 52, 63, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                    }}
                    labelStyle={{ color: "#FF9B51", fontWeight: 700 }}
                    itemStyle={{ color: "#f8fafc", fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="clicks" stroke="#FF9B51" strokeWidth={3} dot={{ r: 4, fill: '#FF9B51', strokeWidth: 1 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motionFramer.div>

        <motionFramer.div variants={item} className="card p-6 border border-customSec/30">
          <h3 className="mb-4 font-heading text-lg font-bold text-customDark dark:text-white">Device Distribution</h3>
          <div className="flex items-center justify-center h-56">
            {deviceData.length === 0 ? (
              <div className="text-sm font-semibold text-slate-400">No device data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#FF9B51" paddingAngle={4}>
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#FF9B51", "#25343F", "#BFC9D1", "#8b5cf6"][index % 4]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "rgba(37, 52, 63, 0.95)",
                      borderRadius: "12px",
                      border: "none",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motionFramer.div>
      </div>

      {/* Charts Row 2 */}
      {(browserData.length > 0 || countryData.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {browserData.length > 0 && (
            <motionFramer.div variants={item} className="card p-6 border border-customSec/30">
              <h3 className="mb-4 font-heading text-lg font-bold text-customDark dark:text-white">Browser breakdown</h3>
              <div className="flex items-center justify-center h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={browserData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#FF9B51" paddingAngle={2}>
                      {browserData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#FF9B51", "#8b5cf6", "#a855f7", "#ec4899", "#25343F"][index % 5]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                    <ReTooltip
                      contentStyle={{
                        backgroundColor: "rgba(37, 52, 63, 0.95)",
                        borderRadius: "12px",
                        border: "none",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motionFramer.div>
          )}

          {countryData.length > 0 && (
            <motionFramer.div variants={item} className="card p-6 border border-customSec/30">
              <h3 className="mb-4 font-heading text-lg font-bold text-customDark dark:text-white">Country breakdown</h3>
              <div className="relative h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" stroke="currentColor" className="text-slate-400 dark:text-slate-500" style={{ fontSize: '10px' }} />
                    <YAxis dataKey="name" type="category" stroke="currentColor" className="text-slate-500" style={{ fontSize: '11px', fontWeight: 600 }} />
                    <ReTooltip
                      contentStyle={{
                        backgroundColor: "rgba(37, 52, 63, 0.95)",
                        borderRadius: "12px",
                        border: "none",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="value" fill="#FF9B51" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motionFramer.div>
          )}
        </div>
      )}

      {/* Recent Visits Table */}
      <motionFramer.div variants={item} className="card p-6 border border-customSec/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-customDark dark:text-white">Recent Visits Log</h3>
          <span className="px-3 py-1 rounded-full bg-customAccent/10 text-customAccent text-xs font-bold border border-customAccent/25">
            {recent.length} Recorded Click{recent.length !== 1 ? "s" : ""}
          </span>
        </div>

        {recent.length === 0 ? (
          <div className="py-8 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">No clicks recorded yet. Share your short URL to see activity!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-customSec/30 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <th className="text-left p-3 font-bold text-xs uppercase tracking-wider">Timestamp</th>
                  <th className="text-left p-3 font-bold text-xs uppercase tracking-wider">Device</th>
                  <th className="text-left p-3 font-bold text-xs uppercase tracking-wider">Browser</th>
                  <th className="text-left p-3 font-bold text-xs uppercase tracking-wider">OS</th>
                  <th className="text-left p-3 font-bold text-xs uppercase tracking-wider">Country/Location</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((visit, index) => (
                  <tr key={index} className="border-b border-customSec/20 dark:border-white/5 hover:bg-customSec/10 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-customDark dark:text-slate-200">
                          {format(new Date(visit.timestamp), "MMM d, yyyy • h:mm a")}
                        </span>
                        <span className="text-2xs text-slate-400 dark:text-slate-500">
                          {formatDistanceToNow(new Date(visit.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 capitalize font-medium text-slate-650 dark:text-slate-350">{visit.device || "Desktop"}</td>
                    <td className="p-3 capitalize font-medium text-slate-650 dark:text-slate-350">{visit.browser || "Unknown"}</td>
                    <td className="p-3 font-medium text-slate-650 dark:text-slate-350">{visit.os || "Unknown"}</td>
                    <td className="p-3 font-medium text-slate-650 dark:text-slate-350">{visit.country ? `${visit.country} ${visit.city ? `(${visit.city})` : ""}` : "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motionFramer.div>

      {/* Link Details Metadata */}
      <motionFramer.div variants={item} className="card p-6 border border-customSec/30">
        <h3 className="mb-4 font-heading text-lg font-bold text-customDark dark:text-white font-heading">Link Configurations</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Short Link URL</p>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-customSec/10 dark:bg-white/5 p-3.5 border border-customSec/25">
              <code className="flex-1 truncate font-mono text-sm font-bold text-customDark dark:text-white">{shortUrl}</code>
              <motionFramer.button
                whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-white dark:bg-customDark/80 hover:bg-customAccent/10 text-customDark dark:text-slate-200 hover:text-customAccent border border-customSec/40 dark:border-white/10 transition-all"
                title="Copy short URL"
              >
                <HiCheck className="h-4.5 w-4.5" />
              </motionFramer.button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Destination URL</p>
              <p className="mt-2 truncate rounded-xl bg-customSec/10 dark:bg-white/5 p-3.5 font-mono text-sm text-customDark dark:text-white border border-customSec/25">
                {overview.originalUrl}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Date Created</p>
              <p className="mt-2 truncate rounded-xl bg-customSec/10 dark:bg-white/5 p-3.5 text-sm text-customDark dark:text-white border border-customSec/25 font-semibold">
                {formatDateLabel(overview.createdAt)} ({formatRelativeLabel(overview.createdAt)})
              </p>
            </div>
          </div>
        </div>
      </motionFramer.div>

      <motionFramer.div variants={item} className="flex justify-center pt-2">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-primary px-8 py-3.5 text-base flex items-center gap-2 shadow-lg shadow-customAccent/25 hover:shadow-glow"
        >
          Visit Destination URL <HiArrowTopRightOnSquare className="h-5 w-5" />
        </a>
      </motionFramer.div>
    </motionFramer.div>
  );
}
