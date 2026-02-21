"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Barber, Booking } from "@/types";
import { BarberList } from "@/components/home/BarberList";
import { NextBookingCard } from "@/components/home/NextBookingCard";
import { Navbar } from "@/components/ui/Navbar";

export default function HomePage() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [nextBooking, setNextBooking] = useState<Booking | null>(null);

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const formattedDate =
    currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  useEffect(() => {
    if (loading) return;

    async function fetchData() {
      try {
        const barbersResponse = await api.get("/users?role=BARBEIRO");
        setBarbers(barbersResponse.data.data);

        if (isAuthenticated) {
          try {
            const response = await api.get("/bookings/me");
            const upcoming = response.data.data.find(
              (b: Booking) =>
                b.status === "PENDING" || b.status === "CONFIRMED",
            );
            setNextBooking(upcoming || null);
          } catch (err) {
            console.log("Sem agendamentos");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    }

    fetchData();
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-6 pt-10 pb-20 space-y-12">
        <div className="space-y-2">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            {isAuthenticated
              ? `Olá, ${user?.name.split(" ")[0]}!`
              : "Olá, Faça seu Login!"}
          </h1>
          <p className="text-sm md:text-base text-gray-400 capitalize">
            {formattedDate}
          </p>
        </div>

        {/* BANNER */}
        <div className="w-full h-40 md:h-[320px] rounded-2xl overflow-hidden bg-zinc-900 relative border border-white/5 shadow-2xl">
          <img
            src="/image/Banner-Pizza.svg"
            alt="Banner Barber"
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
          />
        </div>

        {/* SEU AGENDAMENTO */}
        {isAuthenticated && nextBooking && (
          <NextBookingCard booking={nextBooking} />
        )}

        {/* LISTA DE BARBEIROS */}
        <BarberList barbers={barbers} isAuthenticated={isAuthenticated} />
      </main>

      <footer className="w-full border-t border-white/5 bg-black py-8 mt-auto">
        <div className="container mx-auto text-center text-xs text-gray-600">
          © 2026 Copyright WS Barber. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
