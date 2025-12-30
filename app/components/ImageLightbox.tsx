"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastRef = useRef({ x: 0, y: 0 });

  // Portal container to ensure the lightbox overlays everything
  const portalRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('data-image-lightbox', 'true');
    portalRef.current = el;
    document.body.appendChild(el);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      if (portalRef.current && portalRef.current.parentElement) portalRef.current.parentElement.removeChild(portalRef.current);
      portalRef.current = null;
    };
  }, []);

  // Preload images
  useEffect(() => {
    images.forEach((src) => {
      const i = new Image();
      i.src = src;
    });
  }, [images]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, images.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  useEffect(() => {
    // Reset pan/zoom when image changes
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [index]);

  const clamp = (v: number, a = 1, b = 4) => Math.max(a, Math.min(b, v));

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY / 500; // smaller sensitivity
    const next = clamp(scale + delta, 1, 4);
    setScale(next);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsPanning(true);
    lastRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    if (scale <= 1) {
      setScale(2);
      // center to click position (approx)
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        setOffset({ x: -cx, y: -cy });
      }
    } else {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  };

  // simple touch pinch handling
  const pinchRef = useRef<{ id1?: number; id2?: number; startDist?: number; startScale?: number } | undefined>(undefined);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      pinchRef.current = { id1: a.identifier, id2: b.identifier, startDist: distance(a, b), startScale: scale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (pinchRef.current && e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = distance(a, b);
      const delta = (d / (pinchRef.current.startDist || d)) * (pinchRef.current.startScale || scale);
      setScale(clamp(delta, 1, 4));
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (pinchRef.current && e.touches.length < 2) pinchRef.current = undefined;
  };

  function distance(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  if (!portalRef.current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute top-4 right-4 text-white z-60">
        <button
          className="bg-white/10 hover:bg-white/20 rounded-md p-3 w-10 h-10 flex items-center justify-center shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close zoom"
        >
          ×
        </button>
      </div>

      <div className="absolute top-4 left-4 text-white z-60 select-none">{index + 1}/{images.length}</div>

      <div
        ref={containerRef}
        className="relative w-[70vw] md:w-[60vw] max-w-[900px] h-[70vw] md:h-[60vw] max-h-[900px] overflow-visible touch-none flex items-center justify-center rounded-md p-6"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()} // prevent closing when interacting
      >
        <img
          src={images[index]}
          alt={`Image ${index + 1}`}
          style={{ width: '100%', height: '100%', transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transition: isPanning ? "none" : "transform 220ms" }}
          className="object-contain block m-auto cursor-grab"
          draggable={false}
        />

        {/* Prev / Next */}
        <button
          className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 z-60 rounded-full bg-black/60 p-3 text-2xl text-white shadow-lg w-12 h-12 flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); setIndex((i) => Math.max(0, i - 1)); }}
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          className="absolute -right-12 md:-right-16 top-1/2 -translate-y-1/2 z-60 rounded-full bg-black/60 p-3 text-2xl text-white shadow-lg w-12 h-12 flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); setIndex((i) => Math.min(images.length - 1, i + 1)); }}
          aria-label="Next image"
        >
          ›
        </button>
      </div>
    </div>,
    portalRef.current
  );
}
