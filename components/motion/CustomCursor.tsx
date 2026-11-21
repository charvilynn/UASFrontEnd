"use client";

import React, { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "link" | "cover" | "hidden";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const evaluateEnabled = () => {
      const hasFinePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const storedPref = window.localStorage.getItem("charv_cursor");
      const nextEnabled =
        hasFinePointer && !prefersReducedMotion && storedPref !== "off";
      setEnabled(nextEnabled);
    };

    evaluateEnabled();

    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    pointerQuery.addEventListener("change", evaluateEnabled);
    motionQuery.addEventListener("change", evaluateEnabled);
    window.addEventListener("storage", evaluateEnabled);
    window.addEventListener("charv-cursor-preference-change", evaluateEnabled);

    return () => {
      pointerQuery.removeEventListener("change", evaluateEnabled);
      motionQuery.removeEventListener("change", evaluateEnabled);
      window.removeEventListener("storage", evaluateEnabled);
      window.removeEventListener(
        "charv-cursor-preference-change",
        evaluateEnabled
      );
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("charv-cursor-enabled");
      return;
    }

    document.documentElement.classList.add("charv-cursor-enabled");

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let visible = false;
    let pressed = false;
    let mode: CursorMode = "default";
    let rafId = 0;

    const applyVisualState = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;
      if (!dot || !ring || !label) return;

      if (!visible || mode === "hidden") {
        dot.style.opacity = "0";
        ring.style.opacity = "0";
        return;
      }

      if (mode === "cover") {
        dot.style.opacity = "0";
        ring.style.opacity = "1";
        ring.style.width = pressed ? "60px" : "66px";
        ring.style.height = pressed ? "26px" : "28px";
        ring.style.borderRadius = "9999px";
        ring.style.backgroundColor = "rgba(24, 19, 14, 0.92)";
        ring.style.borderColor = "rgba(251, 248, 242, 0.35)";
        label.style.opacity = "1";
      } else if (mode === "link") {
        dot.style.opacity = "1";
        dot.style.width = "6px";
        dot.style.height = "6px";
        ring.style.opacity = "1";
        ring.style.width = pressed ? "42px" : "50px";
        ring.style.height = pressed ? "42px" : "50px";
        ring.style.borderRadius = "9999px";
        ring.style.backgroundColor = "rgba(138, 59, 18, 0.14)";
        ring.style.borderColor = "rgba(138, 59, 18, 0.42)";
        label.style.opacity = "0";
      } else {
        dot.style.opacity = "1";
        dot.style.width = pressed ? "6px" : "7px";
        dot.style.height = pressed ? "6px" : "7px";
        ring.style.opacity = "1";
        ring.style.width = pressed ? "28px" : "34px";
        ring.style.height = pressed ? "28px" : "34px";
        ring.style.borderRadius = "9999px";
        ring.style.backgroundColor = "rgba(138, 59, 18, 0.08)";
        ring.style.borderColor = "rgba(138, 59, 18, 0.30)";
        label.style.opacity = "0";
      }
    };

    const detectModeFromTarget = (el: Element | null): CursorMode => {
      if (!el) return "default";
      if (
        el.closest(
          'input, textarea, select, [contenteditable="true"], [data-cursor="native"]'
        )
      ) {
        return "hidden";
      }
      if (el.closest('[data-cursor="cover"]')) {
        return "cover";
      }
      if (
        el.closest(
          'a, button, [role="button"], summary, label, [data-cursor="link"]'
        )
      ) {
        return "link";
      }
      return "default";
    };

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        currentX = targetX;
        currentY = targetY;
        visible = true;
      }

      const nextMode = detectModeFromTarget(e.target as Element | null);
      if (nextMode !== mode) {
        mode = nextMode;
        if (mode === "hidden") {
          document.documentElement.classList.remove("charv-cursor-enabled");
        } else {
          document.documentElement.classList.add("charv-cursor-enabled");
        }
      }
      applyVisualState();
    };

    const onMouseDown = () => {
      pressed = true;
      applyVisualState();
    };

    const onMouseUp = () => {
      pressed = false;
      applyVisualState();
    };

    const onMouseLeaveWindow = () => {
      visible = false;
      applyVisualState();
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveWindow, {
      passive: true,
    });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeaveWindow);
      window.cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("charv-cursor-enabled");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="custom-cursor-layer"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: "var(--z-cursor, 70)" }}
    >
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 flex items-center justify-center border transition-[width,height,background-color,border-color,opacity] duration-150 ease-out"
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "9999px",
          opacity: 0,
          backgroundColor: "rgba(138, 59, 18, 0.08)",
          borderColor: "rgba(138, 59, 18, 0.30)",
          willChange: "transform",
        }}
      >
        <span
          ref={labelRef}
          className="text-[11px] font-semibold tracking-wide text-[#FBF8F2] transition-opacity duration-150"
          style={{ opacity: 0 }}
        >
          Lihat
        </span>
      </div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 rounded-full bg-[#8A3B12] transition-[width,height,opacity] duration-100 ease-out"
        style={{
          width: "7px",
          height: "7px",
          opacity: 0,
          willChange: "transform",
        }}
      />
    </div>
  );
}
