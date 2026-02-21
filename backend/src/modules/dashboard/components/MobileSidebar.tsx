"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Users,
  DollarSign,
  LogOut,
  Menu, // Ícone do Hambúrguer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
  { href: "/dashboard/schedule", icon: CalendarDays, label: "Agenda" },
  { href: "/dashboard/services", icon: Scissors, label: "Serviços" },
  { href: "/dashboard/clients", icon: Users, label: "Clientes" },
  { href: "/dashboard/finance", icon: DollarSign, label: "Financeiro" },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-zinc-400 hover:text-white"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>

      {/* O Conteúdo da Gaveta */}
      <SheetContent
        side="left"
        className="w-72 bg-zinc-950 border-r-zinc-800 p-0"
      >
        <div className="h-20 flex items-center justify-center border-b border-zinc-800">
          <figure className="w-32">
            <img
              src="/logotipo.svg"
              alt="Logotipo WS Barber"
              className="w-full h-auto object-contain"
            />
          </figure>
        </div>

        {/* Links de Navegação */}
        <nav className="flex flex-col gap-1 p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)} // Fecha o menu ao clicar
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-amber-400/10 text-amber-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-amber-400" : "text-zinc-400"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer do Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          <button
            onClick={() => {
              localStorage.removeItem("barber.token");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
