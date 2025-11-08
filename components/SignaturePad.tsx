"use client";
import { useEffect, useRef } from "react";
import SignaturePadLib from "signature_pad";

export default function SignaturePad({
  onChange,
}: {
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // Initialize signature pad
    padRef.current = new SignaturePadLib(canvasRef.current, {
      minWidth: 0.7,
      maxWidth: 2.5,
      penColor: "black",
    });

    // Capture when user finishes drawing
    padRef.current.onEnd = () => {
      const dataUrl = padRef.current?.toDataURL("image/png") || "";
      onChange(dataUrl);
    };
  }, [onChange]);

  // Handle resizing
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !padRef.current) return;
      const data = padRef.current.toData();
      canvas.width = canvas.offsetWidth;
      canvas.height = 160;
      padRef.current.clear();
      padRef.current.fromData(data);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        width={800}
        height={160}
        className="block w-full h-[160px] bg-white"
      />
      <div className="flex gap-2 p-2">
        <button
          type="button"
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
          onClick={() => {
            padRef.current?.clear();
            onChange("");
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
