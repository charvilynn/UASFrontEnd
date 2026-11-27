"use client";

import React, { useState, useSyncExternalStore } from "react";
import { MousePointer, Moon, Sun } from "lucide-react";

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("charv-cursor-preference-change", callback);
  window.addEventListener("charv-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("charv-cursor-preference-change", callback);
    window.removeEventListener("charv-theme-change", callback);
  };
}

export function PreferencesClientControls() {
  const cursorEnabled = useSyncExternalStore(
    subscribeStorage,
    () => window.localStorage.getItem("charv_cursor") !== "off",
    () => true,
  );

  const isDark = useSyncExternalStore(
    subscribeStorage,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function toggleCursor(nextEnabled: boolean) {
    window.localStorage.setItem("charv_cursor", nextEnabled ? "on" : "off");
    window.dispatchEvent(new Event("charv-cursor-preference-change"));
    setStatusMessage(
      nextEnabled
        ? "Efek kursor interaktif diaktifkan."
        : "Efek kursor interaktif dinonaktifkan. Kursor standar digunakan.",
    );
  }

  function toggleTheme(nextDark: boolean) {
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("charv_theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event("charv-theme-change"));
    setStatusMessage(
      nextDark ? "Tema Ruang Baca Malam diaktifkan." : "Tema Kertas Hangat (Terang) diaktifkan.",
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-[var(--fg)]">
        Pengaturan Antarmuka & Kursor
      </h2>
      <p className="mt-1 text-xs text-[var(--fg-muted)]">
        Sesuaikan kenyamanan visual dan perilaku kursor selama menjelajahi ruang baca.
      </p>

      {statusMessage && (
        <div className="mt-4 rounded-xl border border-[#2E4A36]/25 bg-[#2E4A36]/10 px-3.5 py-2.5 text-xs font-medium text-[#2E4A36]">
          {statusMessage}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8A3B12]/15 text-[#8A3B12]">
              <MousePointer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--fg)]">
                Efek Kursor Interaktif (Titik & Cincin Halus)
              </p>
              <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                Menampilkan cincin pengikut lembut dan label &ldquo;Lihat&rdquo; saat melintasi
                sampul buku di perangkat desktop.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={cursorEnabled}
            data-testid="toggle-custom-cursor-btn"
            onClick={() => toggleCursor(!cursorEnabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
              cursorEnabled ? "bg-[#8A3B12]" : "bg-[#D8D0BC]"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                cursorEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8A3B12]/15 text-[#8A3B12]">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--fg)]">Mode Ruang Baca Malam</p>
              <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                Mengubah latar kertas hangat menjadi warna kayu gelap yang teduh di mata.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={() => toggleTheme(!isDark)}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
              isDark ? "bg-[#8A3B12]" : "bg-[#D8D0BC]"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isDark ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
