// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Alert, Card } from "react-bootstrap";
import { authAPI, getUser, isAuthenticated, getProfilePicture } from "../services/api.js";
import Sidebar from "../components/Sidebar.jsx";
import placeholderImg from "../assets/placeholder.png";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [fetching, setFetching] = useState(true);

  const loadProfilePicture = useCallback(() => {
    const pic = getProfilePicture();
    setProfilePicture(pic);
  }, []);

  const fetchUserData = useCallback(async () => {
    setFetching(true);
    try {
      const data = await authAPI.getProfile();
      if (data.success && data.data.user) {
        const userData = data.data.user;
        setUser(userData);
        setForm({
          username: userData.username || "",
          email: userData.email || "",
        });
      } else {
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
          setForm({
            username: storedUser.username || "",
            email: storedUser.email || "",
          });
        }
      }
      setErrors({});
      setSuccess(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
        setForm({
          username: storedUser.username || "",
          email: storedUser.email || "",
        });
      }
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }
    fetchUserData();
    loadProfilePicture();
    
    // Listen for profile picture updates
    const handleProfilePictureUpdate = () => {
      loadProfilePicture();
    };
    
    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUser(event.detail);
        setForm({
          username: event.detail.username || "",
          email: event.detail.email || "",
        });
        loadProfilePicture();
      }
    };
    
    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [navigate, fetchUserData, loadProfilePicture]);


  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors({});
      setSuccess(false);
    };
  }

  function handlePasswordChange(field) {
    return (e) => {
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
      setPasswordErrors({});
      setPasswordSuccess(false);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(false);

    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.updateProfile(form.username, form.email);
      if (data.success) {
        setSuccess(true);
        if (data.data.user) {
          const updatedUser = { ...data.data.user, profilePicture: getProfilePicture() };
          setUser(updatedUser);
          // Trigger event to notify other components
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));
        }
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setErrors({ submit: data.message || "Failed to update profile." });
      }
    } catch (error) {
      setErrors({ submit: error.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    const newErrors = {};
    if (!passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required.";
    }
    if (!passwordForm.newPassword.trim()) {
      newErrors.newPassword = "New password is required.";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters.";
    }
    if (!passwordForm.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      setPasswordLoading(false);
      return;
    }

    try {
      const data = await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (data.success) {
        setPasswordSuccess(true);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          setPasswordSuccess(false);
        }, 3000);
      } else {
        setPasswordErrors({ submit: data.message || "Failed to change password." });
      }
    } catch (error) {
      setPasswordErrors({ submit: error.message || "Failed to change password." });
    } finally {
      setPasswordLoading(false);
    }
  }

  const handleLogout = () => {
    authAPI.logout();
    navigate("/");
  };

  if (fetching) {
    return (
      <div className="contacts-page">
        <Sidebar onLogout={handleLogout} />
        <div className="contacts-main">
          <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <Sidebar onLogout={handleLogout} />
      <div className="contacts-main">
        <div style={{ 
          maxWidth: "900px", 
          width: "100%", 
          padding: "var(--spacing-xl) 0",
          margin: "0 auto"
        }}>
          <div className="contacts-topbar" style={{ marginBottom: "var(--spacing-2xl)" }}>
            <h1 className="topbar-title" style={{ margin: "0 auto" }}>Profile Settings</h1>
          </div>

          {/* Profile Header Card */}
          <Card className="mb-4" style={{ 
            boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.04)", 
            border: "1px solid var(--border-light)",
            background: "linear-gradient(135deg, var(--bg-card) 0%, var(--accent-primary-lighter) 100%)"
          }}>
            <Card.Body style={{ padding: "var(--spacing-xl)" }}>
              <div className="d-flex align-items-center gap-4">
                <div className="sidebar-avatar-container" style={{ position: "relative" }}>
                  <img
                    src={profilePicture || placeholderImg}
                    alt={user?.username || "User"}
                    className="sidebar-avatar"
                    style={{ 
                      width: "80px", 
                      height: "80px",
                      border: "4px solid var(--bg-card)",
                      boxShadow: "var(--shadow-lg)"
                    }}
                  />
                  <div className="sidebar-avatar-badge" style={{
                    width: "28px",
                    height: "28px",
                    fontSize: "14px",
                    border: "3px solid var(--bg-card)"
                  }}>
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ 
                    margin: 0, 
                    marginBottom: "var(--spacing-xs)", 
                    fontSize: "var(--font-2xl)", 
                    fontWeight: "var(--font-bold)", 
                    color: "var(--text-primary)",
                    letterSpacing: "-0.5px"
                  }}>{user?.username || "User"}</h2>
                  <p style={{ 
                    margin: 0, 
                    marginBottom: "var(--spacing-sm)", 
                    color: "var(--text-secondary)", 
                    fontSize: "var(--font-base)" 
                  }}>{user?.email || "user@example.com"}</p>
                  {user?.role && (
                    <span className="sidebar-user-role" style={{ 
                      marginTop: "var(--spacing-xs)", 
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--spacing-xs)",
                      padding: "4px var(--spacing-sm)",
                      background: "rgba(59, 130, 246, 0.1)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "var(--font-xs)",
                      color: "var(--accent-primary)",
                      fontWeight: "var(--font-semibold)"
                    }}>
                      <i className="bi bi-shield-check"></i>
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Edit Profile Card */}
          <Card style={{ 
            boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.04)", 
            border: "1px solid var(--border-light)", 
            marginBottom: "var(--spacing-lg)"
          }}>
            <Card.Header style={{ 
              padding: "var(--spacing-lg) var(--spacing-xl)", 
              borderBottom: "2px solid var(--border-light)", 
              background: "var(--bg-card)" 
            }}>
              <h4 style={{ 
                margin: 0, 
                fontSize: "var(--font-lg)", 
                fontWeight: "var(--font-bold)", 
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-sm)"
              }}>
                <i className="bi bi-person-gear" style={{ color: "var(--accent-primary)" }}></i>
                Edit Profile Information
              </h4>
            </Card.Header>
            <Card.Body style={{ padding: "var(--spacing-xl)" }}>
              {success && (
                <Alert variant="success" className="mb-3">
                  Profile updated successfully!
                </Alert>
              )}
              {errors.submit && (
                <Alert variant="danger" className="mb-3">
                  {errors.submit}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} md={6}>
                    <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={form.username}
                      onChange={handleChange("username")}
                      isInvalid={!!errors.username}
                      placeholder="Enter username"
                    />
                    <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md={6}>
                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      isInvalid={!!errors.email}
                      placeholder="Enter email"
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <div className="d-flex gap-2 justify-content-end" style={{ marginTop: "var(--spacing-lg)" }}>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                    style={{
                      padding: "var(--spacing-sm) var(--spacing-xl)",
                      borderRadius: "var(--radius-md)",
                      fontWeight: "var(--font-semibold)"
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Change Password Card */}
          <Card style={{ 
            boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.04)", 
            border: "1px solid var(--border-light)"
          }}>
            <Card.Header style={{ 
              padding: "var(--spacing-lg) var(--spacing-xl)", 
              borderBottom: "2px solid var(--border-light)", 
              background: "var(--bg-card)" 
            }}>
              <h4 style={{ 
                margin: 0, 
                fontSize: "var(--font-lg)", 
                fontWeight: "var(--font-bold)", 
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-sm)"
              }}>
                <i className="bi bi-key" style={{ color: "var(--accent-primary)" }}></i>
                Change Password
              </h4>
            </Card.Header>
            <Card.Body style={{ padding: "var(--spacing-xl)" }}>
              {passwordSuccess && (
                <Alert variant="success" className="mb-3">
                  Password changed successfully!
                </Alert>
              )}
              {passwordErrors.submit && (
                <Alert variant="danger" className="mb-3">
                  {passwordErrors.submit}
                </Alert>
              )}
              <Form onSubmit={handlePasswordSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>Current Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange("currentPassword")}
                      isInvalid={!!passwordErrors.currentPassword}
                      placeholder="Enter current password"
                    />
                    <Form.Control.Feedback type="invalid">{passwordErrors.currentPassword}</Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} md={6}>
                    <Form.Label>New Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange("newPassword")}
                      isInvalid={!!passwordErrors.newPassword}
                      placeholder="Enter new password"
                    />
                    <Form.Control.Feedback type="invalid">{passwordErrors.newPassword}</Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group as={Col} md={6}>
                    <Form.Label>Confirm New Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange("confirmPassword")}
                      isInvalid={!!passwordErrors.confirmPassword}
                      placeholder="Confirm new password"
                    />
                    <Form.Control.Feedback type="invalid">{passwordErrors.confirmPassword}</Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <div className="d-flex gap-2 justify-content-end" style={{ marginTop: "var(--spacing-lg)" }}>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={passwordLoading}
                    style={{
                      padding: "var(--spacing-sm) var(--spacing-xl)",
                      borderRadius: "var(--radius-md)",
                      fontWeight: "var(--font-semibold)",
                      minWidth: "160px"
                    }}
                  >
                    {passwordLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-lock me-2"></i>
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

