// src/services/contacts.repo.js
// This file now uses the backend API instead of localStorage

import { contactsAPI } from './api.js';

// --- public API (front-end uses only this) ---

export async function getContacts() {
  try {
    return await contactsAPI.getAll();
  } catch (error) {
    console.error('Failed to get contacts:', error);
    return [];
  }
}

export async function createContact(form) {
  try {
    // 💥 FIX 3: Pass the entire form object, which now correctly includes 
    // firstName, lastName, and the constructed name field.
    return await contactsAPI.create(form); 
  } catch (error) {
    console.error('Failed to create contact:', error);
    throw error;
  }
}

export async function updateContact(id, patch) {
  try {
    // Get current contact to merge with patch
    const current = await contactsAPI.getById(id);
    if (!current) return null;
    
    const updated = { ...current, ...patch };
    return await contactsAPI.update(id, updated);
  } catch (error) {
    console.error('Failed to update contact:', error);
    return null;
  }
}

export async function deleteContact(id) {
  try {
    return await contactsAPI.delete(id);
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return false;
  }
}

export async function toggleStar(id) {
  try {
    const current = await contactsAPI.getById(id);
    if (!current) return null;
    return await contactsAPI.toggleStar(id, current.starred);
  } catch (error) {
    console.error('Failed to toggle star:', error);
    return null;
  }
}