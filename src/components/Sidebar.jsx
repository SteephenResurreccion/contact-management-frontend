import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import placeholder from "../assets/placeholder.png";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">Group 9 • Contact Management</div>

      {/* Profile */}
      <div className="sidebar-profile">
        <img src={placeholder} alt="Admin" width={44} height={44} />
        <div>
          <div className="sidebar-profile-name">John Smith</div>
          <div className="sidebar-profile-role">Admin</div>
        </div>
      </div>

      {/* Nav */}
      <Nav className="flex-column">
        <Nav.Item>
          <Nav.Link as={NavLink} to="/" end className="nav-link">
            <FiUsers />
            <span>Contacts</span>
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Footer */}
      <div className="sidebar-footer">
        Frontend: React/Vite • DB: MongoDB (Atlas) • Backend: Node.js/Express
      </div>
    </aside>
  );
}
