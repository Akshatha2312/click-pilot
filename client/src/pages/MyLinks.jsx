import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiEye, HiTrash, HiPencil, HiCheck, HiChevronLeft, HiChevronRight, HiLink } from "react-icons/hi2";
import api, { API_BASE_URL } from "../api/axios";
import QRCodeModal from "../components/QRCodeModal";
import EmptyState from "../components/EmptyState";
import SkeletonCard from "../components/SkeletonCard";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MyLinks() {
  const [links, setLinks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrLink, setQrLink] = useState(null);
  const navigate = useNavigate();

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/links/my-links", { params: { page, limit, search: search || undefined, sort } })
      .then((r) => {
        if (!mounted) return;
        setLinks(r.data.links);
        setTotal(r.data.total);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        const message = err.response?.data?.message || "Failed to load links";
        setError(message);
        toast.error(`❌ ${message}`);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [page, limit, search, sort]);

  const deleteLink = async (id) => {
    try {
      await api.delete(`/links/${id}`);
      toast.success("Link deleted");
      setLinks((prev) => prev.filter((l) => l._id !== id));
      setTotal((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      toast.error("Failed to delete link");
    }
  };

  const copyShortUrl = (shortCode) => {
    const url = `${API_BASE_URL}/api/links/${shortCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="heading-lg">My Links</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and track all your shortened links</p>
        </div>
        <RouterLink to="/app/links/new" className="btn-primary">
          Create Link
        </RouterLink>
      </motion.div>

      {error && (
        <motion.div variants={item} className="card p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      <motion.div variants={item} className="card p-4 flex gap-3 flex-col sm:flex-row">
        <div className="flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by URL or short code..."
            className="input w-full"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-full sm:w-40">
          <option value="createdAt">Newest</option>
          <option value="clicks">Most Clicks</option>
        </select>
      </motion.div>

      <motion.div variants={item} className="card overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : links.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No links found"
              description={search ? "Try adjusting your search" : "Create your first short link"}
              action={<RouterLink to="/app/links/new" className="btn-primary">Create Link</RouterLink>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Short Code</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Original URL</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Clicks</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Created</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, idx) => (
                  <motion.tr
                    key={link._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30 font-mono font-semibold text-brand-600 dark:text-brand-400 text-xs">
                          {link.shortCode[0].toUpperCase()}
                        </span>
                        <code className="font-mono text-slate-900 dark:text-white">{link.shortCode}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-slate-600 dark:text-slate-300" title={link.originalUrl}>
                        {link.originalUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">{link.clicks}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setQrLink(link)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                          title="View QR Code"
                        >
                          <HiEye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyShortUrl(link.shortCode)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                          title="Copy Link"
                        >
                          <HiCheck className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/app/analytics/${link._id}`)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                          title="View Analytics"
                        >
                          <HiLink className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteLink(link._id)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                          title="Delete"
                        >
                          <HiTrash className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {!loading && links.length > 0 ? (
        <motion.div variants={item} className="card p-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            <HiChevronLeft /> Previous
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next <HiChevronRight />
          </button>
        </motion.div>
      ) : null}

      {qrLink ? <QRCodeModal link={qrLink} onClose={() => setQrLink(null)} /> : null}
    </motion.div>
  );
}
