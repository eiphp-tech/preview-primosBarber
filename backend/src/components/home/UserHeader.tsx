"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface User {
  name: string;
  avatar?: string;
  role: string | "BARBEIRO" | "CLIENTE";
}

interface UserHeaderProps {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function UserHeader({
  user,
  isAuthenticated,
  logout,
  isMenuOpen,
  setIsMenuOpen,
}: UserHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        <>
          {/* INFO DO USUÁRIO (Sempre visível se logado) */}
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-white">{user?.name.split(" ")[0]}</p>
              <p className="text-[10px] text-gray-500">Cliente</p>
            </div>
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">
                {user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* --- VERSÃO DESKTOP (MD+) --- */}
          <div className="hidden md:block border-l border-white/10 pl-4 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-400 hover:text-red-400 hover:bg-white/5"
              title="Sair"
            >
              <LogOut size={20} />
            </Button>
          </div>

          {/* --- VERSÃO MOBILE (MD-) --- */}
          <div className="relative md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>

            {/* Menu Dropdown (Só Mobile) */}
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-[#1F1F23] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-white/5 mb-2">
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                >
                  <LogOut size={16} /> Sair da conta
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        // SE NÃO ESTIVER LOGADO (Visitante)
        <Link href="/login">
          <Button className="bg-zinc-600 hover:bg-[#6c47ff] font-bold text-xs md:text-sm h-9 md:h-10">
            Fazer Login
          </Button>
        </Link>
      )}
    </div>
  );
}
