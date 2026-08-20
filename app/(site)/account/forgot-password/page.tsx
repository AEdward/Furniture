import ForgotPasswordFlow from "@/components/ForgotPasswordFlow";

export default function AccountForgotPasswordPage() {
  return (
    <div className="container-shop flex justify-center py-16">
      <ForgotPasswordFlow
        forgotApiBase="/api/account/forgot-password"
        resetApiBase="/api/account/reset-password"
        loginHref="/account/login"
      />
    </div>
  );
}
