"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Users,
  DollarSign,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Definição dos itens do menu
const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/schedule", icon: CalendarDays, label: "Agendamentos" },
  { href: "/dashboard/services", icon: Scissors, label: "Serviços" }, // Link para a página que acabamos de criar
  { href: "/dashboard/clients", icon: Users, label: "Clientes" },
  { href: "/dashboard/finance", icon: DollarSign, label: "Financeiro" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 h-screen fixed left-0 top-0 z-50">
      {/* --- ÁREA DO LOGO --- */}
      <div className="h-24 flex items-center justify-center border-b border-zinc-800">
        <figure className="w-32">
          {/* Regra Obrigatória: Tag IMG apontando para o SVG na pasta public */}
          <img
            src="/logotipo.svg"
            alt="Logotipo WS Barber"
            className="w-full h-auto object-contain"
          />
        </figure>
      </div>

      {/* --- MENU DE NAVEGAÇÃO --- */}
      <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-black shadow-md" // Ativo: Branco com texto Preto
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white" // Inativo: Cinza com hover
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-black" : "text-zinc-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* --- FOOTER / LOGOUT --- */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={() => {
            localStorage.removeItem("barber.token");
            localStorage.removeItem("barber.user");
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-900 hover:text-red-400 transition-all group"
        >
          <LogOut className="h-5 w-5 group-hover:text-red-400 transition-colors" />
          Sair
        </button>
      </div>
    </aside>
  );
}
