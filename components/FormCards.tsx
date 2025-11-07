"use client";
import SignaturePad from "@/components/SignaturePad";

export function Section({ title, children, locked=false }:{ title:string, children:any, locked?:boolean }){
  return (
    <div className={`avoid-break rounded-xl border bg-white ${locked?"opacity-60":""}`}>
      <div className="px-4 py-2 border-b font-medium">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function StudentCard({locked, onSign}:{locked:boolean,onSign:(sig:string,nextEmail:string)=>void}){
  let sig = "";
  let next = "";
  return (
    <Section title="Student's Declaration" locked={locked}>
      <p className="text-sm text-gray-700 mb-2">
        I confirm I can perform the required workplace tasks to industry standard, independently and without additional supervision or training.
      </p>
      <SignaturePad onChange={(s)=>{sig=s}}/>
      <div className="grid gap-2 mt-3">
        <input className="border p-2 rounded" placeholder="Supervisor Email (next)" onChange={e=>next=e.target.value}/>
        <button className="px-3 py-2 bg-black text-white rounded" onClick={()=>onSign(sig,next)}>Sign & Notify Supervisor</button>
      </div>
    </Section>
  );
}

export function SupervisorCard({locked, onSign}:{locked:boolean,onSign:(sig:string,nextEmail:string)=>void}){
  let sig = ""; let next="";
  return (
    <Section title="Supervisor's Declaration" locked={locked}>
      <p className="text-sm text-gray-700 mb-2">
        I confirm the student has consistently performed the required workplace tasks to industry standard, independently and without the need for further supervision or training.
      </p>
      <SignaturePad onChange={(s)=>{sig=s}}/>
      <div className="grid gap-2 mt-3">
        <input className="border p-2 rounded" placeholder="Assessor Email (next)" onChange={e=>next=e.target.value}/>
        <button className="px-3 py-2 bg-black text-white rounded" onClick={()=>onSign(sig,next)}>Sign & Notify Assessor</button>
      </div>
    </Section>
  );
}

export function AssessorDeclaration({locked}:{locked:boolean}){
  return (
    <Section title="Assessor's Declaration" locked={locked}>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-2"><input type="checkbox" name="practical" className="accent-black"/><span>Section 1: Practical Skills — Pre-Assessment & Task Observation</span></label>
        <label className="flex items-center gap-2"><input type="checkbox" name="knowledge" className="accent-black"/><span>Section 2: Knowledge Assessment</span></label>
        <label className="flex items-center gap-2"><input type="checkbox" name="assessor" className="accent-black"/><span>Section 3: Assessor Confirmation</span></label>
        <label className="flex items-center gap-2"><input type="checkbox" name="practical2" className="accent-black"/><span>Section 4: Practical Assessment</span></label>
      </div>
    </Section>
  );
}

export function Checklist({locked}:{locked:boolean}){
  const items = [
    "Student has signed Section 1 and Section 4",
    "Workplace Supervisor has completed and signed Section 1",
    "Assessor has signed Section 3 and Section 4",
    "All parties (Student, Supervisor, Assessor) have signed the relevant declarations",
    "Training Record Book completed",
    "Results entered in TEAMS",
    "RTA completed and signed by all 3 parties"
  ];
  return (
    <Section title="Quick Assessor Checklist" locked={locked}>
      <ul className="grid gap-2">
        {items.map((t,i)=>(
          <li key={i} className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 accent-black"/>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Outcome({locked, onComplete}:{locked:boolean,onComplete:(outcome:"C"|"NYC")=>void}){
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Section title="Competent — If competent, provide feedback to Student after assessment." locked={locked}>
        <textarea className="border rounded p-2 w-full h-24" placeholder="Assessor feedback for Competent"></textarea>
        <button className="mt-3 px-3 py-2 bg-black text-white rounded" onClick={()=>onComplete("C")}>Mark Competent & Generate PDF</button>
      </Section>
      <Section title="Not Yet Competent — If NYC, provide feedback on requirements for next assessment." locked={locked}>
        <textarea className="border rounded p-2 w-full h-24" placeholder="Assessor feedback for NYC"></textarea>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input type="date" className="border p-2 rounded" placeholder="Next proposed assessment date"/>
          <input className="border p-2 rounded" placeholder="Name of Assessor"/>
        </div>
        <button className="mt-3 px-3 py-2 bg-black text-white rounded" onClick={()=>onComplete("NYC")}>Mark NYC & Generate PDF</button>
      </Section>
    </div>
  );
}
