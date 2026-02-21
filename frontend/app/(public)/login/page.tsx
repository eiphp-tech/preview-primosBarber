import { LoginForm } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="h-screen w-full flex flex-col items-center justify-end overflow-hidden pb-32 lg:pb-16">
      <LoginForm />
    </main>
  );
}
