"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { requestPasswordResetOtpAction } from "@/features/auth/actions";

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
      </div>
    </div>
  );
}
