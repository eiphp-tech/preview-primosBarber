"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import {
  format,
  isAfter,
  isBefore,
  parseISO,
  isSameDay,
  addHours,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  Scissors,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";

// --- TYPES ---
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
  service: {
    name: string;
    price: number;
    duration: number;
  };
  barber: {
    name: string;
    avatar?: string;
  };
}

// --- CONSTANTS ---
const statusConfig: Record<
  BookingStatus,
  { label: string; className: string; icon: any }
> = {
  PENDING: {
    label: "Pendente",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Aprovado",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "Concluído",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
  NO_SHOW: {
    label: "Não Compareceu",
    className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    icon: AlertCircle,
  },
};

export default function AppointmentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/appointments");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  async function fetchBookings() {
    try {
      setIsLoading(true);
      const { data } = await api.get("/bookings");
      // The API returns { success: true, data: [...] }
      setBookings(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      toast.error("Não foi possível carregar seus agendamentos.");
    } finally {
      setIsLoading(false);
    }
  }

  // Filter Logic
  const upcomingBookings = bookings
    .filter((b) => ["PENDING", "CONFIRMED"].includes(b.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const historyBookings = bookings
    .filter((b) => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(b.status))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-0 bg-black text-white selection:bg-white/20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
            Meus Agendamentos
          </h1>
          <p className="text-zinc-400 text-lg">
            Gerencie seus horários e histórico de cortes.
          </p>
        </header>

        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 rounded-full w-full max-w-md mx-auto md:mx-0 grid grid-cols-2">
            <TabsTrigger
              value="upcoming"
              className="text-zinc-500 rounded-full data-[state=active]:bg-white data-[state=active]:text-black transition-all"
            >
              Próximos
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-zinc-500 rounded-full data-[state=active]:bg-white data-[state=active]:text-black transition-all"
            >
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* UPCOMING CONTENT */}
          <TabsContent
            value="upcoming"
            className="space-y-6 focus-visible:ring-0"
          >
            {isLoading ? (
              <AppointmentsSkeleton />
            ) : upcomingBookings.length > 0 ? (
              <div className="grid gap-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isUpcoming />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Tudo certo por aqui!"
                description="Você não tem agendamentos futuros."
                actionLabel="Agendar Novo Corte"
                actionLink="/"
              />
            )}
          </TabsContent>

          {/* HISTORY CONTENT */}
          <TabsContent
            value="history"
            className="space-y-6 focus-visible:ring-0"
          >
            {isLoading ? (
              <AppointmentsSkeleton />
            ) : historyBookings.length > 0 ? (
              <div className="grid gap-4">
                {historyBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Histórico vazio"
                description="Seus agendamentos anteriores aparecerão aqui."
                icon={History}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function BookingCard({
  booking,
  isUpcoming = false,
}: {
  booking: Booking;
  isUpcoming?: boolean;
}) {
  const status = statusConfig[booking.status];
  const dateObj = parseISO(booking.date);
  const StatusIcon = status.icon;

  return (
    <div className="group relative bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 md:p-6 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Date Box */}
        <div className="flex-shrink-0 flex md:flex-col items-center justify-center gap-2 md:gap-0 bg-zinc-950 border border-zinc-800 rounded-xl p-3 md:w-20 md:h-20 text-center group-hover:border-zinc-700 transition-colors">
          <span className="text-zinc-400 text-xs uppercase font-bold tracking-wider">
            {format(dateObj, "MMM", { locale: ptBR })}
          </span>
          <span className="text-2xl md:text-3xl font-extrabold text-white">
            {format(dateObj, "dd")}
          </span>
          <span className="hidden md:block text-zinc-500 text-[10px] font-medium uppercase">
            {format(dateObj, "EEE", { locale: ptBR })}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                {booking.service.name}
              </h3>
              <p className="text-zinc-400 text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {format(dateObj, "HH:mm")} • {booking.service.duration} min
              </p>
            </div>
            <Badge
              className={cn(
                "w-fit px-3 py-1 flex items-center gap-1.5 transition-colors",
                status.className,
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <Avatar className="w-6 h-6 border border-zinc-800">
              <AvatarImage src={booking.barber.avatar} />
              <AvatarFallback className="bg-zinc-800 text-[10px]">
                {booking.barber.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-zinc-400">
              Profissional:{" "}
              <span className="text-zinc-200 font-medium">
                {booking.barber.name}
              </span>
            </span>
            <span className="hidden sm:inline-block text-zinc-700 mx-1">•</span>
            <span className="hidden sm:inline-block text-sm text-zinc-400">
              R$ {Number(booking.service.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  actionLink,
  icon: Icon = CalendarDays,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: any;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl text-center">
      <div className="bg-zinc-900 p-4 rounded-full mb-4 ring-1 ring-white/10">
        <Icon className="w-8 h-8 text-zinc-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-sm mx-auto mb-8">{description}</p>
      {actionLabel && actionLink && (
        <Link href={actionLink}>
          <Button className="bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-8">
            {actionLabel} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex items-center gap-6"
        >
          <Skeleton className="w-20 h-20 rounded-xl bg-zinc-800" />
          <div className="flex-1 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-48 bg-zinc-800" />
              <Skeleton className="h-6 w-24 bg-zinc-800 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <div className="pt-2 border-t border-white/5 flex gap-3">
              <Skeleton className="h-6 w-6 rounded-full bg-zinc-800" />
              <Skeleton className="h-4 w-40 bg-zinc-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
