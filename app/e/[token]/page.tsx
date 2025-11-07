"use client";
import { useEffect, useMemo, useState } from "react";
import { StudentCard, SupervisorCard, AssessorDeclaration, Checklist, Outcome, Section } from "@/components/FormCards";

export default function Envelope({ params }:{ params:{ token:string } }){
  const [env,setEnv] = useState<any>(null);
  const [role,setRole] = useState<string>("");
  const token = params.token;

  useEffect(()=>{
    (async()=>{
      const r = await fetch("/api/whoami", { method:"POST", body: token });
      const j = await r.json(); setRole(j.role);
      const g = await fetch(`/api/envelopes/${j.envId}`, { headers: { authorization: `Bearer ${token}` }});
      const env = await g.json(); setEnv(env);
    })();
  },[token]);

  const canStudent = env?.envelope?.status==="awaiting_student" && role==="student";
  const canSupervisor = env?.envelope?.status==="awaiting_supervisor" && role==="supervisor";
  const canAssessor = env?.envelope?.status==="awaiting_assessor" && role==="assessor";

  async function signCurrent(signatureDataUrl:string, nextEmail:string){
    const res = await fetch(`/api/envelopes/${env.envelope.id}/sign`,{
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ token, signatureDataUrl, formPatch:{ agreed:true }, nextEmail })
    });
    const j = await res.json(); if (j.next) window.location.href = j.next;
  }

  async function complete(outcome:"C"|"NYC"){
    const res = await fetch(`/api/envelopes/${env.envelope.id}/complete`,{
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ token, outcome, assessorEmail: "" })
    });
    const j = await res.json(); if (j.finalUrl) window.location.href = j.finalUrl;
  }

  if (!env) return <main className="p-6">Loading…</main>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">AURTTE104: Workplace Competency Declaration</h1>
        <p className="text-sm text-gray-600">Envelope {env.envelope.id} • Unit: {env.envelope.unit_code} • Status: {env.envelope.status} • Your role: <b>{role}</b></p>
      </header>

      <Section title="Purpose of this document">
        <p className="text-sm text-gray-700">
          This document confirms the apprentice/student has demonstrated the required skills and knowledge to industry standard. The student declares the work is their own; the workplace supervisor verifies consistent performance; and the RTO assessor reviews the evidence and makes the final competency decision.
        </p>
      </Section>

      <div className="grid md:grid-cols-2 gap-4">
        <StudentCard locked={!canStudent} onSign={signCurrent}/>
        <SupervisorCard locked={!canSupervisor} onSign={signCurrent}/>
      </div>

      <AssessorDeclaration locked={!canAssessor}/>
      <Checklist locked={!canAssessor}/>
      <Outcome locked={!canAssessor} onComplete={complete}/>
      <footer className="text-xs text-gray-500 pt-4">© Allora College — Workplace Training and Assessment | AURTTE104 Declaration</footer>
    </main>
  );
}
