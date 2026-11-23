import React from "react";
import { ResetPasswordFlowClient } from "./ResetPasswordFlowClient";

interface ForgotPasswordPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const initialEmail = (params.email || "").trim();

  return (
    <div className="flex min-h-[calc(100vh-var(--nav-h,64px)-140px)] items-center justify-center px-4 py-12">
      <ResetPasswordFlowClient initialEmail={initialEmail} />
    </div>
  );
}
