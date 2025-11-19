// src/layout/Layout.jsx
import React from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";

/**
 * Layout without the left sidebar.
 * We keep a simple wrapper + main container and render the routed page.
 */
export default function Layout() {
  return (
    <div className="app-shell">
      {/* No more <Sidebar /> here */}

      <main className="main-pane">
        <Container fluid className="main-container">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}
