// src/components/LeftProfile.jsx
import React from "react";
import placeholderImg from "../assets/placeholder.png";

export default function LeftProfile() {
  return (
    <div className="profile-rail">
      {/* 1. APP TITLE CHANGED HERE */}
      <h2 className="profile-title">NextContacts</h2>

      <div className="profile-card">
        <div className="profile-avatar-wrap">
          <img
            src={placeholderImg}
            alt="Admin avatar"
            className="profile-avatar"
          />
        </div>

        <div className="profile-name">Admin</div>
        <div className="profile-email">admin@example.com</div>
      </div>

      <div className="profile-meta">
        <div className="profile-meta-row">
          <div className="meta-ico">
            <i className="bi bi-person-badge" />
          </div>
          <span>System Administrator</span>
        </div>

        <div className="profile-meta-row">
          <div className="meta-ico">
            <i className="bi bi-telephone" />
          </div>
          <span>+63 905 555 1234</span>
        </div>

        <div className="profile-meta-row">
          <div className="meta-ico">
            <i className="bi bi-geo-alt" />
          </div>
          {/* 2. DASHBOARD LABEL CHANGED HERE */}
          <span>NexContacts Dashboard</span>
        </div>
      </div>
    </div>
  );
}