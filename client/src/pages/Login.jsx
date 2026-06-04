import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiArrowRight, HiEnvelope, HiKey } from "react-icons/hi2";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app/dashboard";

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    isSubmitting.current = true;

    try {
      const response = await api.post("/auth/login", form);
      login(response.data.token, response.data.user);
      toast.success("✅ Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen animated-bg bg-customBg dark:bg-customDark flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 sm:p-10 border border-customSec/40 dark:border-white/10 shadow-2xl">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.4 }}
                className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-customAccent to-orange-500 font-heading text-2xl font-bold text-white shadow-lg shadow-customAccent/25"
              >
                CP
              </motion.div>
            </Link>
            <h1 className="heading-lg">Welcome back</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-350 font-medium">
              Sign in to your ClickPilot account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-customDark dark:text-slate-200">
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
              {errors.email ? <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-customDark dark:text-slate-200">
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
                  placeholder="••••••••"
                  className={`input pl-10 ${errors.password ? "border-red-400" : ""}`}
                />
              </div>
              {errors.password ? <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password}</p> : null}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading ? <HiArrowRight /> : null}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-650 dark:text-slate-300 font-semibold">
            Don't have an account?{" "}
            <Link to="/register" className="text-customAccent hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
