// Single source of truth for fields (used by CSV, I/O, and forms)

export const CONTACT_FIELDS = [
    // --- DETAILS ---
    "id",
    "profilePicture", // NEW
    "firstName",      // UPDATED (Was 'name')
    "lastName",       // NEW
    "email",
    "phone",
    
    // --- WORK / NOTES ---
    "company",        // NEW (Affiliation/Company)
    "jobTitle",       // NEW (Job Title/Role)
    "address",        // NEW
    "socialMedia",    // NEW (Array of links)
    "notes",
    
    // --- STATUS / METADATA ---
    // The backend handles 'createdAt' (Date Added) and 'updatedAt' (Last Modified Date)
    // 'starred' is the status field
    "starred"
];