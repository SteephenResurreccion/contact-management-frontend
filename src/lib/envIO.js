// src/lib/envIO.js
import { getContacts, createContact } from "../services/contacts.repo";

// Export contacts to .env text
export async function exportContactsEnv() {
  const contacts = await getContacts();
  const content = contacts
    .map((c, i) => {
      const prefix = `CONTACT_${i + 1}`;
      return [
        `${prefix}_NAME=${c.name}`,
        `${prefix}_EMAIL=${c.email}`,
        `${prefix}_PHONE=${c.phone}`,
        `${prefix}_DEPT=${c.department}`,
        `${prefix}_STARRED=${c.starred ? "true" : "false"}`,
      ].join("\n");
    })
    .join("\n\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts.env";
  a.click();
  URL.revokeObjectURL(url);
}

// Import from .env file
export async function importContactsEnv(file) {
  const text = await file.text();
  const blocks = text.split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const entry = {};
    for (const line of lines) {
      const [k, v] = line.split("=");
      if (k.endsWith("_NAME")) entry.name = v;
      if (k.endsWith("_EMAIL")) entry.email = v;
      if (k.endsWith("_PHONE")) entry.phone = v;
      if (k.endsWith("_DEPT")) entry.department = v;
      if (k.endsWith("_STARRED")) entry.starred = v === "true";
    }
    if (entry.name) await createContact(entry);
  }
}
