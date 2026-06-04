import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  HiTrash,
  HiPencil,
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
  HiLink,
  HiArrowTopRightOnSquare,
  HiQrCode,
  HiOutlineClipboard,
} from "react-icons/hi2";
import { format, formatDistanceToNow } from "date-fns";
import api, { API_BASE_URL } from "../api/axios";
import QRCodeModal from "../components/QRCodeModal";
import EmptyState from "../components/EmptyState";
import SkeletonCard from "../components/SkeletonCard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

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
    let timer;
    const fetchLinks = (showLoading = false) => {
      if (showLoading) setLoading(true);
      api
        .get("/links/my-links", { params: { page, limit, search: search || undefined, sort } })
        .then((r) => {
          setLinks(r.data.links);
          setTotal(r.data.total);
          setError(null);
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Failed to load links";
          setError(message);
          toast.error(`❌ ${message}`);
        })
        .finally(() => {
          if (showLoading) setLoading(false);
        });
    };

    fetchLinks(true);

    // Safe polling every 12 seconds
    timer = setInterval(() => {
      fetchLinks(false);
    }, 12000);

    return () => clearInterval(timer);
  }, [page, limit, search, sort]);

  const deleteLink = async (id) => {
    if (!window.confirm("Are you sure you want to delete this short link?")) return;
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
      await api.put(`/links/${editLink._id}`, { originalUrl: trimmedUrl });

      setLinks((prev) =>
        prev.map((link) =>
          link._id === editLink._id ? { ...link, originalUrl: trimmedUrl } : link
        )
      );

      toast.success("✅ Destination URL updated successfully!");
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="heading-lg">My Short Links</h1>
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

      {/* Filter and search controls */}
      <motion.div variants={item} className="card p-4 flex gap-3 flex-col sm:flex-row border border-customSec/30">
        <div className="flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by URL or short link..."
            className="input w-full"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input w-full sm:w-48 bg-white dark:bg-customDark font-medium text-customDark dark:text-slate-200"
        >
          <option value="createdAt">Newest Created</option>
          <option value="clicks">Most Clicks</option>
        </select>
      </motion.div>

      {/* Links List */}
      <motion.div variants={item} className="card overflow-hidden border border-customSec/30">
        {loading && links.length === 0 ? (
          <div className="space-y-4 p-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : links.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No short links found"
              description={search ? "Try adjusting your search query" : "Create your first short link"}
              action={<RouterLink to="/app/links/new" className="btn-primary">Create Link</RouterLink>}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-customSec/30 dark:border-white/10 bg-customSec/10 dark:bg-customDark/20 text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold">Short Link</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold">Destination URL</th>
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider font-bold">Clicks</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold">Created</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold">Expiry</th>
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider font-bold">Status</th>
                    <th className="px-6 py-4 text-right text-xs uppercase tracking-wider font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => {
                    const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
                    return (
                      <tr
                        key={link._id}
                        className="border-b border-customSec/20 dark:border-white/5 hover:bg-customSec/10 dark:hover:bg-white/5 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-customAccent/10 font-mono font-bold text-customAccent text-xs">
                              {link.shortCode[0].toUpperCase()}
                            </span>
                            <code className="font-mono font-bold text-customDark dark:text-white text-sm">{link.shortCode}</code>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-slate-600 dark:text-slate-300 font-medium" title={link.originalUrl}>
                            {link.originalUrl}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-extrabold text-customDark dark:text-white text-base">
                          {link.clicks}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-650 dark:text-slate-300">{formatDateLabel(link.createdAt).split(" • ")[0]}</span>
                            <span className="text-2xs text-slate-400">{formatRelativeLabel(link.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {link.expiresAt ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-650 dark:text-slate-350">{formatDateLabel(link.expiresAt).split(" • ")[0]}</span>
                              <span className="text-2xs text-slate-400">{formatRelativeLabel(link.expiresAt)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/20 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
                              ● Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/30">
                              ● Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setQrLink(link)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-customBg/50 dark:bg-customDark/50 hover:bg-customAccent/10 text-slate-550 dark:text-slate-400 hover:text-customAccent border border-customSec/40 dark:border-white/10 transition-all duration-150"
                              title="View QR Code"
                            >
                              <HiQrCode className="h-4.5 w-4.5" />
                            </button>
                            <a
                              href={`${API_BASE_URL}/api/links/${link.shortCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-customBg/50 dark:bg-customDark/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-slate-550 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-customSec/40 dark:border-white/10 transition-all duration-150"
                              title="Open Destination Link"
                            >
                              <HiArrowTopRightOnSquare className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => openEditModal(link)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-customBg/50 dark:bg-customDark/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-550 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 border border-customSec/40 dark:border-white/10 transition-all duration-150"
                              title="Edit Destination Link"
                            >
                              <HiPencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => copyShortUrl(link.shortCode)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-customBg/50 dark:bg-customDark/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-550 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 border border-customSec/40 dark:border-white/10 transition-all duration-150"
                              title="Copy Short URL"
                            >
                              <HiOutlineClipboard className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/app/analytics/${link._id}`)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-customBg/50 dark:bg-customDark/50 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-slate-550 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 border border-customSec/40 dark:border-white/10 transition-all duration-150"
                              title="View Link Analytics"
                            >
                              <HiLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteLink(link._id)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-customBg/50 dark:bg-customDark/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-550 dark:text-red-400 hover:text-red-650 dark:hover:text-red-400 border border-customSec/40 dark:border-white/10 transition-all duration-150"
                              title="Delete Link"
                            >
                              <HiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-4 p-4">
              {links.map((link) => {
                const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
                return (
                  <div
                    key={link._id}
                    className="card p-4 space-y-4 border border-customSec/30 bg-white/70 dark:bg-customDark/45"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-customAccent/10 font-mono font-bold text-customAccent text-xs">
                          {link.shortCode[0].toUpperCase()}
                        </span>
                        <code className="font-mono font-bold text-customDark dark:text-white text-sm">{link.shortCode}</code>
                      </div>
                      <div>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/20 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/30">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs font-medium">
                      <div>
                        <p className="text-slate-400 uppercase tracking-wider text-3xs">Destination URL</p>
                        <p className="truncate text-slate-700 dark:text-slate-350">{link.originalUrl}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-customSec/20 dark:border-white/5">
                        <div>
                          <p className="text-slate-400 uppercase tracking-wider text-3xs">Clicks</p>
                          <p className="font-bold text-customDark dark:text-white text-sm">{link.clicks}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase tracking-wider text-3xs">Created</p>
                          <p className="text-slate-600 dark:text-slate-300 font-semibold">{formatDateLabel(link.createdAt).split(" • ")[0]}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase tracking-wider text-3xs">Expiry</p>
                          <p className="text-slate-650 dark:text-slate-305 font-semibold">
                            {link.expiresAt ? formatDateLabel(link.expiresAt).split(" • ")[0] : "None"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Touch Friendly Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-customSec/20 dark:border-white/5">
                      <button
                        onClick={() => copyShortUrl(link.shortCode)}
                        className="btn-secondary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1 hover:text-emerald-600"
                      >
                        <HiOutlineClipboard className="h-4 w-4" /> Copy
                      </button>
                      <button
                        onClick={() => setQrLink(link)}
                        className="btn-secondary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1 hover:text-customAccent"
                      >
                        <HiQrCode className="h-4 w-4" /> QR Code
                      </button>
                      <button
                        onClick={() => navigate(`/app/analytics/${link._id}`)}
                        className="btn-secondary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1 hover:text-purple-650"
                      >
                        <HiLink className="h-4 w-4" /> Stats
                      </button>
                      <button
                        onClick={() => openEditModal(link)}
                        className="btn-secondary py-2 px-3 text-xs flex items-center justify-center hover:text-blue-600"
                        title="Edit Link"
                      >
                        <HiPencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteLink(link._id)}
                        className="btn-secondary py-2 px-3 text-xs flex items-center justify-center hover:bg-red-50 hover:text-red-655"
                        title="Delete Link"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>

      {/* Pagination controls */}
      {!loading && links.length > 0 ? (
        <motion.div variants={item} className="card p-4 flex items-center justify-between border border-customSec/30">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            <HiChevronLeft /> Previous
          </button>
          <span className="text-sm font-semibold text-customDark dark:text-slate-350">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={closeEditModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white/95 dark:bg-customDark/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl p-6 space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold text-customDark dark:text-white font-heading">Edit Destination URL</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Short Link: <code className="font-mono font-bold text-customAccent">{editLink.shortCode}</code>
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-customDark dark:text-slate-200">
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
                <p className="mt-1 text-xs font-semibold text-red-500">{editError}</p>
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
