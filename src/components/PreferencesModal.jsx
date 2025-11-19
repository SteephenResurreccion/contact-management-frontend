// src/components/PreferencesModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function PreferencesModal({ show, onClose }) {
  const [preferences, setPreferences] = useState({
    theme: "light",
    notifications: true,
    defaultSort: "first",
    defaultOrder: "asc",
    itemsPerPage: 7,
  });

  useEffect(() => {
    if (show) {
      // Load preferences from localStorage
      const saved = localStorage.getItem("userPreferences");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferences((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to load preferences:", e);
        }
      }
    }
  }, [show]);

  function handleChange(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setPreferences((prev) => ({ ...prev, [field]: value }));
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Save preferences to localStorage
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    onClose();
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Preferences</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Form.Group as={Col}>
              <Form.Label>Theme</Form.Label>
              <Form.Select value={preferences.theme} onChange={handleChange("theme")}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </Form.Select>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col}>
              <Form.Check
                type="checkbox"
                label="Enable Notifications"
                checked={preferences.notifications}
                onChange={handleChange("notifications")}
              />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md={6}>
              <Form.Label>Default Sort By</Form.Label>
              <Form.Select value={preferences.defaultSort} onChange={handleChange("defaultSort")}>
                <option value="first">First Name</option>
                <option value="recent">Recently Added</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={6}>
              <Form.Label>Default Order</Form.Label>
              <Form.Select value={preferences.defaultOrder} onChange={handleChange("defaultOrder")}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </Form.Select>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col}>
              <Form.Label>Items Per Page</Form.Label>
              <Form.Select value={preferences.itemsPerPage} onChange={handleChange("itemsPerPage")}>
                <option value="5">5</option>
                <option value="7">7</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </Form.Select>
            </Form.Group>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Preferences
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

