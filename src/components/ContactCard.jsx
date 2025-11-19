// src/components/ContactCard.jsx
import React from "react";

export default function ContactCard({ contact, onEdit, onDelete, onToggleStar }) {
  const { name, department, email, phone, starred } = contact;

  return (
    <div className="contact-card">
      <div className="d-flex justify-content-between align-items-start">
        <div className="d-flex align-items-center gap-2">
          <img
            className="rounded-circle"
            style={{ width: 42, height: 42, objectFit: "cover" }}
            src={new URL("../assets/placeholder.png", import.meta.url).href}
            alt=""
          />
          <div>
            <div className="name">{name || "(no name)"}</div>
            {department ? <div className="dept">{department}</div> : null}
          </div>
        </div>

        <div className="d-flex gap-1">
          <button
            className={`star-btn${starred ? " active" : ""}`}
            onClick={() => onToggleStar(contact)}
            title={starred ? "Unfavorite" : "Favorite"}
          >
            <i className={`bi ${starred ? "bi-star-fill" : "bi-star"}`} />
          </button>

          <div className="btn-group">
            <button
              type="button"
              className="dots-btn dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="More"
            >
              <i className="bi bi-three-dots-vertical" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={() => onEdit(contact)}>
                  Edit
                </button>
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => onDelete(contact)}>
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-3 small-text">
        {phone && (
          <div className="mb-1">
            <i className="bi bi-telephone me-2" />
            {phone}
          </div>
        )}
        {email && (
          <div>
            <i className="bi bi-envelope me-2" />
            {email}
          </div>
        )}
      </div>
    </div>
  );
}
