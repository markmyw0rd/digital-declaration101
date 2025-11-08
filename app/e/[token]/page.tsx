"use client";
import { useEffect, useState } from "react";
import { StudentCard, SupervisorCard, AssessorDeclaration, Checklist, Outcome, Section } from "../../../components/FormCards";
export default function Envelope({ params }:{ params:{ token:string } }){
  const [env,setEnv]=useState<any>(null);
  const [role,setRole]=useState<string>("");
  const token=params.token;
  useEffect(()=>{(async()=>{
    const r=await fetch("/api/whoami",{method:"POST",body:token});
    const j=await r.json(); setRole(j.role);
    const g=await fetch(`/api/envelopes/${j.envId}`,{headers:{authorization:`Bearer ${token}`}});
    setEnv(await g.json());
  })();},[token]);
  if(!env) return <main>Loading…</main>;
  return <main className="p-6">{role}</main>;
}
