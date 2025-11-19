// src/components/ContactDetailPanel.jsx
import React, { useState, useEffect } from "react";
import placeholder from "../assets/placeholder.png";

export default function ContactDetailPanel({ contact, recentContacts }) {
  const [tab, setTab] = useState("contact"); // contact | work | about

  // Reset tab when contact changes
  useEffect(() => {
    setTab("contact");
  }, [contact]);

  // Helper to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!contact) {
    return (
      <div className="detail-panel detail-empty">
        Select a contact to see details.
      </div>
    );
  }

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-avatar-wrap">
          {/* Display Avatar (placeholder for now) */}
          <img
            src={contact.profilePicture || placeholder}
            alt=""
            className="detail-avatar"
          />
        </div>
        <div>
          <div className="detail-name">{contact.name || "(no name)"}</div>
          <div className="detail-role">
            {contact.jobTitle}
            {contact.jobTitle && contact.company && " at "}
            {contact.company}
          </div>
          
          {/* Added Date Display in Header */}
          <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "6px" }}>
            <i className="bi bi-calendar3 me-1"></i>
            Added on {formatDate(contact.createdAt)}
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        <button
          className={`detail-tab ${tab === "contact" ? "active" : ""}`}
          onClick={() => setTab("contact")}
        >
          Contact
        </button>
        <button
          className={`detail-tab ${tab === "work" ? "active" : ""}`}
          onClick={() => setTab("work")}
        >
          Work
        </button>
        <button
          className={`detail-tab ${tab === "about" ? "active" : ""}`}
          onClick={() => setTab("about")}
        >
          About
        </button>
      </div>

      {/* --- CONTACT TAB --- */}
      {tab === "contact" && (
        <div className="detail-body">
          {/* Phone */}
          <div className="detail-row">
            <div className="detail-icon-chip" style={{ cursor: "default" }}>
              <i className="bi bi-telephone" />
            </div>
            <div>
              <div className="detail-label">Phone</div>
              <div className="detail-value">{contact.phone || "—"}</div>
            </div>
          </div>

          {/* Email */}
          <div className="detail-row">
            <div className="detail-icon-chip chip-mail" style={{ cursor: "default" }}>
              <i className="bi bi-envelope" />
            </div>
            <div>
              <div className="detail-label">Email</div>
              <div className="detail-value">{contact.email || "—"}</div>
            </div>
          </div>

          {/* Address */}
          <div className="detail-row">
            <div className="detail-icon-chip" style={{ cursor: "default" }}>
              <i className="bi bi-geo-alt" />
            </div>
            <div>
              <div className="detail-label">Address</div>
              <div className="detail-value" style={{ whiteSpace: "pre-line" }}>
                {contact.address || "—"}
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="detail-row">
            <div className="detail-icon-chip" style={{ cursor: "default" }}>
              <i className="bi bi-share" />
            </div>
            <div>
              <div className="detail-label">Social Media</div>
              <div className="detail-value">
                {contact.socialMedia && contact.socialMedia.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {contact.socialMedia.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- WORK TAB --- */}
      {tab === "work" && (
        <div className="detail-body">
          <div className="mb-3">
            <div className="detail-label">Company / Affiliation</div>
            <div className="detail-value">{contact.company || "—"}</div>
          </div>
          <div>
            <div className="detail-label">Job Title / Role</div>
            <div className="detail-value">{contact.jobTitle || "—"}</div>
          </div>
        </div>
      )}

      {/* --- ABOUT TAB --- */}
      {tab === "about" && (
        <div className="detail-body">
          <div>
            <div className="detail-label">Notes</div>
            <div className="detail-value">
              {contact.notes ? contact.notes : "No additional notes."}
            </div>
          </div>
        </div>
      )}

      {/* Recent Contacts List (Footer) */}
      <div className="detail-recent">
        <div className="detail-recent-title">Recently added</div>
        <ul className="detail-recent-list">
          {recentContacts && recentContacts.length > 0 ? (
            recentContacts.map((c) => (
              <li key={c.id} className="detail-recent-item">
                <div className="detail-recent-name">{c.name}</div>
                <div className="detail-recent-role">
                  {c.company || c.department || "—"}
                </div>
              </li>
            ))
          ) : (
            <li className="detail-recent-item">
              <div className="detail-recent-name">No recent contacts</div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}