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
    const canvas = canvasRef.current;
    if (!canvas) return;

    // init
    padRef.current = new SignaturePadLib(canvas, {
      minWidth: 0.7,
      maxWidth: 2.5,
      penColor: "black",
    });

    const emit = () => {
      // only emit if there is something drawn
      if (padRef.current && !padRef.current.isEmpty()) {
        onChange(padRef.current.toDataURL("image/png"));
      } else {
        onChange("");
      }
    };

    // use native events instead of pad.onEnd (types don’t expose it)
    const endEvents = ["mouseup", "touchend", "pointerup"] as const;
    endEvents.forEach((evt) => canvas.addEventListener(evt, emit));

    // handle resize: keep strokes
    const handleResize = () => {
      if (!canvas || !padRef.current) return;
      const data = padRef.current.toData();
      // resize canvas to container width, fixed height 160
      const width = canvas.getBoundingClientRect().width || 800;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(160 * ratio);
      canvas.style.width = "100%";
      canvas.style.height = "160px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);

      padRef.current.clear();
      if (data && data.length) padRef.current.fromData(data);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      endEvents.forEach((evt) => canvas.removeEventListener(evt, emit));
      window.removeEventListener("resize", handleResize);
      padRef.current?.off(); // safe no-op if not present
      padRef.current = null;
    };
  }, [onChange]);

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        // width/height will be set by effect for HiDPI; these are fallback
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
