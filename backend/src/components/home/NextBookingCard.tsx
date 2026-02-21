"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Booking } from "@/types";

interface NextBookingCardProps {
  booking: Booking;
}

export function NextBookingCard({ booking }: NextBookingCardProps) {
  return (
    <section>
      <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
        Seu Agendamento
      </h3>
      <div className="max-w-3xl">
        <Card className="bg-[#1F1F23] border border-white/5 text-white relative overflow-hidden shadow-lg">
          <CardContent className="p-0 flex">
            <div className="flex-1 p-6 flex flex-col justify-between gap-4">
              <div>
                <Badge className="bg-[#221C3D] text-zinc-600 border-none px-3 py-1 mb-2">
                  Confirmado
                </Badge>
                <h4 className="font-bold text-xl md:text-2xl text-white">
                  {booking.service.name}
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={booking.barber.avatar} />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-300">
                  {booking.barber.name}
                </span>
              </div>
            </div>
            <div className="w-28 border-l border-white/5 flex flex-col items-center justify-center p-4 bg-[#26262B]">
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                {format(new Date(booking.date), "MMM", {
                  locale: ptBR,
                })}
              </p>
              <p className="text-3xl font-bold text-white my-1">
                {format(new Date(booking.date), "dd")}
              </p>
              <p className="text-xs text-gray-400">
                {format(new Date(booking.date), "HH:mm")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
