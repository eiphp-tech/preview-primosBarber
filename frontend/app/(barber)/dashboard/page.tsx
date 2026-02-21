"use client";

import { useDashboardData } from "@/modules/dashboard/hooks/useDashboardData";
import { DashboardStats } from "@/modules/dashboard/components/DashboardStats";
import { RecentBookings } from "@/modules/dashboard/components/RecentBookings";
import { TopServices } from "@/modules/dashboard/components/TopServices";
import { DateFilter } from "@/modules/dashboard/components/DateFilter";
import { RevenueChart } from "@/modules/dashboard/components/RevenueChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, date, setDate } = useDashboardData();

  if (isLoading || !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4 bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:m-2">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <DateFilter date={date} setDate={setDate} />

          {/* PERFIL */}
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full pl-6 pr-6 py-2">
            <div className="h-8 w-8 bg-zinc-800 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white leading-none">
                Painel
              </span>
              <span className="text-xs text-zinc-500">Barbeiro</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARDS KPI */}
      <DashboardStats data={data} date={date} />

      {/* MAIN AREA */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Lista Recentes */}
        <RecentBookings bookings={data.recentBookings} />

        {/* Coluna Direita */}
        <div className="space-y-6 lg:col-span-2">
          <TopServices services={data.topServices} />

          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold text-white">
                Gráfico de Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
              <RevenueChart data={data.chartData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

