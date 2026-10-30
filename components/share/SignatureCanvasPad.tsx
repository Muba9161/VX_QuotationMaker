"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";

export interface SignatureCanvasPadRef {
  getDataUrl: () => string;
  hasDrawn: () => boolean;
  clear: () => void;
}

const SignatureCanvasPad = forwardRef<SignatureCanvasPadRef, { disabled?: boolean }>(({ disabled }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useImperativeHandle(ref, () => ({
    getDataUrl: () => (canvasRef.current ? canvasRef.current.toDataURL("image/png") : ""),
    hasDrawn: () => drawn,
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDrawn(false);
    },
  }));

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e3a8a";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawn(false);
  };

  return (
    <div style={{ position: "relative", marginBottom: "16px" }}>
      <canvas
        ref={canvasRef}
        width={496}
        height={140}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          width: "100%",
          height: "140px",
          border: "2px dashed #cbd5e1",
          borderRadius: "10px",
          backgroundColor: "#f8fafc",
          cursor: disabled ? "not-allowed" : "crosshair",
          touchAction: "none",
        }}
      />
      <button
        type="button"
        onClick={handleClear}
        disabled={disabled}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          padding: "4px 10px",
          borderRadius: "6px",
          border: "1px solid #cbd5e1",
          backgroundColor: "#ffffff",
          fontSize: "11px",
          fontWeight: 600,
          color: "#64748b",
          cursor: "pointer",
        }}
      >
        Clear
      </button>
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "12px",
          fontSize: "11px",
          color: "#94a3b8",
          pointerEvents: "none",
        }}
      >
        Sign with mouse or finger inside the box
      </div>
    </div>
  );
});

SignatureCanvasPad.displayName = "SignatureCanvasPad";

export default SignatureCanvasPad;

