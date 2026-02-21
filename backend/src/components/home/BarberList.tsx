"use client";

import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Barber } from "@/types";

interface BarberListProps {
  barbers: Barber[];
  isAuthenticated: boolean;
}

export function BarberList({ barbers, isAuthenticated }: BarberListProps) {
  return (
    <section>
      <h3 className="text-sm font-bold text-gray-500 mb-5 uppercase tracking-wider">
        Nossos Profissionais
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {barbers.map((barber) => (
          <Card
            key={barber.id}
            className="bg-[#1F1F23] w-full pt-0 pb-1 border border-white/5 text-white overflow-hidden hover:border-zinc-400/50 transition-all duration-300 group flex flex-col h-full"
          >
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-800">
              {barber.avatar ? (
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900">
                  <UserIcon size={48} />
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
              <div>
                <h4 className="font-bold text-sm md:text-base text-white truncate">
                  {barber.name}
                </h4>
                <p className="text-xs text-gray-500 truncate mt-1">
                  Barbeiro Profissional
                </p>
              </div>
              <Link
                href={`/barbers/${barber.id}`}
                className="w-full block"
              >
                <Button
                  variant="secondary"
                  className="w-full bg-[#26262B] hover:bg-zinc-600 hover:text-white text-gray-300 font-semibold h-9 text-xs border border-white/5 transition-all"
                >
                  Reservar
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="mt-16 flex justify-center">
          <div className="text-center max-w-md w-full bg-[#1F1F23] p-8 rounded-2xl border border-white/5 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Acesse sua conta
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Faça login para agendar seu horário.
            </p>
            <Link href="/login">
              <Button className="w-full bg-zinc-600 hover:bg-zinc-700 font-bold py-6 text-base shadow-lg shadow-zinc-600/20">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
