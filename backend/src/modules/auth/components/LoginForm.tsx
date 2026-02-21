"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// 1. Schema de Validação
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth(); // Pegamos a função login do contexto

  // 2. Inicializando o React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 3. Função de envio (Só é chamada se a validação passar)
  async function handleSignIn(data: LoginFormData) {
    try {
      // Faz o POST para o backend
      const response = await api.post("/auth/login", data);

      // Pega o token e usuário da resposta
      // OBS: Ajuste aqui se sua API retornar direto response.data
      const { token, user } = response.data.data || response.data;

      // Chama o login do contexto (Ele salva cookies e redireciona)
      login(token, user);

      toast.success("Bem-vindo de volta!");
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Erro ao fazer login.";
      toast.error(errorMessage);
    }
  }

  return (
    <div className="w-full max-w-96 mx-auto px-6 sm:px-0">
      <header className="flex flex-col items-center justify-center text-center">
        <figure className="w-32 sm:w-36 mb-6">
          <img
            src="/logotipo.svg" // Certifique-se que essa imagem existe em public/
            alt="Logotipo da Barbearia Primos Barber"
            className="w-full h-auto"
          />
        </figure>

        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Bem-vindo de volta
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 mt-2">
          Faça login na sua conta
        </p>
      </header>

      <form
        onSubmit={handleSubmit(handleSignIn)}
        className="flex flex-col gap-4 mt-8 sm:mt-10"
      >
        {/* Campo E-mail */}
        <div className="space-y-1">
          <input
            {...register("email")}
            type="email"
            placeholder="Digite seu e-mail"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neutral-200/50 focus:ring-1 focus:ring-neutral-200/50 transition-all text-sm sm:text-base"
          />
          {errors.email && (
            <span className="text-xs text-red-400 ml-1">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Campo Senha */}
        <div className="space-y-3">
          <div className="space-y-1">
            <input
              {...register("password")}
              type="password"
              placeholder="Digite sua senha"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neutral-200/50 focus:ring-1 focus:ring-neutral-200/50 transition-all text-sm sm:text-base"
            />
            {errors.password && (
              <span className="text-xs text-red-400 ml-1">
                {errors.password.message}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-base bg-neutral-300 hover:bg-white font-bold text-black rounded-xl py-3.5 mt-2 flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin text-black" />
          ) : (
            "Entrar"
          )}
        </button>

        <div className="mt-4 text-center text-sm text-zinc-400">
          Ainda não é parceiro?{" "}
          <Link
            href="/register"
            className="text-white hover:underline font-bold ml-1 transition-colors"
          >
            Cadastre-se
          </Link>
        </div>
      </form>
    </div>
  );
}
