import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardData } from "@/types";

interface RecentBookingsProps {
  bookings: DashboardData["recentBookings"];
}

const statusBadges: Record<string, string> = {
  CONFIRMED: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border border-red-500/20",
  NO_SHOW: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmado",
  PENDING: "Pendente",
  COMPLETED: "Realizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não veio",
};

export function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card className="col-span-1 lg:col-span-2 bg-zinc-900 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-lg font-extrabold text-white">
          Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">
              Nenhum agendamento recente.
            </p>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-xl border border-zinc-800"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-zinc-700">
                    <AvatarImage src={booking.client?.avatar} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-400">
                      {booking.client?.name?.substring(0, 2).toUpperCase() ||
                        "CL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white leading-none">
                      {booking.client?.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {booking.service?.name}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-full",
                    statusBadges[booking.status] || "bg-zinc-800 text-white"
                  )}
                >
                  {statusLabels[booking.status] || booking.status}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
