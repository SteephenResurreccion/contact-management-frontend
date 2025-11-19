// src/components/ContactsToolbar.jsx
import React, { useRef } from "react";

export default function ContactsToolbar({
  total,
  q,
  setQ,
  sortMode,
  setSortMode,
  sortDirection,
  setSortDirection,
  filterMode,
  setFilterMode,
  onAdd,
  onExportCsv,
  onImportCsv,
  onLogout,
}) {
  const fileRef = useRef(null);

  return (
    <div className="contacts-toolbar">
      <div className="contacts-toolbar-left">
        {/* All / Favorites pills */}
        <div className="pill-group" role="group" aria-label="filter">
          <button
            type="button"
            className={`pill ${filterMode === "all" ? "pill-active" : ""}`}
            onClick={() => setFilterMode("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`pill ${filterMode === "starred" ? "pill-active" : ""}`}
            onClick={() => setFilterMode("starred")}
          >
            Favorites
          </button>
        </div>

        {/* Sort by */}
        <div className="sort-select">
          <span className="contacts-count me-1">Sort</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
          >
            <option value="first">First name</option>
            {/* "Last name" intentionally removed */}
            <option value="recent">Recently added</option>
          </select>
        </div>

        {/* Asc / Desc toggle */}
        <div className="sort-select">
          <span className="contacts-count me-1">Order</span>
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <span className="contacts-count">{total} contact(s)</span>
      </div>

      <div className="contacts-toolbar-right">
        {/* Search */}
        <div className="search-wrap">
          <i className="bi bi-search" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for contacts"
          />
        </div>

        {/* Export */}
        <button
          type="button"
          className="icon-btn"
          onClick={onExportCsv}
          title="Export CSV"
        >
          <i className="bi bi-download" />
        </button>

        {/* Import */}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportCsv(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="icon-btn"
          title="Import CSV"
          onClick={() => fileRef.current?.click()}
        >
          <i className="bi bi-upload" />
        </button>

        {/* New contact */}
        <button className="btn-new-contact" type="button" onClick={onAdd}>
          <i className="bi bi-plus-lg" />
          <span>New contact</span>
        </button>

        {/* Logout – right beside New contact */}
        <button
          type="button"
          className="btn-new-contact"
          style={{
            marginLeft: "8px",
            background: "#e5e7eb",
            color: "#111827",
            boxShadow: "none",
          }}
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
