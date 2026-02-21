"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, LogOut, X, Home } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-4 fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          {/* Mobile Logo or Name */}
          <span className="font-bold text-white text-lg">WS Barber</span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{user?.name}</span>
                    <span className="text-xs text-gray-500">Cliente</span>
                  </div>
                </div>

                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
                >
                  <Home className="w-4 h-4" />
                  Início
                </Link>

                <Link
                  href="/appointments"
                  className="flex items-center gap-2 text-gray-300 hover:text-white py-2"
                >
                  <Calendar className="w-4 h-4" />
                  Agendamentos
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 py-2 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link href="/login" className="w-full">
                <Button className="w-full bg-white text-black hover:bg-gray-200">
                  Fazer Login
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP HEADER */}
      <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-zinc-900/10 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-12 flex-1">
          <Link href="/">
            <img
              src="/logotipo.svg"
              alt="WS Barber"
              className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        <div className="flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors group"
              >
                <div className="w-5 h-5 flex items-center justify-center group-hover:text-primary transition-colors">
                  <Home className="w-5 h-5" />
                </div>
                <span>Início</span>
              </Link>

              <Link
                href="/appointments"
                className="flex items-center gap-2 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors group"
              >
                <Calendar className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span>Agendamentos</span>
              </Link>

              <div className="flex items-center gap-4 pl-4 border-l border-white/5">
                <div className="flex items-center gap-3 cursor-pointer group">
                  <Avatar className="h-9 w-9 border border-white/10 group-hover:border-white/30 transition-colors">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-400">
                      {user?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white group-hover:text-gray-200 transition-colors">
                    {user?.name}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-gray-200 font-semibold">
                Fazer Login
              </Button>
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
