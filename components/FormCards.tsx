"use client";
import SignaturePad from "./SignaturePad"; // ✅ correct relative import

/* -----------------------------
   Generic section container
----------------------------- */
export function Section({
  title,
  children,
  locked = false,
}: {
  title: string;
  children: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <div
      className={`avoid-break rounded-xl border bg-white ${
        locked ? "opacity-60" : ""
      }`}
    >
      <div className="px-4 py-2 border-b font-medium">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* -----------------------------
   Student Declaration
----------------------------- */
export function StudentCard({
  locked,
  onSign,
}: {
  locked: boolean;
  onSign: (sig: string, nextEmail: string) => void;
}) {
  let sig = "";
  let next = "";
  return (
    <Section title="Student's Declaration" locked={locked}>
      <p className="text-sm text-gray-700 mb-2">
        I confirm I can perform the required workplace tasks to industry
        standard, independently and without additional supervision or training.
      </p>
      <SignaturePad onChange={(s) => (sig = s)} />
      <div className="grid gap-2 mt-3">
        <input
          className="border p-2 rounded"
          placeholder="Supervisor Email (next)"
          onChange={(e) => (next = e.target.value)}
          disabled={locked}
        />
        <button
          className="px-3 py-2 bg-black text-white rounded"
          onClick={() => onSign(sig, next)}
          disabled={locked}
        >
          Sign & Notify Supervisor
        </button>
      </div>
    </Section>
  );
}

/* -----------------------------
   Supervisor Declaration
----------------------------- */
export function SupervisorCard({
  locked,
  onSign,
}: {
  locked: boolean;
  onSign: (sig: string, nextEmail: string) => void;
}) {
  let sig = "";
  let next = "";
  return (
    <Section title="Supervisor's Declaration" locked={locked}>
      <p className="text-sm text-gray-700 mb-2">
        I confirm the student has consistently performed the required workplace
        tasks to industry standard, independently and without the need for
        further supervision or training.
      </p>
      <SignaturePad onChange={(s) => (sig = s)} />
      <div className="grid gap-2 mt-3">
        <input
          className="border p-2 rounded"
          placeholder="Assessor Email (next)"
          onChange={(e) => (next = e.target.value)}
          disabled={locked}
        />
        <button
          className="px-3 py-2 bg-black text-white rounded"
          onClick={() => onSign(sig, next)}
          disabled={locked}
        >
          Sign & Notify Assessor
        </button>
      </div>
    </Section>
  );
}

/* -----------------------------
   Assessor Declaration
----------------------------- */
export function AssessorDeclaration({ locked }: { locked: boolean }) {
  return (
    <Section title="Assessor's Declaration" locked={locked}>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          "Section 1: Practical Skills — Pre-Assessment & Task Observation",
          "Section 2: Knowledge Assessment",
          "Section 3: Assessor Confirmation",
          "Section 4: Practical Assessment",
        ].map((label, i) => (
          <label key={i} className="flex items-center gap-2">
            <input type="checkbox" className="accent-black" disabled={locked} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </Section>
  );
}

/* -----------------------------
   Quick Assessor Checklist
----------------------------- */
export function Checklist({ locked }: { locked: boolean }) {
  const items = [
    "Student has signed Section 1 and Section 4",
    "Workplace Supervisor has completed and signed Section 1",
    "Assessor has signed Section 3 and Section 4",
    "All parties (Student, Supervisor, Assessor) have signed declarations",
    "Training Record Book completed",
    "Results entered in TEAMS",
    "RTA completed and signed by all 3 parties",
  ];
  return (
    <Section title="Quick Assessor Checklist" locked={locked}>
      <ul className="grid gap-2">
        {items.map((t, i) => (
          <li key={i} className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 accent-black" disabled={locked} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* -----------------------------
   Outcome (C / NYC)
----------------------------- */
export function Outcome({
  locked,
  onComplete,
}: {
  locked: boolean;
  onComplete: (outcome: "C" | "NYC") => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Section
        title="Competent — If competent, provide feedback to Student after assessment."
        locked={locked}
      >
        <textarea
          className="border rounded p-2 w-full h-24"
          placeholder="Assessor feedback for Competent"
          disabled={locked}
        />
        <button
          className="mt-3 px-3 py-2 bg-black text-white rounded"
          onClick={() => onComplete("C")}
          disabled={locked}
        >
          Mark Competent & Generate PDF
        </button>
      </Section>

      <Section
        title="Not Yet Competent — If NYC, provide feedback on requirements for next assessment."
        locked={locked}
      >
        <textarea
          className="border rounded p-2 w-full h-24"
          placeholder="Assessor feedback for NYC"
          disabled={locked}
        />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input type="date" className="border p-2 rounded" disabled={locked} />
          <input className="border p-2 rounded" placeholder="Name of Assessor" disabled={locked} />
        </div>
        <button
          className="mt-3 px-3 py-2 bg-black text-white rounded"
          onClick={() => onComplete("NYC")}
          disabled={locked}
        >
          Mark NYC & Generate PDF
        </button>
      </Section>
    </div>
  );
}
