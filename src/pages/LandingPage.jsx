// src/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../assets/bg-placeholder.avif";
import { authAPI, isAuthenticated } from "../services/api.js";

export default function LandingPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/contacts");
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authAPI.login(form.email, form.password);
      if (result.success) {
        navigate("/contacts");
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="landing-page"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="landing-hero-overlay"></div>

      <div className="landing-content">
        {/* LEFT TEXT */}
        <div className="landing-vignette">
          <h1 className="landing-vignette-title">
            Welcome to<br />
            <span className="landing-brand-accent">PeoplePad</span>
          </h1>

          <p className="landing-vignette-text">
            Your people, organized — all in one place. Keep your contacts
            connected, searchable, and ready when you need them.
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="landing-auth-card">
          <div className="landing-auth-header">
            <h2>Login to your account</h2>
          </div>

          <form className="landing-form" onSubmit={handleSubmit}>
            <div className="landing-field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="landing-field">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Enter password"
                required
              />
            </div>

            {error && <div className="landing-error">{error}</div>}

            <button type="submit" className="landing-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="landing-footer-text">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="landing-link">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
