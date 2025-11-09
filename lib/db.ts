// lib/db.ts

// --- Example mock database layer ---
// Replace these with your actual DB calls if needed.

export async function getEnvelope(id: string) {
  console.log("[db] getEnvelope", id);
  // Mocked example data
  return {
    id,
    unitCode: "AURTTE104",
    studentName: "Mark Alvin Mabayo",
    studentEmail: "mabayomark@gmail.com",
    supervisorEmail: "markalvin.m@macallan.edu.au",
    assessorEmail: "assessor@example.com",
    status: "awaiting_student",
  };
}

export async function updateEnvelope(id: string, patch: any) {
  console.log("[db] updateEnvelope", id, patch);
  return { id, ...patch };
}

export async function createEnvelope(init: any) {
  console.log("[db] createEnvelope", init);
  return { id: Math.random().toString(36).slice(2), ...init };
}

// ✅ export as named object for convenience
export const db = {
  getEnvelope,
  updateEnvelope,
  createEnvelope,
};

export default db;
