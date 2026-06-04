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
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { format, formatDistanceToNow } from "date-fns";
import api, { API_BASE_URL, getShortUrl } from "../api/axios";
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
    const url = getShortUrl(shortCode);
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard!");
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return format(date, "MMM d, yyyy");
  };

  const formatRelativeLabel = (dateStr) => {
    if (!dateStr) return "";
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-customSec/20 dark:border-white/5 pb-4">
        <div>
          <h1 className="heading-lg">My Short Links</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage, edit, copy, and track all your shortened URLs.
          </p>
        </div>
        <RouterLink to="/app/links/new" className="btn-primary self-start md:self-auto flex items-center gap-1.5 shadow-sm">
          <span>Create Link</span>
        </RouterLink>
      </motion.div>

      {error && (
        <motion.div variants={item} className="card p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-650 dark:text-red-400 font-semibold">{error}</p>
        </motion.div>
      )}

      {/* Filter and search controls */}
      <motion.div variants={item} className="card p-4 flex gap-3 flex-col sm:flex-row border border-customSec/30">
        <div className="flex-1 relative flex items-center">
          <HiMagnifyingGlass className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by URL or short link..."
            className="input w-full pl-11 py-3"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input w-full sm:w-48 bg-white dark:bg-customDark font-semibold text-customDark dark:text-slate-200 py-3 rounded-2xl cursor-pointer"
        >
          <option value="createdAt">Newest Created</option>
          <option value="clicks">Most Clicks</option>
        </select>
      </motion.div>

      {/* Links List */}
      <motion.div variants={item} className="card overflow-hidden border border-customSec/30 bg-white/80 dark:bg-customDark/50">
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
                  <tr className="border-b border-customSec/35 dark:border-white/10 bg-customSec/10 dark:bg-customDark/20 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold">Short Link</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold">Destination URL</th>
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider font-bold">Clicks</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold">Created</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold">Expiry</th>
                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider font-bold">Status</th>
                    <th className="px-6 py-4 text-right text-xs uppercase tracking-wider font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-customSec/20 dark:divide-white/5">
                  {links.map((link) => {
                    const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
                    return (
                      <tr
                        key={link._id}
                        className="hover:bg-customSec/10 dark:hover:bg-white/5 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
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
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 dark:text-slate-305">{formatDateLabel(link.createdAt)}</span>
                            <span className="text-[10px] text-slate-400">{formatRelativeLabel(link.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {link.expiresAt ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-700 dark:text-slate-355">{formatDateLabel(link.expiresAt)}</span>
                              <span className="text-[10px] text-slate-400">{formatRelativeLabel(link.expiresAt)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {isExpired ? (
                            <span className="inline-flex items-center rounded-full bg-red-500/10 dark:bg-red-500/15 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/20">
                              ● Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-450 border border-emerald-500/20">
                              ● Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setQrLink(link)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-white dark:bg-customDark/75 hover:bg-customAccent/10 text-slate-500 dark:text-slate-400 hover:text-customAccent border border-customSec/40 dark:border-white/10 transition-all duration-150 shadow-sm"
                              title="View QR Code"
                            >
                              <HiQrCode className="h-4.5 w-4.5" />
                            </button>
                            <a
                              href={getShortUrl(link.shortCode)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-white dark:bg-customDark/75 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 border border-customSec/40 dark:border-white/10 transition-all duration-150 shadow-sm"
                              title="Open Destination Link"
                            >
                              <HiArrowTopRightOnSquare className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => openEditModal(link)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-white dark:bg-customDark/75 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-450 border border-customSec/40 dark:border-white/10 transition-all duration-150 shadow-sm"
                              title="Edit Destination Link"
                            >
                              <HiPencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => copyShortUrl(link.shortCode)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-white dark:bg-customDark/75 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 border border-customSec/40 dark:border-white/10 transition-all duration-150 shadow-sm"
                              title="Copy Short URL"
                            >
                              <HiOutlineClipboard className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/app/analytics/${link._id}`)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-white dark:bg-customDark/75 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 border border-customSec/40 dark:border-white/10 transition-all duration-150 shadow-sm"
                              title="View Link Analytics"
                            >
                              <HiLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteLink(link._id)}
                              className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-white dark:bg-customDark/75 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-customSec/40 dark:border-white/10 transition-all duration-150 shadow-sm"
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
            <div className="block md:hidden space-y-4 p-3 bg-customBg/5 dark:bg-transparent">
              {links.map((link) => {
                const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
                return (
                  <div
                    key={link._id}
                    className="card p-5 space-y-4 border border-customSec/30 bg-white/90 dark:bg-customDark/50 shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-customSec/20 dark:border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-customAccent/10 font-mono font-bold text-customAccent text-xs">
                          {link.shortCode[0].toUpperCase()}
                        </span>
                        <code className="font-mono font-bold text-customDark dark:text-white text-base">{link.shortCode}</code>
                      </div>
                      <div>
                        {isExpired ? (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/20">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-450 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs font-medium">
                      <div>
                        <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-bold">Destination URL</p>
                        <p className="truncate text-slate-700 dark:text-slate-300 font-semibold mt-0.5" title={link.originalUrl}>{link.originalUrl}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-customSec/20 dark:border-white/5">
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-bold">Clicks</p>
                          <p className="font-extrabold text-customDark dark:text-white text-sm mt-0.5">{link.clicks}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-bold">Created</p>
                          <p className="text-slate-650 dark:text-slate-350 font-semibold mt-0.5">{formatDateLabel(link.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-bold">Expiry</p>
                          <p className="text-slate-650 dark:text-slate-355 font-semibold mt-0.5">
                            {link.expiresAt ? formatDateLabel(link.expiresAt) : "None"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Touch Friendly Action Buttons Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-customSec/20 dark:border-white/5">
                      <button
                        onClick={() => copyShortUrl(link.shortCode)}
                        className="btn-secondary py-2.5 px-1.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:text-emerald-500"
                      >
                        <HiOutlineClipboard className="h-4.5 w-4.5 shrink-0" /> Copy
                      </button>
                      <button
                        onClick={() => setQrLink(link)}
                        className="btn-secondary py-2.5 px-1.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:text-customAccent"
                      >
                        <HiQrCode className="h-4.5 w-4.5 shrink-0" /> QR
                      </button>
                      <button
                        onClick={() => navigate(`/app/analytics/${link._id}`)}
                        className="btn-secondary py-2.5 px-1.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:text-purple-500"
                      >
                        <HiLink className="h-4 w-4 shrink-0" /> Stats
                      </button>
                      <button
                        onClick={() => openEditModal(link)}
                        className="btn-secondary py-2.5 px-1.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:text-blue-550 col-span-1.5"
                      >
                        <HiPencil className="h-4 w-4 shrink-0" /> Edit
                      </button>
                      <button
                        onClick={() => deleteLink(link._id)}
                        className="btn-secondary py-2.5 px-1.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500/10 hover:text-red-500 col-span-1.5"
                      >
                        <HiTrash className="h-4 w-4 shrink-0" /> Delete
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
            className="btn-secondary py-2 px-3.5 text-xs disabled:opacity-50 flex items-center gap-1"
          >
            <HiChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-xs font-bold text-customDark dark:text-slate-350">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="btn-secondary py-2 px-3.5 text-xs disabled:opacity-50 flex items-center gap-1"
          >
            Next <HiChevronRight className="h-4 w-4" />
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
              <p className="mt-1 text-sm text-slate-550 dark:text-slate-400">
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
