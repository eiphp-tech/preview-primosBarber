import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardData } from "@/types";

interface DashboardStatsProps {
  data: DashboardData;
  date: Date | undefined;
}

export function DashboardStats({ data, date }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-3">
          <CardTitle className="text-lg font-extrabold text-white">
            Faturamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-extrabold text-white">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(data.monthlyRevenue)}
          </div>
          <p className="text-xs text-zinc-500 mt-1 capitalize">
            Ref. {date ? format(date, "MMMM", { locale: ptBR }) : "mês atual"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-3">
          <CardTitle className="text-lg font-extrabold text-white">
            Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {data.appointmentsToday}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            No dia {date ? format(date, "dd/MM") : "hoje"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-3">
          <CardTitle className="text-lg font-extrabold text-white">
            Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {data.totalClients}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Total cadastrado</p>
        </CardContent>
      </Card>
    </div>
  );
}
