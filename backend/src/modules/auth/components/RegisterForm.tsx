"use client";

import { useForm, Controller } from "react-hook-form"; // <--- Importe Controller
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InputPhone } from "@/components/ui/InputPhone"; // <--- Importe o Componente Novo

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Digite um e-mail válido"),
  phone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "+55",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      toast.success("Conta criada com sucesso!");
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Erro ao criar conta.";
      toast.error(msg);
    }
  }

  return (
    <div className="w-full max-w-96 mx-auto px-6 sm:px-0">
      <header className="flex flex-col items-center justify-center text-center">
        <figure className="w-24 sm:w-28 mb-6">
          <img src="/logotipo.svg" alt="Logotipo" className="w-full h-auto" />
        </figure>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Crie sua conta
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 mt-2">
          Junte-se à Primos Barber
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 mt-8"
      >
        {/* Input Nome */}
        <div className="space-y-1">
          <input
            {...register("name")}
            type="text"
            placeholder="Nome completo"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neutral-200/50 focus:ring-1 focus:ring-neutral-200/50 transition-all text-sm sm:text-base"
          />
          {errors.name && (
            <span className="text-xs text-red-400 ml-1">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Input Email */}
        <div className="space-y-1">
          <input
            {...register("email")}
            type="email"
            placeholder="Seu melhor e-mail"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neutral-200/50 focus:ring-1 focus:ring-neutral-200/50 transition-all text-sm sm:text-base"
          />
          {errors.email && (
            <span className="text-xs text-red-400 ml-1">
              {errors.email.message}
            </span>
          )}
        </div>

        <Controller
          name="phone"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputPhone
              value={value}
              onChange={onChange}
              error={errors.phone?.message}
            />
          )}
        />

        {/* Input Senha */}
        <div className="space-y-1">
          <input
            {...register("password")}
            type="password"
            placeholder="Crie uma senha segura"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neutral-200/50 focus:ring-1 focus:ring-neutral-200/50 transition-all text-sm sm:text-base"
          />
          {errors.password && (
            <span className="text-xs text-red-400 ml-1">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-base bg-neutral-300 hover:bg-white font-bold text-black rounded-xl py-3.5 mt-2 flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin text-black" />
          ) : (
            "Criar Conta"
          )}
        </button>

        <div className="mt-4 lg:mt-0.5 text-center text-sm text-zinc-400">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-white hover:underline font-bold ml-1 transition-colors"
          >
            Fazer login
          </Link>
        </div>
      </form>
    </div>
  );
}
