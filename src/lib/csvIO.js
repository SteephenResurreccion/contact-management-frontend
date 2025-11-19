// src/lib/csvIO.js

/* CSV Configuration 
  Maps internal data keys to CSV Column Headers.
  IMPORTANT: These keys must match what your API expects.
*/
const CSV_COLUMNS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Job Title" },
  { key: "address", label: "Address" },
  { key: "socialMedia", label: "Social Media Links" }, // Joined by "|"
  { key: "notes", label: "Notes" },
  { key: "starred", label: "Starred" },
];

/**
 * Helper: Escapes a string for CSV format.
 * Wraps in quotes if it contains special chars.
 */
function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * EXPORT: downloads the contacts list as a .csv file
 */
export function exportContactsCsv(contacts) {
  if (!contacts || contacts.length === 0) {
    alert("No contacts to export.");
    return;
  }

  // 1. Create Header Row
  const headers = CSV_COLUMNS.map((col) => escapeCsv(col.label)).join(",");

  // 2. Create Data Rows
  const rows = contacts.map((contact) => {
    return CSV_COLUMNS.map((col) => {
      let val = contact[col.key];

      // Join Social Media array into a single string "link1|link2"
      if (col.key === "socialMedia" && Array.isArray(val)) {
        val = val.join("|"); 
      }
      
      // Convert boolean to string
      if (typeof val === "boolean") {
        val = val ? "true" : "false";
      }

      return escapeCsv(val);
    }).join(",");
  });

  // 3. Trigger Download
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * IMPORT: Reads a CSV file and returns parsed contact objects
 */
export function importContactsCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        const contacts = parseCsvText(text);
        resolve(contacts);
      } catch (err) {
        console.error("CSV Parse Error:", err);
        alert("Failed to parse CSV file. Please check the format.");
        resolve([]);
      }
    };
    
    reader.onerror = () => {
      alert("Error reading file.");
      resolve([]);
    };

    reader.readAsText(file);
  });
}

/**
 * Helper: Parses raw CSV text into objects
 */
function parseCsvText(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) return []; 

  // 1. Parse Headers
  const headerRow = parseCsvLine(lines[0]);
  
  // Map CSV column index -> Internal Key
  const columnMap = {};
  headerRow.forEach((headerText, index) => {
    const cleanHeader = headerText.toLowerCase().trim();
    const foundCol = CSV_COLUMNS.find((c) => c.label.toLowerCase() === cleanHeader);
    if (foundCol) {
      columnMap[index] = foundCol.key;
    }
  });

  // 2. Parse Rows
  const parsedContacts = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0) continue;

    const contact = {};
    let hasData = false;

    values.forEach((val, index) => {
      const key = columnMap[index];
      if (key) {
        let cleanVal = val.trim();
        
        // Convert special fields back
        if (key === "socialMedia") {
          contact[key] = cleanVal ? cleanVal.split("|").map(s => s.trim()).filter(Boolean) : [];
        } else if (key === "starred") {
          contact[key] = cleanVal.toLowerCase() === "true";
        } else {
          contact[key] = cleanVal;
        }

        if (cleanVal) hasData = true;
      }
    });

    if (hasData) {
      parsedContacts.push(contact);
    }
  }

  return parsedContacts;
}

/**
 * Helper: Parses a single CSV line, respecting quotes.
 */
function parseCsvLine(text) {
  const result = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}