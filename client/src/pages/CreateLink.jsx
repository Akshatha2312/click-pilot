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

import api, { API_BASE_URL } from "../api/axios";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
    ? `${API_BASE_URL}/api/links/${createdLink.shortCode}`
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
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="flex flex-col items-center px-4 py-6"
    >
      <motion.div variants={item}>
        <h1 className="heading-lg">
          Create Short Link
        </h1>

        <p className="text-slate-600">
          Paste URL and create short link
        </p>
      </motion.div>

      <div className="w-full max-w-xl mt-6">
        <motion.div
          variants={item}
          className="card p-8"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block mb-2 text-sm font-medium">
                Original URL
              </label>

              <div className="relative">
                <HiLink className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  type="url"
                  value={form.originalUrl}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      originalUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com"
                  className="input pl-10 w-full"
                />
              </div>

              {errors.originalUrl && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.originalUrl}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Custom Code
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
                  className="btn-primary"
                >
                  {checking
                    ? "Checking..."
                    : "Check"}
                </button>
              </div>

              {availability !== null && (
                <p
                  className={`text-xs mt-1 ${availability
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {availability
                    ? "Available"
                    : "Already Taken"}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Expiry Date
              </label>

              <div className="relative">
                <HiCalendarDays className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      expiresAt: e.target.value,
                    })
                  }
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading
                ? "Creating..."
                : "Create Link"}

              {!loading && <HiArrowRight />}
            </button>
          </form>
        </motion.div>

        {createdLink && (
          <motion.div
            variants={item}
            className="card p-6 mt-6"
          >
            <div className="text-center">
              <HiCheck className="mx-auto h-10 w-10 text-green-600 mb-3" />

              <h2 className="font-semibold mb-3">
                Link Created
              </h2>

              <div className="border rounded-lg p-3">
                <p className="font-mono break-all">
                  {shortUrl}
                </p>
              </div>

              <button
                onClick={copyToClipboard}
                className="btn-primary mt-4 flex items-center justify-center gap-2 w-full"
              >
                <HiClipboard />
                Copy Link
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}