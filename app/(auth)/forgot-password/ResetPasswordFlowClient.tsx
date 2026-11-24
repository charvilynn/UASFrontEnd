"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import {
  requestPasswordResetOtpAction,
  verifyPasswordResetOtpAction,
} from "@/features/auth/actions";

interface ResetPasswordFlowClientProps {
  initialEmail?: string;
}

export function ResetPasswordFlowClient({ initialEmail = "" }: ResetPasswordFlowClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);

  const [publicNotice, setPublicNotice] = useState<string | null>(null);
  const [simulationCode, setSimulationCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isPending, startTransition] = useTransition();

  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === 2) {
      window.setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 60);
    }
  }, [step]);

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await requestPasswordResetOtpAction(email);
      if (!res.ok) {
        setErrorMessage(res.error || "Gagal mengirim kode verifikasi.");
        return;
      }
      setPublicNotice(res.message || "Jika email terdaftar, kode sudah dikirim.");
      setSimulationCode(res.simulationCode ?? null);
      setDigits(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setStep(2);
    });
  }

  function handleResendOtp() {
    if (resendCooldown > 0 || isPending) return;
    setErrorMessage(null);

    startTransition(async () => {
      const res = await requestPasswordResetOtpAction(email);
      if (!res.ok) {
        setErrorMessage(res.error || "Gagal mengirim ulang kode.");
        return;
      }
      setPublicNotice("Jika email terdaftar, kode baru sudah dikirim.");
      setSimulationCode(res.simulationCode ?? null);
      setDigits(["", "", "", "", "", ""]);
      setResendCooldown(60);
      otpInputRefs.current[0]?.focus();
    });
  }

  function handleDigitChange(index: number, rawValue: string) {
    const cleaned = rawValue.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    if (cleaned.length > 1) {
      const next = [...digits];
      for (let i = 0; i < 6; i++) {
        if (index + i < 6 && cleaned[i]) {
          next[index + i] = cleaned[i];
        }
      }
      setDigits(next);
      const focusIdx = Math.min(5, index + cleaned.length);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleaned[0];
    setDigits(next);

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        otpInputRefs.current[index - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const focusIdx = Math.min(5, pasted.length - 1);
    otpInputRefs.current[focusIdx]?.focus();
  }

  function fillSimulationCode() {
    if (!simulationCode) return;
    const next = simulationCode.slice(0, 6).split("");
    while (next.length < 6) next.push("");
    setDigits(next);
    otpInputRefs.current[5]?.focus();
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    const combinedCode = digits.join("");
    if (combinedCode.length !== 6) {
      setErrorMessage("Masukkan 6 angka kode verifikasi.");
      return;
    }

    startTransition(async () => {
      const res = await verifyPasswordResetOtpAction(email, combinedCode);
      if (!res.ok) {
        setErrorMessage(res.error || "Kode OTP tidak sesuai.");
        return;
      }
      setStep(3);
    });
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-[#E5DEC9] bg-[#F7F2E7] p-7 shadow-sm sm:p-9">
        <div className="mb-6 flex items-center justify-between text-xs font-medium text-[#5A5044]">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => {
              const isActive = step === num;
              const isDone = step > num;
              return (
                <span
                  key={num}
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#8A3B12] text-white"
                      : isDone
                        ? "bg-[#2E4A36] text-white"
                        : "border border-[#D8D0BC] bg-[#FBF8F2] text-[#8A7E6E]"
                  }`}
                >
                  {isDone ? "✓" : num}
                </span>
              );
            })}
          </div>
          <span className="text-[#8A7E6E]">Langkah {step} dari 3</span>
        </div>

        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#18130E]">
          Reset Password
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#5A5044]">
          {step === 1 && "Masukkan email akun Anda untuk menerima kode 6 digit."}
          {step === 2 && `Masukkan 6 angka kode verifikasi untuk ${email}. Berlaku 10 menit.`}
          {step === 3 && "Buat password baru minimal 8 karakter untuk mengamankan akun Anda."}
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-[#9E2A2B]/30 bg-[#9E2A2B]/10 px-4 py-3 text-xs font-medium text-[#9E2A2B]"
          >
            {errorMessage}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="mb-1.5 block text-xs font-semibold text-[#18130E]"
              >
                Email Akun
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7E6E]" />
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@untar.ac.id"
                  className="w-full rounded-xl border border-[#D8D0BC] bg-[#FBF8F2] py-2.5 pl-10 pr-4 text-sm text-[#18130E] placeholder:text-[#8A7E6E] focus:border-[#8A3B12] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              data-testid="reset-send-otp-btn"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8A3B12] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#722F0D] disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              {isPending ? "Mengirim Kode..." : "Kirim Kode"}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A5044] hover:text-[#18130E]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali ke halaman Masuk
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="mt-5 space-y-5">
            {publicNotice && (
              <div className="flex items-center gap-2 rounded-xl border border-[#2E4A36]/25 bg-[#2E4A36]/10 px-3.5 py-2.5 text-xs text-[#2E4A36]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{publicNotice}</span>
              </div>
            )}

            {simulationCode && (
              <div
                data-testid="otp-simulation-banner"
                className="flex items-center justify-between gap-3 rounded-xl border border-[#B26700]/30 bg-[#B26700]/10 px-3.5 py-2.5 text-xs text-[#18130E]"
              >
                <span>
                  Mode simulasi: kode Anda{" "}
                  <strong className="font-mono text-sm font-bold text-[#8A3B12]">
                    {simulationCode}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={fillSimulationCode}
                  className="shrink-0 rounded-lg bg-[#8A3B12]/15 px-2.5 py-1 text-[11px] font-semibold text-[#8A3B12] hover:bg-[#8A3B12]/25"
                >
                  Isi Kode
                </button>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#18130E]">
                Kode OTP 6 Digit
              </label>
              <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={6}
                    value={digit}
                    aria-label={`Digit OTP ke-${index + 1}`}
                    data-testid={`otp-box-${index}`}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="h-12 w-full rounded-xl border border-[#D8D0BC] bg-[#FBF8F2] text-center font-mono text-lg font-semibold text-[#18130E] focus:border-[#8A3B12] focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              data-testid="reset-verify-otp-btn"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8A3B12] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#722F0D] disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {isPending ? "Memverifikasi..." : "Verifikasi Kode"}
            </button>

            <div className="flex items-center justify-between pt-1 text-xs text-[#5A5044]">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setStep(1);
                }}
                data-testid="reset-change-email-btn"
                className="inline-flex items-center gap-1 font-medium text-[#5A5044] hover:text-[#18130E]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Ganti email
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isPending}
                onClick={handleResendOtp}
                className="inline-flex items-center gap-1 font-medium text-[#8A3B12] hover:underline disabled:text-[#8A7E6E] disabled:no-underline"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}d)` : "Kirim ulang kode"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
