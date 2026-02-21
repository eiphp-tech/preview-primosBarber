"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  format,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  addMinutes,
  isSameMinute,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Scissors,
  UserX,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// --- CONFIGURAÇÕES E TIPOS ---
type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

interface Booking {
  id: string;
  date: string;
  status: BookingStatus;
  client: { name: string; avatar?: string; email: string };
  service: { name: string; duration: number };
}

// Dicionários de Estilos e Textos
const statusStyles: Record<BookingStatus, string> = {
  CONFIRMED:
    "bg-zinc-900/40 border-l-4 border-l-emerald-500 border-y-zinc-800 border-r-zinc-800",
  PENDING:
    "bg-zinc-900/40 border-l-4 border-l-yellow-500 border-y-zinc-800 border-r-zinc-800",
  COMPLETED: "bg-zinc-900/20 border-zinc-800 opacity-75",
  CANCELLED: "bg-zinc-900/20 border-zinc-800 opacity-60",
  NO_SHOW: "bg-zinc-900/20 border-zinc-800 opacity-60",
};

const statusBadges: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Aguardando",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  COMPLETED: {
    label: "Realizado",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  NO_SHOW: {
    label: "Não veio",
    className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
};

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reagendamento
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<string | null>(
    null,
  );
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
    new Date(),
  );
  const [rescheduleTime, setRescheduleTime] = useState<string | null>(null);
  const [existingBookingsForReschedule, setExistingBookingsForReschedule] =
    useState<Booking[]>([]);

  // Confirmação (Action)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionData, setActionData] = useState<{
    id: string;
    status: BookingStatus;
    title: string;
    desc: string;
  } | null>(null);

  // --- BUSCAR DADOS DA TELA PRINCIPAL ---
  useEffect(() => {
    fetchAppointments();
  }, [date]);

  async function fetchAppointments() {
    if (!date) return;
    setIsLoading(true);
    try {
      const start = startOfDay(date).toISOString();
      const end = endOfDay(date).toISOString();
      const response = await api.get(`/bookings?start=${start}&end=${end}`);
      setAppointments(response.data.data);
    } catch (error) {
      toast.error("Erro ao carregar agenda.");
    } finally {
      setIsLoading(false);
    }
  }

  // --- BUSCAR DADOS PARA O MODAL DE REAGENDAMENTO ---
  useEffect(() => {
    async function fetchSlots() {
      if (!isRescheduleOpen || !rescheduleDate) return;
      try {
        const start = startOfDay(rescheduleDate).toISOString();
        const end = endOfDay(rescheduleDate).toISOString();
        const response = await api.get(`/bookings?start=${start}&end=${end}`);
        setExistingBookingsForReschedule(response.data.data);
      } catch (error) {
        console.error("Erro ao buscar slots", error);
      }
    }
    fetchSlots();
  }, [rescheduleDate, isRescheduleOpen]);

  // --- GERAÇÃO DE HORÁRIOS DISPONÍVEIS ---
  const timeSlots = useMemo(() => {
    if (!rescheduleDate) return [];

    const slots = [];
    let start = setMinutes(setHours(rescheduleDate, 9), 0); // Começa 09:00
    const end = setMinutes(setHours(rescheduleDate, 20), 0); // Termina 20:00

    while (isBefore(start, end)) {
      // Verifica se existe conflito
      const isTaken = existingBookingsForReschedule.some((booking) => {
        if (booking.status === "CANCELLED" || booking.status === "NO_SHOW")
          return false;
        // Se o agendamento que estamos movendo é este mesmo, não conta como conflito
        if (booking.id === bookingToReschedule) return false;

        const bookingDate = new Date(booking.date);
        // (Idealmente verificaria intervalo de duração, mas minuto exato resolve 90%)
        return isSameMinute(bookingDate, start);
      });

      slots.push({
        time: format(start, "HH:mm"),
        date: new Date(start),
        available: !isTaken,
      });

      start = addMinutes(start, 30); // Incrementa 30 min
    }
    return slots;
  }, [rescheduleDate, existingBookingsForReschedule, bookingToReschedule]);

  // --- HANDLERS ---

  // 1. Abrir Confirmação Genérica
  function requestStatusUpdate(
    id: string,
    status: BookingStatus,
    title: string,
    desc: string,
  ) {
    setActionData({ id, status, title, desc });
    setIsConfirmOpen(true);
  }

  // 2. Confirmar Ação
  async function handleConfirmAction() {
    if (!actionData) return;
    try {
      await api.patch(`/bookings/${actionData.id}/status`, {
        status: actionData.status,
      });
      toast.success("Status atualizado!");

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === actionData.id
            ? { ...app, status: actionData.status }
            : app,
        ),
      );
      setIsConfirmOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar status.");
    }
  }

  // 3. Abrir Reagendamento
  function openReschedule(id: string) {
    setBookingToReschedule(id);
    setRescheduleDate(new Date());
    setRescheduleTime(null);
    setIsRescheduleOpen(true);
  }

  // 4. Confirmar Reagendamento
  async function handleConfirmReschedule() {
    if (!bookingToReschedule || !rescheduleDate || !rescheduleTime) return;
    try {
      const [hours, minutes] = rescheduleTime.split(":").map(Number);
      const combinedDate = setMinutes(setHours(rescheduleDate, hours), minutes);

      await api.patch(`/bookings/${bookingToReschedule}/date`, {
        date: combinedDate.toISOString(),
      });

      toast.success("Reagendado com sucesso!");
      setIsRescheduleOpen(false);
      fetchAppointments(); // Recarrega a tela principal
    } catch (error: any) {
      toast.error("Erro ao reagendar.");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[calc(100vh-100px)]">
      {/* ESQUERDA: CALENDÁRIO */}
      <div className="md:col-span-4 lg:col-span-3 space-y-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="w-full flex justify-center bg-transparent text-zinc-100"
            classNames={{
              month: "space-y-4 w-full",
              caption:
                "flex justify-center pt-1 relative items-center text-white font-bold capitalize",
              day_selected:
                "bg-white text-black hover:bg-zinc-200 focus:bg-white font-bold rounded-md",
              day_today:
                "bg-zinc-900 text-white font-bold border border-zinc-700 rounded-md",
              day: "h-9 w-9 p-0 font-normal text-zinc-300 aria-selected:opacity-100 hover:bg-zinc-800 rounded-md transition-colors",
            }}
          />
        </div>
      </div>

      {/* DIREITA: LISTA */}
      <div className="md:col-span-8 lg:col-span-9 space-y-4 md:overflow-y-auto md:pr-2 pb-10">
        <div className="flex items-center justify-between mb-2 mt-4 md:mt-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white capitalize tracking-tight">
            {date
              ? format(date, "dd 'de' MMMM", { locale: ptBR })
              : "Selecione uma data"}
          </h2>
          <span className="bg-zinc-900 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium border border-zinc-800">
            {appointments.length} agendamentos
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <p className="text-zinc-500">Nenhum agendamento para este dia.</p>
          </div>
        ) : (
          appointments.map((app) => (
            <div
              key={app.id}
              className={cn(
                "group flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl border transition-all",
                statusStyles[app.status],
              )}
            >
              {/* INFO */}
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center justify-center bg-zinc-950 border border-zinc-800 rounded-lg h-16 w-16 min-w-[4rem]">
                  <span className="text-white font-bold text-lg">
                    {format(new Date(app.date), "HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-zinc-700">
                    <AvatarImage src={app.client.avatar} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-400">
                      {app.client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {app.client.name}
                    </h3>
                    <p className="text-zinc-400 text-sm flex items-center gap-2 mt-1">
                      <Scissors className="w-3 h-3" /> {app.service.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* AÇÕES */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:ml-auto">
                {/* BADGE DE STATUS */}
                <Badge
                  className={cn("border", statusBadges[app.status].className)}
                >
                  {statusBadges[app.status].label}
                </Badge>

                {/* BOTÕES DINÂMICOS */}
                {app.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() =>
                        requestStatusUpdate(
                          app.id,
                          "CONFIRMED",
                          "Aprovar Agendamento",
                          "Deseja confirmar este horário e notificar o cliente?",
                        )
                      }
                    >
                      <Check className="w-4 h-4 mr-2" /> Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                      onClick={() => openReschedule(app.id)}
                    >
                      Reagendar
                    </Button>
                  </>
                )}

                {app.status === "CONFIRMED" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() =>
                        requestStatusUpdate(
                          app.id,
                          "COMPLETED",
                          "Finalizar Serviço",
                          "Confirmar que o serviço foi realizado e o pagamento recebido?",
                        )
                      }
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-orange-500"
                      onClick={() =>
                        requestStatusUpdate(
                          app.id,
                          "NO_SHOW",
                          "Marcar como Não Veio",
                          "Confirmar que o cliente não compareceu?",
                        )
                      }
                    >
                      <UserX className="w-4 h-4 mr-2" /> Não veio
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODAL DE REAGENDAMENTO INTELIGENTE --- */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reagendar Horário</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Selecione o novo dia e um dos horários disponíveis.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6 py-4">
            {/* Calendário */}
            <div className="border border-zinc-800 rounded-lg p-2 bg-black flex justify-center items-start h-fit">
              <Calendar
                mode="single"
                selected={rescheduleDate}
                onSelect={setRescheduleDate}
                locale={ptBR}
                className="bg-transparent text-zinc-100 p-0"
                classNames={{
                  head_cell: "text-zinc-500 w-8 text-[0.8rem]",
                  day: "h-8 w-8 text-sm hover:bg-zinc-800 rounded-md",
                  day_selected:
                    "bg-white text-black hover:bg-zinc-200 font-bold",
                  day_today: "text-white font-bold border border-zinc-700",
                }}
              />
            </div>

            {/* Lista de Horários (Grid) */}
            <div className="flex-1">
              <Label className="text-zinc-400 text-xs uppercase font-bold mb-3 block">
                Horários Livres
              </Label>
              <div className="grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                {timeSlots.map((slot, i) => (
                  <button
                    key={i}
                    disabled={!slot.available}
                    onClick={() => setRescheduleTime(slot.time)}
                    className={cn(
                      "text-sm py-2 px-1 rounded-md border transition-all",
                      !slot.available
                        ? "bg-zinc-900/50 border-zinc-900 text-zinc-700 cursor-not-allowed decoration-slice line-through"
                        : rescheduleTime === slot.time
                          ? "bg-white text-black border-white font-bold shadow-lg scale-105"
                          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800",
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRescheduleOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmReschedule}
              disabled={!rescheduleTime}
              className="bg-white text-black hover:bg-zinc-200"
            >
              Confirmar Troca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE CONFIRMAÇÃO (SEGURANÇA) --- */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px]">
          <DialogHeader>
            <div className="mx-auto bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
              <AlertTriangle className="text-yellow-500 w-6 h-6" />
            </div>
            <DialogTitle className="text-center">
              {actionData?.title}
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              {actionData?.desc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAction}
              className="bg-white text-black hover:bg-zinc-200 w-full sm:w-auto"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
