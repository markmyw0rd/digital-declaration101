"use client";
import { useEffect, useRef } from "react";
import SignaturePadLib from "signature_pad";

export default function SignaturePad({ onChange }:{ onChange:(dataUrl:string)=>void }){
  const ref = useRef<HTMLCanvasElement|null>(null);
  const padRef = useRef<SignaturePadLib|null>(null);

  useEffect(()=>{
    if (!ref.current) return;
    padRef.current = new SignaturePadLib(ref.current, { minWidth: 0.7, maxWidth: 2.5 });
    const onEnd = ()=> onChange(padRef.current!.toDataURL("image/png"));
    padRef.current.onEnd = onEnd;
  },[onChange]);

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <canvas ref={ref} width={800} height={160} className="block w-full h-[160px] bg-white"/>
      <div className="flex gap-2 p-2">
        <button className="px-3 py-1 border rounded" onClick={()=>{ padRef.current?.clear(); onChange(""); }}>Clear</button>
      </div>
    </div>
  );
}
