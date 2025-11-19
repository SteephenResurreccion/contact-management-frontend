// src/pages/ContactsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, authAPI } from "../services/api.js";

import Sidebar from "../components/Sidebar.jsx";
import ContactsToolbar from "../components/ContactsToolbar.jsx";
import ContactFormModal from "../components/ContactFormModal.jsx";
import ContactDetailPanel from "../components/ContactDetailPanel.jsx";
import ContactRow from "../components/ContactRow.jsx";

import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  toggleStar,
} from "../services/contacts.repo";

import { exportContactsCsv, importContactsCsvFile } from "../lib/csvIO";

const PAGE_SIZE = 7;

/* ---------- helpers ---------- */

function groupContacts(contacts) {
  return contacts.reduce((acc, contact) => {
    // Use firstName for grouping to match sorting, fallback to name
    const nameForSorting = contact.firstName || contact.name || 'Unknown'; 
    const initial = nameForSorting.charAt(0).toUpperCase();
    if (!acc[initial]) acc[initial] = [];
    acc[initial].push(contact);
    return acc;
  }, {});
}

function sortContacts(contacts, mode, direction) {
  return [...contacts].sort((a, b) => {
    let aVal, bVal;
    if (mode === "recent") {
      // Convert to numbers for proper comparison
      aVal = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
      bVal = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    } else {
      // Sort by first name
      aVal = (a.firstName || a.name || "").trim();
      bVal = (b.firstName || b.name || "").trim();
      const comparison = aVal.localeCompare(bVal, undefined, { sensitivity: 'base' });
      return direction === "asc" ? comparison : -comparison;
    }
  });
}

function filterContacts(contacts, filterMode, q) {
  let filtered = contacts;
  if (filterMode === "starred") {
    filtered = filtered.filter((c) => c.starred);
  }
  if (q.trim()) {
    const query = q.trim().toLowerCase();
    filtered = filtered.filter((c) => {
      return (
        (c.name || '').toLowerCase().includes(query) || 
        (c.firstName || '').toLowerCase().includes(query) ||
        (c.lastName || '').toLowerCase().includes(query) ||
        (c.email || '').toLowerCase().includes(query) ||
        (c.phone || '').includes(query) ||
        (c.company || '').toLowerCase().includes(query) ||
        (c.jobTitle || '').toLowerCase().includes(query)
      );
    });
  }
  return filtered;
}

function normalizePhone(phone = "") {
  return String(phone).replace(/\D/g, "");
}

function mergeContactData(existing, incoming) {
  return {
    ...existing,
    ...incoming,
    id: existing.id,
    createdAt: existing.createdAt ?? incoming.createdAt,
  };
}

