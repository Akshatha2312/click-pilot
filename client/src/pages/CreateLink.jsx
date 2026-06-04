import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  HiLink,
  HiArrowRight,
  HiCheck,
  HiCalendarDays,
  HiClipboard,
} from "react-icons/hi2";

import api, { API_BASE_URL, getShortUrl } from "../api/axios";

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CreateLink() {
  const [form, setForm] = useState({
    originalUrl: "",
    shortCode: "",
    expiresAt: "",
  });

  const [createdLink, setCreatedLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);

  const shortUrl = createdLink
    ? getShortUrl(createdLink.shortCode)
    : "";

  const validate = () => {
    const newErrors = {};

    if (!form.originalUrl) {
      newErrors.originalUrl = "URL is required";
    } else if (!/^https?:\/\/.+/.test(form.originalUrl)) {
      newErrors.originalUrl =
        "URL must start with http:// or https://";
    }

    if (
      form.shortCode &&
      !/^[a-zA-Z0-9_-]+$/.test(form.shortCode)
    ) {
      newErrors.shortCode =
        "Only letters, numbers, _ and - allowed";
    }

    if (
      form.expiresAt &&
      new Date(form.expiresAt) <= new Date()
    ) {
      newErrors.expiresAt =
        "Expiry date must be future date";
    }

    return newErrors;
  };

  const checkAvailability = async () => {
    if (!form.shortCode) {
      toast.error("Enter short code");
      return;
    }

    try {
      setChecking(true);

      const res = await api.get(
        `/links/check/${form.shortCode}`
      );

      setAvailability(res.data.available);

      toast.success(
        res.data.available
          ? "Available"
          : "Already Taken"
      );
    } catch (err) {
      toast.error("Check failed");
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        originalUrl: form.originalUrl,
      };

      if (form.shortCode) {
        payload.shortCode = form.shortCode;
      }

      if (form.expiresAt) {
        payload.expiresAt = new Date(
          form.expiresAt
        ).toISOString();
      }

      const res = await api.post(
        "/links/create",
        payload
      );

      setCreatedLink(res.data.link);

      toast.success("Link Created");

      setForm({
        originalUrl: "",
        shortCode: "",
        expiresAt: "",
      });

      setAvailability(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Failed to create link"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="min-h-[calc(100vh-16rem)] flex flex-col justify-center items-center py-6 px-4"
    >
      <div className="w-full max-w-xl space-y-6">
        <motion.div variants={item} className="text-center sm:text-left">
          <h1 className="heading-lg">Create Short Link</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Paste your long URL below to generate a branded, trackable short link.
          </p>
        </motion.div>

        <motion.div variants={item} className="card p-6 sm:p-8 border border-customSec/35 dark:border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-customDark dark:text-slate-200">
                Original URL
              </label>

              <div className="relative flex items-center">
                <HiLink className="absolute left-4 h-5 w-5 text-slate-450 dark:text-slate-400 pointer-events-none" />

                <input
                  type="url"
                  value={form.originalUrl}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      originalUrl: e.target.value,
                    });
                    if (errors.originalUrl) {
                      setErrors({ ...errors, originalUrl: "" });
                    }
                  }}
                  placeholder="https://example.com/very-long-link-to-shorten"
                  className={`input pl-11 pr-4 w-full ${errors.originalUrl ? "border-red-400" : ""}`}
                />
              </div>

              {errors.originalUrl && (
                <p className="text-red-500 text-xs mt-1.5 font-semibold">
                  {errors.originalUrl}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-customDark dark:text-slate-200">
                Custom Code (Optional)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.shortCode}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      shortCode: e.target.value,
                    });
                    setAvailability(null);
                  }}
                  placeholder="my-code"
                  className="input flex-1"
                />

                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={checking}
                  className="btn-primary py-2 px-5 text-sm shrink-0 shadow-sm"
                >
                  {checking ? "Checking..." : "Check"}
                </button>
              </div>

              {availability !== null && (
                <p
                  className={`text-xs mt-1.5 font-bold ${
                    availability ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {availability ? "✓ Short code is available!" : "✕ Short code is already taken"}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-customDark dark:text-slate-200">
                Expiry Date (Optional)
              </label>

              <div className="relative flex items-center">
                <HiCalendarDays className="absolute left-4 h-5 w-5 text-slate-450 dark:text-slate-400 pointer-events-none" />

                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      expiresAt: e.target.value,
                    })
                  }
                  className="input pl-11 pr-4 w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Creating..." : "Create Link"}
              {!loading && <HiArrowRight className="h-5 w-5" />}
            </button>
          </form>
        </motion.div>

        {createdLink && (
          <motion.div
            variants={item}
            className="card p-6 border-2 border-emerald-500/25 bg-emerald-50/10 dark:bg-emerald-950/5 mt-6"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 shadow-md">
                <HiCheck className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-customDark dark:text-white">
                  Link Created Successfully!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your short link is active and ready to share.
                </p>
              </div>

              <div className="border border-customSec/40 dark:border-white/10 rounded-2xl p-4 bg-white/50 dark:bg-customDark/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="font-mono text-sm font-bold text-customDark dark:text-white break-all flex-1 text-left select-all">
                  {shortUrl}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-sm"
                >
                  <HiClipboard className="h-4 w-4" /> Copy Link
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}