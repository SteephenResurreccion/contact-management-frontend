// src/components/ProfileSettingsModal.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { authAPI, getUser, getProfilePicture, setProfilePicture } from "../services/api.js";
import placeholderImg from "../assets/placeholder.png";

export default function ProfileSettingsModal({ show, onClose, onUpdate }) {
  const [form, setForm] = useState({ username: "", email: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const data = await authAPI.getProfile();
      if (data.success && data.data.user) {
        setForm({
          username: data.data.user.username || "",
          email: data.data.user.email || "",
        });
      } else {
        const storedUser = getUser();
        if (storedUser) {
          setForm({
            username: storedUser.username || "",
            email: storedUser.email || "",
          });
        }
      }
      // Load profile picture from localStorage
      const profilePic = getProfilePicture();
      setPreviewImage(profilePic);
      setErrors({});
      setSuccess(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      const storedUser = getUser();
      if (storedUser) {
        setForm({
          username: storedUser.username || "",
          email: storedUser.email || "",
        });
      }
      // Load profile picture from localStorage
      const profilePic = getProfilePicture();
      setPreviewImage(profilePic);
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchUserData();
    } else {
      // Reset state when modal closes
      setForm({ username: "", email: "" });
      setPreviewImage(null);
      setErrors({});
      setSuccess(false);
      setLoading(false);
    }
  }, [show, fetchUserData]);


  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors({});
      setSuccess(false);
    };
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ image: 'Please select a valid image file.' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: 'Image size must be less than 5MB.' });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfilePicture(base64String);
      setPreviewImage(base64String);
      setErrors({});
      setSuccess(false);
      // Trigger update event immediately so other components refresh
      window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
    };
    reader.onerror = () => {
      setErrors({ image: 'Failed to read image file.' });
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setProfilePicture('');
    setPreviewImage(null);
    setErrors({});
    // Trigger update event so other components refresh
    window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
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
        // Get the updated user with profile picture
        const updatedUser = { ...data.data.user, profilePicture: getProfilePicture() };
        // Trigger update callback to refresh UI
        if (onUpdate) {
          onUpdate(updatedUser);
        }
        // Also trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setErrors({ submit: data.message || "Failed to update profile." });
      }
    } catch (error) {
      setErrors({ submit: error.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Profile Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
          {errors.image && (
            <Alert variant="danger" className="mb-3">
              {errors.image}
            </Alert>
          )}
          
          {/* Profile Picture Upload */}
          <Row className="mb-4">
            <Form.Group as={Col}>
              <Form.Label>Profile Picture</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <div style={{ position: "relative" }}>
                  <img
                    src={previewImage || placeholderImg}
                    alt="Profile preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid var(--border-light)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                  />
                  {previewImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: "2px solid white",
                        background: "var(--error)",
                        color: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}
                      title="Remove image"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ marginBottom: "var(--spacing-xs)" }}
                  />
                  <Form.Text className="text-muted">
                    Upload a profile picture (JPG, PNG, GIF). Max size: 5MB
                  </Form.Text>
                </div>
              </div>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col}>
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
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col}>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

