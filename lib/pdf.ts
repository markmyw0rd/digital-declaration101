import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function drawBox(page:any, x:number,y:number,w:number,h:number){
  page.drawRectangle({ x, y, width:w, height:h, borderColor: rgb(0,0,0), borderWidth: 0.8 });
}

export async function buildPdf(data:any){
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const t = (text:string,x:number,y:number,size=10,f=font)=>page.drawText(text,{x,y,size,font:f,color:rgb(0,0,0)});

  // Header
  t("ALLORA COLLEGE", 30, 810, 12, bold);
  t("AURTTE104: Inspect and Service Engines", 30, 792, 12, bold);
  t("Workplace Competency Declaration", 30, 778, 10);
  t(`Date: ${new Date().toLocaleDateString()}`, 470, 810, 9);

  // Purpose
  drawBox(page, 30, 640, 535, 120);
  t("Purpose of this document", 36, 742, 11, bold);
  t("This document confirms the apprentice/student has demonstrated the required skills...",36,728,9);

  // Assessment confirmation
  drawBox(page, 30, 560, 535, 70);
  t("Assessment Confirmation (Assessor)", 36, 620, 11, bold);
  t("Assessor Signature:", 36, 600, 10, bold);

  // Declarations
  drawBox(page, 30, 410, 260, 140);
  drawBox(page, 305, 410, 260, 140);
  t("Student's Declaration", 36, 540, 11, bold);
  t("I confirm I can perform workplace tasks to industry standard...", 36, 526, 9);
  t("Signature:", 36, 512, 10, bold);
  t("Name & Date:", 36, 430, 10, bold);

  t("Supervisor's Declaration", 311, 540, 11, bold);
  t("I confirm the student has consistently performed the required tasks...", 311, 526, 9);
  t("Signature:", 311, 512, 10, bold);
  t("Name & Date:", 311, 430, 10, bold);

  // Assessor declaration
  drawBox(page, 30, 320, 535, 80);
  t("Assessor's Declaration", 36, 392, 11, bold);
  t("Section 1: Practical Skills — Pre-Assessment & Task Observation", 36, 376, 9);
  t("Section 2: Knowledge Assessment • Section 3: Assessor Confirmation • Section 4: Practical Assessment", 36, 364, 9);

  // Checklist
  drawBox(page, 30, 200, 535, 120);
  t("Quick Assessor Checklist", 36, 314, 11, bold);
  const checks = [
    "Student has signed Section 1 and Section 4",
    "Workplace Supervisor has completed and signed Section 1",
    "Assessor has signed Section 3 and Section 4",
    "All parties have signed the relevant declarations",
    "Training Record Book completed",
    "Results entered in TEAMS",
    "RTA completed and signed by all 3 parties",
  ];
  let y = 296;
  for (const c of checks){ t("□ " + c, 36, y, 9); y -= 14; }

  // Outcome
  drawBox(page, 30, 90, 260, 100);
  drawBox(page, 305, 90, 260, 100);
  t("Outcome (tick one)", 36, 184, 10, bold);
  t("Competent — If competent, provide feedback to Student after assessment.", 36, 162, 9);
  t("Not Yet Competent — If NYC, provide feedback on requirements for next assessment.", 311, 162, 9);

  // Footer
  t("© Allora College — Workplace Training and Assessment | AURTTE104 Declaration", 30, 60, 9);

  return await doc.save();
}
