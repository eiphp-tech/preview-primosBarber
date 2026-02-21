import { RegisterForm } from "@/modules/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="h-screen w-full flex flex-col items-center justify-end overflow-hidden pb-28 lg:pb-0 lg:justify-center">
      <RegisterForm />
    </main>
  );
}
