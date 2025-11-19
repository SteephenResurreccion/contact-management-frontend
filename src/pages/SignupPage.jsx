// src/pages/SignupPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../assets/bg-placeholder.avif";
import { authAPI, isAuthenticated } from "../services/api.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/contacts");
    }
  }, [navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authAPI.register(
        form.username,
        form.email,
        form.password
      );
      if (result.success) {
        navigate("/contacts");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
            Create your <span className="landing-brand-accent">PeoplePad</span>{" "}
            account
          </h1>

          <p className="landing-vignette-text">
            Sign up once and manage all your contacts in one organized place.
            Keep everyone you work with just a search away.
          </p>
        </div>

        {/* SIGN UP CARD */}
        <div className="landing-auth-card">
          <div className="landing-auth-header">
            <h2>Create account</h2>
          </div>

          <form className="landing-form" onSubmit={handleSubmit}>
            <div className="landing-field">
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="landing-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="landing-field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>

            {error && <div className="landing-error">{error}</div>}

            <button type="submit" className="landing-btn" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="landing-footer-text">
            Already have an account?{" "}
            <Link to="/" className="landing-link">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
