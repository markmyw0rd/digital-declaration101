"use client";
import { useState } from "react";

export default function Home(){
  const [loading,setLoading] = useState(false);
  async function create(e: any){
    e.preventDefault(); setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/envelopes",{ method:"POST", body: JSON.stringify(data) });
    const j = await res.json(); setLoading(false);
    if (j.next) window.location.href = j.next;
  }
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create Envelope (AURTTE104)</h1>
      <form onSubmit={create} className="grid gap-3">
        <input name="unitCode" defaultValue="AURTTE104" className="border p-2 rounded" />
        <input name="unitName" placeholder="Unit Name (optional)" className="border p-2 rounded" />
        <input name="studentEmail" placeholder="Student Email" className="border p-2 rounded" required/>
        <input name="studentName" placeholder="Student Name" className="border p-2 rounded"/>
        <input name="supervisorEmail" placeholder="Supervisor Email" className="border p-2 rounded" required/>
        <input name="assessorEmail" placeholder="Assessor Email" className="border p-2 rounded" required/>
        <button disabled={loading} className="px-4 py-2 rounded bg-black text-white">{loading?"Creating...":"Create & Email Student"}</button>
      </form>
      <p className="text-sm text-gray-600">Or use /start?u=AURTTE104&student=...&name=...&sup=...&assess=...</p>
    </main>
  );
}
