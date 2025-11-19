// src/components/ContactRow.jsx
import React, { useState } from "react";
import placeholderImg from "../assets/placeholder.png";

export default function ContactRow({
  contact,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStar,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRowClick = () => {
    onSelect(contact);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleStar(contact);
  };

  const handleDotsClick = (e) => {
    e.stopPropagation();
    setMenuOpen((open) => !open);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit(contact);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(contact);
  };

  // Helper to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const cardClasses = [
    "contact-row-card",
    selected ? "contact-row-selected" : "",
    menuOpen ? "contact-row-card--menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} onClick={handleRowClick}>
      <div className="contact-row-left">
        <div className="contact-avatar">
          <img
            src={contact.profilePicture || placeholderImg}
            alt={contact.name}
            className="contact-avatar-img"
          />
        </div>

        <div className="contact-info">
          <div className="contact-name">{contact.name}</div>

          {/* Job/Company */}
          {(contact.jobTitle || contact.company) && (
            <div
              className="contact-role small text-muted mb-1"
              style={{ fontSize: "0.85rem" }}
            >
              {contact.jobTitle}
              {contact.jobTitle && contact.company ? " • " : ""}
              {contact.company}
            </div>
          )}

          <div className="contact-meta">
            {contact.phone && (
              <span>
                <i className="bi bi-telephone" /> {contact.phone}
              </span>
            )}
            {contact.email && (
              <span>
                <i className="bi bi-envelope" /> {contact.email}
              </span>
            )}
          </div>
          
          {/* 💥 NEW: Added Date Display */}
          <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginTop: "4px" }}>
            Added on {formatDate(contact.createdAt)}
          </div>
        </div>
      </div>

      <div className="contact-actions">
        {/* star */}
        <button
          type="button"
          className={
            "star-btn" + (contact.starred ? " star-btn-active" : "")
          }
          onClick={handleStarClick}
        >
          <i className={contact.starred ? "bi bi-star-fill" : "bi bi-star"} />
        </button>

        {/* three dots */}
        <button
          type="button"
          className="dots-btn"
          onClick={handleDotsClick}
        >
          <i className="bi bi-three-dots-vertical" />
        </button>

        {menuOpen && (
          <div className="contact-menu" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="contact-menu-item"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className="contact-menu-item contact-menu-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}