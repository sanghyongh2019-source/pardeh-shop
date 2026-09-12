"use client";

import { useRef, useState } from "react";
import { Move } from "lucide-react";

export default function CompareSlider({
  beforeSrc,
  afterSrc,
}: {
  beforeSrc: string;
  afterSrc: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function updatePos(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, pct)));
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden select-none border"
      style={{ borderColor: "var(--line-dark)" }}
      onMouseMove={(e) => dragging.current && updatePos(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchMove={(e) => updatePos(e.touches[0].clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={beforeSrc} alt="قبل" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterSrc} alt="بعد" className="absolute inset-0 h-full object-cover" style={{ width: `${(100 / pos) * 100}%`, maxWidth: "none" }} />
      </div>

      <div
        className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
        style={{ right: `${100 - pos}%`, transform: "translateX(50%)" }}
        onMouseDown={() => (dragging.current = true)}
        onTouchStart={() => (dragging.current = true)}
      >
        <div className="w-0.5 h-full absolute" style={{ background: "var(--brass)" }} />
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--brass)", color: "var(--ink)" }}
        >
          <Move size={16} />
        </div>
      </div>

      <span className="absolute bottom-3 right-3 text-[11px] px-2 py-1 rounded-sm" style={{ background: "rgba(30,26,22,.65)", color: "var(--cream)" }}>
        قبل
      </span>
      <span className="absolute bottom-3 left-3 text-[11px] px-2 py-1 rounded-sm" style={{ background: "rgba(30,26,22,.65)", color: "var(--cream)" }}>
        بعد
      </span>
    </div>
  );
}