export default function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState("first");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterMode, setFilterMode] = useState("all");
  const [activeContact, setActiveContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState({ show: false, mode: "add", initial: null });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
      setSelectedId(data[0]?.id ?? null);
    } catch (err) {
      setError(err.message || "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/"); return; }
    fetchContacts();
  }, [navigate]);

  const { filtered, grouped, paginatedInitials, paginatedByInitial, totalPages, recentContacts } = useMemo(() => {
    let filteredList = filterContacts(contacts, filterMode, q);
    const sortedList = sortContacts(filteredList, sortMode, sortDirection);
    
    const totalPages = Math.ceil(sortedList.length / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginatedList = sortedList.slice(start, end);

    const paginatedByInitial = groupContacts(paginatedList);
    const paginatedInitials = Object.keys(paginatedByInitial).sort();

    const recentContacts = [...contacts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    return { filtered: filteredList, grouped: sortedList, paginatedByInitial, paginatedInitials, totalPages, recentContacts };
  }, [contacts, filterMode, q, sortMode, sortDirection, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (totalPages === 0 && currentPage !== 1) setCurrentPage(1);
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (!activeContact && filtered.length > 0) setActiveContact(filtered[0]);
    if (activeContact && !filtered.some(c => c.id === activeContact.id)) setActiveContact(null);
  }, [filtered, activeContact]);

  const handleLogout = () => { authAPI.logout(); navigate("/"); };

  const setSelectedId = (id) => {
    const contact = contacts.find(c => c.id === id);
    if (contact) setActiveContact(contact);
  };

  const handleSave = async (formValues) => {
    if (!formValues.firstName?.trim() || !formValues.phone?.trim() || !formValues.email?.trim()) {
        alert("Error: First Name, Phone, and Email are required.");
        return;
    }

    const fullName = `${formValues.firstName} ${formValues.lastName || ''}`.trim();
    const dataToSend = { ...formValues, name: fullName };

    const incomingPhoneNorm = normalizePhone(dataToSend.phone);

    if (modalState.mode === "edit" && modalState.initial) {
      const id = modalState.initial.id;
      const duplicate = incomingPhoneNorm 
        ? contacts.find(c => c.id !== id && normalizePhone(c.phone) === incomingPhoneNorm)
        : null;

      if (duplicate && window.confirm(`Merge with existing contact ${duplicate.name}?`)) {
         const mergedData = mergeContactData(duplicate, dataToSend);
         const updated = await updateContact(duplicate.id, mergedData);
         if (updated) {
            setContacts(prev => prev.map(c => c.id === duplicate.id ? updated : c).filter(c => c.id !== id));
            setSelectedId(duplicate.id);
         }
         setModalState({ show: false, mode: "add", initial: null });
         return;
      }

      const updated = await updateContact(id, dataToSend);
      if (updated) {
        setContacts(prev => prev.map(c => c.id === id ? updated : c));
        setSelectedId(id);
        setActiveContact(updated);
      }
      setModalState({ show: false, mode: "add", initial: null });
      return;
    }

    const duplicate = incomingPhoneNorm ? contacts.find(c => normalizePhone(c.phone) === incomingPhoneNorm) : null;
    if (duplicate && window.confirm(`Merge with existing contact ${duplicate.name}?`)) {
        const mergedData = mergeContactData(duplicate, dataToSend);
        const updated = await updateContact(duplicate.id, mergedData);
        if (updated) {
            setContacts(prev => prev.map(c => c.id === duplicate.id ? updated : c));
            setSelectedId(duplicate.id);
            setActiveContact(updated);
        }
        setModalState({ show: false, mode: "add", initial: null });
        return;
    }

    const created = await createContact(dataToSend);
    if (created) {
        setContacts(prev => [...prev, created]);
        setSelectedId(created.id);
        setActiveContact(created);
    }
    setModalState({ show: false, mode: "add", initial: null });
  };

  const handleDelete = async (contact) => {
    if (!window.confirm(`Delete ${contact.name}?`)) return;
    const success = await deleteContact(contact.id);
    if (success) {
        setContacts(c => c.filter(con => con.id !== contact.id));
        setActiveContact(null);
    }
  };

  const handleToggleStar = async (contact) => {
    const updated = await toggleStar(contact.id);
    if (updated) {
        setContacts(c => c.map(con => con.id === updated.id ? updated : con));
        if (activeContact?.id === updated.id) setActiveContact(updated);
    }
  };

  const handleExportCsv = () => exportContactsCsv(contacts);

  // --- IMPORT HANDLER (INTEGRATED) ---
  const handleImportCsv = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
        const importedList = await importContactsCsvFile(file);
        if (importedList.length === 0) {
            alert("No valid contacts found in file.");
            setLoading(false);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        // Iterate and Create
        for (const contact of importedList) {
            const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
            const payload = { ...contact, name: fullName };
            
            try {
                if (!payload.firstName && !payload.phone && !payload.email) continue;
                await createContact(payload);
                successCount++;
            } catch (e) {
                console.error("Import row failed", e);
                failCount++;
            }
        }

        alert(`Import finished.\nSuccess: ${successCount}\nFailed: ${failCount}`);
        fetchContacts(); // Full Refresh

    } catch (e) {
        console.error(e);
        alert("Failed to process CSV file.");
        setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="contacts-page">
      <Sidebar onLogout={handleLogout} />

      <div className="contacts-main">
        <div className="contacts-topbar">
          <div className="topbar-title">Contact Book</div>
          <ContactsToolbar
            total={filtered.length}
            q={q} setQ={setQ}
            sortMode={sortMode} setSortMode={setSortMode}
            sortDirection={sortDirection} setSortDirection={setSortDirection}
            filterMode={filterMode} setFilterMode={setFilterMode}
            onAdd={() => setModalState({ show: true, mode: "add", initial: null })}
            onExportCsv={handleExportCsv} 
            onImportCsv={handleImportCsv}
          />
        </div>

        <div className="contacts-body">
          <div className="contacts-list-wrapper">
            <div className="contacts-list">
              {loading ? <div className="contacts-message">Loading...</div> : 
               filtered.length === 0 ? <div className="contacts-message">No contacts found.</div> : 
               (
                <div className="contact-rows-group">
                  {paginatedInitials.map((initial) => (
                    <React.Fragment key={initial}>
                      <div className="contact-initial-separator">{initial}</div>
                      {paginatedByInitial[initial].map((contact) => (
                        <ContactRow
                          key={contact.id}
                          contact={contact}
                          selected={activeContact && activeContact.id === contact.id}
                          onSelect={setActiveContact}
                          onEdit={(c) => setModalState({ show: true, mode: "edit", initial: c })}
                          onDelete={handleDelete}
                          onToggleStar={handleToggleStar}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}
              {filtered.length > 0 && (
                <div className="contacts-pagination">
                  <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
                  <span className="page-info">Page {currentPage} of {totalPages}</span>
                  <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
                </div>
              )}
            </div>
          </div>
          <div className="contacts-detail">
            <ContactDetailPanel 
              contact={activeContact} 
              recentContacts={recentContacts}
              onSelectContact={setActiveContact}
            />
          </div>
        </div>
      </div>

      <ContactFormModal
        show={modalState.show}
        mode={modalState.mode}
        initial={modalState.initial}
        onClose={() => setModalState({ show: false, mode: "add", initial: null })}
        onSave={handleSave}
      />
    </div>
  );
}