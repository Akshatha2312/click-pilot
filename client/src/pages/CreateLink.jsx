import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiLink, HiArrowRight, HiCheck, HiCalendarDays, HiClipboardCopy, HiExternalLink } from "react-icons/hi2";
import api, { API_BASE_URL } from "../api/axios";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CreateLink() {
  const [form, setForm] = useState({ originalUrl: "", shortCode: "", expiresAt: "" });
  const [createdLink, setCreatedLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  
  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  const checkAvailability = async () => {
    if (!form.shortCode) {
      toast.error("Enter a short code to check availability");
      return;
    }
    setChecking(true);
    try {
      const res = await api.get(`/links/check/${form.shortCode}`);
      const isAvailable = res.data.available;
      setAvailability(isAvailable);
      toast.success(isAvailable ? "✓ Available" : "✗ Already taken");
    } catch (err) {
      setAvailability(false);
      toast.error("Error checking availability");
    } finally {
      setChecking(false);
    }
  };

  const shortUrl = createdLink ? `${API_BASE_URL}/api/links/${createdLink.shortCode}` : "";

  const validate = () => {
    const newErrors = {};
    if (!form.originalUrl) newErrors.originalUrl = "URL is required";
    else if (!/^https?:\/\/.+/.test(form.originalUrl)) newErrors.originalUrl = "Must start with http:// or https://";
    if (form.shortCode && !/^[a-zA-Z0-9_-]+$/.test(form.shortCode)) {
      newErrors.shortCode = "Only letters, numbers, dashes, underscores allowed";
    }
    if (form.expiresAt && new Date(form.expiresAt) <= new Date()) {
      newErrors.expiresAt = "Expiry date must be in the future";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const payload = {
        originalUrl: form.originalUrl,
        shortCode: form.shortCode || undefined,
      };
      if (form.expiresAt) {
        payload.expiresAt = new Date(form.expiresAt).toISOString();
      }

      const response = await api.post("/links/create", payload);
      setCreatedLink(response.data.link);
      toast.success("✅ Link created successfully!");
      setForm({ originalUrl: "", shortCode: "", expiresAt: "" });
      setTimeout(() => setCreatedLink(null), 5000);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create link";
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const shortUrl = createdLink ? `${API_BASE_URL}/api/links/${createdLink.shortCode}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div initial="hidden" animate="show" className="flex flex-col items-center px-4 py-6">
      <motion.div variants={item}>
        <h1 className="heading-lg">Create Short Link</h1>
        <p className="text-slate-600 dark:text-slate-400">Paste any URL and get a short, shareable link</p>
      </motion.div>

      <div className="w-full max-w-xl">
        <motion.div variants={item} className="card p-8 max-w-full mx-auto hover:shadow-xl transition-shadow duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Original URL
              </label>
              <div className="relative">
                <HiLink className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="url"
                  value={form.originalUrl}
                  onChange={(e) => {
                    setForm({ ...form, originalUrl: e.target.value });
                    if (errors.originalUrl) setErrors({ ...errors, originalUrl: "" });
                  }}
                  placeholder="https://example.com/long-url"
                  className={`input pl-10 ${errors.originalUrl ? "border-red-400" : ""}`}
                />
              </div>
              {errors.originalUrl ? <p className="mt-1 text-xs text-red-500">{errors.originalUrl}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Custom Short Code (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={form.shortCode}
                  onChange={(e) => {
                    setForm({ ...form, shortCode: e.target.value });
                    if (errors.shortCode) setErrors({ ...errors, shortCode: "" });
                    setAvailability(null);
                  }}
                  placeholder="my-custom-code"
                  className={`input flex-1 ${errors.shortCode ? "border-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={checking}
                  className="btn-primary whitespace-nowrap"
                >
                  {checking ? "Checking…" : "Check Availability"}
                </button>
              </div>
              {availability !== null && (
                <p className={`mt-1 text-xs ${availability ? "text-green-600" : "text-red-600"}`}>
                  {availability ? "✓ Available" : "✗ Already Taken"}
                </p>
              )}
              {errors.shortCode ? <p className="mt-1 text-xs text-red-500">{errors.shortCode}</p> : null}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Leave blank for auto-generated code</p>
              {form.shortCode && (
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Short URL Preview:</span>
                  <a
                    href={`${API_BASE_URL}/${form.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-600 hover:underline"
                  >
                    {`${API_BASE_URL}/${form.shortCode}`}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${API_BASE_URL}/${form.shortCode}`);
                      toast.success("Copied preview URL!");
                    }}
                    className="p-1 hover:text-emerald-800"
                  >
                    <HiClipboardCopy className="h-4 w-4" />
                  </button>
                  <a
                    href={`${API_BASE_URL}/${form.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:text-emerald-800"
                  >
                    <HiExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Link Expiry Date (Optional)
              </label>
              <div className="relative">
                <HiCalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => {
                    setForm({ ...form, expiresAt: e.target.value });
                    if (errors.expiresAt) setErrors({ ...errors, expiresAt: "" });
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`input pl-10 ${errors.expiresAt ? "border-red-400" : ""}`}
                />
              </div>
              {errors.expiresAt ? <p className="mt-1 text-xs text-red-500">{errors.expiresAt}</p> : null}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Link will stop working after this date</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Creating..." : "Create Link"}
              {!loading ? <HiArrowRight /> : null}
            </motion.button>
          </form>
        </motion.div>

        {createdLink ? (
          <motion.div
            variants={item}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 mt-6"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 dark:bg-emerald-800">
                <HiCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Your short link is ready!</p>
              <div className="mt-4 rounded-lg bg-white dark:bg-slate-800 p-4">
                <p className="truncate font-mono text-sm font-semibold text-slate-900 dark:white">
                  {createdLink.shortCode}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{shortUrl}</p>
              </div>
              {createdLink.expiresAt && (
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  Expires: {new Date(createdLink.expiresAt).toLocaleString()}
                </div>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={copyToClipboard}
                className="btn-primary mt-4 w-full"
              >
                Copy Link
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
