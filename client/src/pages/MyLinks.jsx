import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiEye, HiTrash, HiPencil, HiCheck, HiChevronLeft, HiChevronRight, HiLink, HiArrowTopRightOnSquare } from "react-icons/hi2";import api, { API_BASE_URL } from "../api/axios";
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
  const [editLink, setEditLink] = useState(null);
  const [editUrl, setEditUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
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

  const openEditModal = (link) => {
    setEditLink(link);
    setEditUrl(link.originalUrl);
    setEditError("");
  };

  const closeEditModal = () => {
    setEditLink(null);
    setEditUrl("");
    setEditError("");
  };

  const handleUpdateUrl = async () => {
    const trimmedUrl = editUrl.trim();
    
    if (!trimmedUrl) {
      setEditError("URL is required");
      return;
    }

    if (!/^https?:\/\/.+/.test(trimmedUrl)) {
      setEditError("URL must start with http:// or https://");
      return;
    }

    if (trimmedUrl === editLink.originalUrl) {
      setEditError("No changes made");
      return;
    }

    setEditLoading(true);
    try {
      const response = await api.put(`/links/${editLink._id}`, { originalUrl: trimmedUrl });
      
      // Update the link in the list
      setLinks((prev) =>
        prev.map((link) =>
          link._id === editLink._id ? { ...link, originalUrl: trimmedUrl } : link
        )
      );
      
      toast.success("✅ URL updated successfully!");
      closeEditModal();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update URL";
      setEditError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setEditLoading(false);
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
                <tr className="border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-900/25">
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-slate-550 dark:text-slate-400">Short Code</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-slate-550 dark:text-slate-400">Original URL</th>
                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider font-semibold text-slate-550 dark:text-slate-400">Clicks</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-slate-550 dark:text-slate-400">Created</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-slate-550 dark:text-slate-400">Expiry</th>
                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider font-semibold text-slate-550 dark:text-slate-400">Status</th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-wider font-semibold text-slate-550 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, idx) => (
                  <motion.tr
                    key={link._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100/70 dark:bg-brand-900/20 font-mono font-bold text-brand-600 dark:text-brand-400 text-xs">
                          {link.shortCode[0].toUpperCase()}
                        </span>
                        <code className="font-mono font-medium text-slate-900 dark:text-white">{link.shortCode}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="max-w-xs truncate text-slate-650 dark:text-slate-300" title={link.originalUrl}>
                        {link.originalUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-center font-bold text-slate-800 dark:text-slate-100">{link.clicks}</td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-medium">
                      {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      {link.expiresAt && new Date(link.expiresAt) < new Date() ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100/60 dark:bg-red-950/20 px-2 py-0.5 text-xs font-semibold text-red-655 dark:text-red-400">
                          ● Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-105/60 dark:bg-emerald-950/20 px-2 py-0.5 text-xs font-semibold text-emerald-650 dark:text-emerald-450">
                          ● Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex justify-end gap-1.5">
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setQrLink(link)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-slate-550 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-100 dark:border-slate-800"
                          title="View QR Code"
                        >
                          <HiEye className="h-4.5 w-4.5" />
                        </motion.button>
                        <a
  href={`${API_BASE_URL}/api/links/${link.shortCode}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-slate-550 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-100 dark:border-slate-800 transition-all"
  title="Open Link"
>
  <HiArrowTopRightOnSquare className="h-4 w-4" />
</a>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => openEditModal(link)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-550 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-800"
                          title="Edit URL"
                        >
                          <HiPencil className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => copyShortUrl(link.shortCode)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-955/20 text-slate-550 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 border border-slate-100 dark:border-slate-800"
                          title="Copy Link"
                        >
                          <HiCheck className="h-4.5 w-4.5" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => navigate(`/app/analytics/${link._id}`)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-purple-50 dark:hover:bg-purple-955/20 text-slate-550 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-100 dark:border-slate-800"
                          title="View Analytics"
                        >
                          <HiLink className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => deleteLink(link._id)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-550 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-100 dark:border-slate-800"
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

      {editLink ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeEditModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/30 shadow-2xl p-6 space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-heading">Edit Destination URL</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Short Code: <code className="font-mono font-semibold">{editLink.shortCode}</code></p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Destination URL
              </label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => {
                  setEditUrl(e.target.value);
                  setEditError("");
                }}
                placeholder="https://example.com"
                className={`input w-full ${editError ? "border-red-400" : ""}`}
              />
              {editError && (
                <p className="mt-1 text-xs text-red-500">{editError}</p>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={closeEditModal}
                disabled={editLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateUrl}
                disabled={editLoading}
                className="btn-primary flex-1"
              >
                {editLoading ? "Updating..." : "Update URL"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
