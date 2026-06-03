import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiArrowRight, HiUser, HiEnvelope, HiKey } from "react-icons/hi2";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "At least 6 characters";
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
      await api.post("/auth/register", form);
      toast.success("✅ Account created! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg bg-hero-light dark:bg-hero-dark flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 font-heading text-2xl font-bold text-white">
              CP
            </div>
            <h1 className="heading-lg">Create account</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Join thousands of teams using ClickPilot
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Full Name
              </label>
              <div className="relative">
                <HiUser className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="Your name"
                  className={`input pl-10 ${errors.name ? "border-red-400" : ""}`}
                />
              </div>
              {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <HiEnvelope className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="you@example.com"
                  className={`input pl-10 ${errors.email ? "border-red-400" : ""}`}
                />
              </div>
              {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <HiKey className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder="At least 6 characters"
                  className={`input pl-10 ${errors.password ? "border-red-400" : ""}`}
                />
              </div>
              {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password}</p> : null}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading ? <HiArrowRight /> : null}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
