import Logo from "@/components/Logo";
import ForgotPasswordFlow from "@/components/ForgotPasswordFlow";

export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="mb-8">
        <Logo variant="stacked" />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-walnut-100 bg-white/60 p-8">
        <ForgotPasswordFlow
          forgotApiBase="/api/admin/forgot-password"
          resetApiBase="/api/admin/reset-password"
          loginHref="/portal2026/login"
          title="Reset admin password"
        />
      </div>
    </div>
  );
}
