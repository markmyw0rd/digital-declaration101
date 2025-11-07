import { redirect } from "next/navigation";

export default async function Start({ searchParams }: any){
  const body = {
    unitCode: searchParams.u,
    unitName: searchParams.un || searchParams.u,
    studentEmail: searchParams.student,
    studentName: searchParams.name,
    supervisorEmail: searchParams.sup,
    assessorEmail: searchParams.assess
  };
  const res = await fetch(`${process.env.APP_URL}/api/envelopes`,{
    method:"POST", body: JSON.stringify(body), cache:"no-store"
  });
  const j = await res.json();
  redirect(j.next);
}
