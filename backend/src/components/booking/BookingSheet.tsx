"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Barber {
  id: string;
  name: string;
}

interface BookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  barber: Barber | null;
}

export function BookingSheet({
  isOpen,
  onClose,
  service,
  barber,
}: BookingSheetProps) {
  const [step, setStep] = useState<"selection" | "success">("selection");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Mock time slots - in a real app, fetch availability based on date/barber
  const timeSlots = [
    "09:00",
    "09:45",
    "10:30",
    "11:15",
    "13:00",
    "13:45",
    "14:30",
    "15:15",
    "16:00",
    "16:45",
    "17:30",
    "18:15",
    "19:00",
  ];

  useEffect(() => {
    async function fetchAvailability() {
      if (!date || !barber) return;

      setLoadingAvailability(true);
      try {
        const response = await api.get("/bookings/availability", {
          params: {
            barberId: barber.id,
            date: date.toISOString(),
          },
        });

        if (response.data.success) {
          // Backend returns ISO strings of booked dates
          // We need to extract the HH:mm part to match our timeSlots
          const booked = response.data.data.map((isoDate: string) => {
            const d = new Date(isoDate);
            // Format as HH:mm locally (assuming backend stores correctly)
            // Note: Timezone handling is tricky. Backend stores UTC?
            // The simple approach: string match.
            // Let's rely on the date object methods
            const hours = d.getHours().toString().padStart(2, "0");
            const minutes = d.getMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
          });
          setBookedSlots(booked);
        }
      } catch (error) {
        console.error("Failed to fetch availability", error);
        toast.error("Erro ao verificar disponibilidade.");
      } finally {
        setLoadingAvailability(false);
      }
    }

    if (isOpen) {
      fetchAvailability();
    }
  }, [date, barber, isOpen]);

  const handleBook = async () => {
    if (!date || !selectedTime || !service || !barber) return;

    setLoading(true);
    try {
      // Create a Date object combining date and time
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const bookingDate = new Date(date);
      bookingDate.setHours(hours, minutes, 0, 0);

      // We need a userId. For now, let's assume the backend handles it via session
      // OR we need to pass a dummy ID if we are just testing UI without full auth context
      // (The user said "Cliente lá na Home...").
      // Assuming headers handle auth or we have a hardcoded user for now as per previous context issues.
      // However, `BarberPage` didn't show auth context.
      // Let's rely on api interceptors/cookies if they exist, or fail gracefully.

      const response = await api.post("/bookings", {
        barberId: barber.id,
        serviceId: service.id,
        date: bookingDate.toISOString(),
      });

      if (response.data) {
        setStep("success");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("selection");
    setSelectedTime(null);
    setBookedSlots([]);
    onClose();
  };

  if (!service) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] md:h-auto md:max-w-md md:inset-y-0 md:right-0 md:left-auto rounded-t-[20px] md:rounded-l-[20px] md:rounded-tr-none bg-[#111] border-zinc-800 text-white p-0 overflow-y-auto"
      >
        {step === "selection" ? (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b border-zinc-800 flex flex-row items-center justify-between sticky top-0 bg-[#111] z-10">
              <SheetTitle className="text-white text-lg font-bold">
                Fazer Reserva
              </SheetTitle>
              {/* Close handled by Sheet primitive usually, but we can add custom if needed */}
              <div
                onClick={handleClose}
                className="p-2 -mr-2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </div>
            </SheetHeader>

            <div className="p-6 space-y-8 flex-1">
              {/* Month/Date Selection */}
              <div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="bg-transparent text-white p-0 w-full"
                  locale={ptBR}
                  classNames={{
                    month: "space-y-4",
                    caption:
                      "flex justify-between pt-1 relative items-center px-1",
                    caption_label:
                      "text-sm font-bold text-white uppercase tracking-wider",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-7 w-7 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 p-0 hover:text-white rounded-lg flex items-center justify-center transition-colors",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full justify-between mb-2",
                    head_cell:
                      "text-zinc-500 rounded-md w-9 font-normal text-[0.8rem] capitalize",
                    row: "flex w-full mt-2 justify-between",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-zinc-800 rounded-full",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-800 rounded-full transition-colors text-zinc-300",
                    day_selected:
                      "bg-blue-400 text-black hover:bg-blue-500 hover:text-black focus:bg-blue-400 focus:text-black font-bold ring-0 ring-offset-0",
                    day_today:
                      "bg-zinc-800 text-white font-bold border border-zinc-700",
                    day_outside: "text-zinc-700 opacity-50",
                    day_disabled: "text-zinc-700 opacity-50",
                    day_hidden: "invisible",
                  }}
                />
              </div>

              {/* Time Selection */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">
                  Horários Disponíveis
                </h3>
                {loadingAvailability ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="grid grid-cols-4 gap-2 w-full">
                      {timeSlots.map((time) => {
                        const isBooked = bookedSlots.includes(time);
                        return (
                          <button
                            key={time}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(time)}
                            className={`
                            py-2 px-1 rounded-full text-xs font-bold border transition-all
                            ${
                              isBooked
                                ? "bg-zinc-900/20 border-zinc-900 text-zinc-700 cursor-not-allowed line-through"
                                : selectedTime === time
                                  ? "bg-blue-400 border-blue-400 text-black shadow-[0_0_15px_rgba(96,165,250,0.5)]"
                                  : "bg-zinc-900/50 border-zinc-800 text-gray-400 hover:border-zinc-600 hover:text-white"
                            }
                            `}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">{service.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{barber?.name}</p>
                  </div>
                  <span className="text-white font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(service.price)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-zinc-800">
                  <span>Data</span>
                  <span className="text-white">
                    {date
                      ? format(date, "dd 'de' MMMM", { locale: ptBR })
                      : "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Horário</span>
                  <span className="text-white">{selectedTime || "--:--"}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 bg-[#111]">
              <Button
                size="lg"
                className="w-full bg-blue-400 hover:bg-blue-500 text-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleBook}
                disabled={!selectedTime || !date || loading}
              >
                {loading ? "Processando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full items-center justify-center p-8 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
              <div className="bg-blue-500 p-4 rounded-full shadow-lg shadow-blue-500/30">
                <Check className="w-10 h-10 text-black" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Reserva Efetuada!
              </h2>
              <p className="text-gray-400 max-w-[250px] mx-auto">
                Sua reserva foi agendada com sucesso.
              </p>
            </div>

            <Button
              className="w-full max-w-sm bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-700 mt-8"
              onClick={handleClose}
            >
              Confirmar
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
