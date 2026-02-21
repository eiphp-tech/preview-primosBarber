"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  DollarSign,
  TrendingUp,
  Calendar as CalendarIcon,
  Pencil,
  PieChart,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// TIPOS SIMPLIFICADOS (Sem PaymentMethod)
interface Transaction {
  id: string;
  amount: number;
  category: string;
  status: "PAID" | "PENDING" | "CANCELLED";
  date: string;
  clientName: string;
  clientAvatar?: string;
}

interface FinancialData {
  totalRevenue: number;
  totalTicket: number;
  chartData: { name: string; total: number; fullDate: string }[];
  transactions: Transaction[];
}

const statusStyles: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function FinancialPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Meta
  const [monthlyGoal, setMonthlyGoal] = useState(10000);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState(monthlyGoal.toString());

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const dateQuery = date ? `?date=${format(date, "yyyy-MM-dd")}` : "";
        const response = await api.get(`/finance${dateQuery}`);
        setData(response.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [date]);

  const currentRevenue = data?.totalRevenue || 0;
  const goalProgress = Math.min((currentRevenue / monthlyGoal) * 100, 100);

  const handleSaveGoal = () => {
    const val = parseFloat(tempGoal);
    if (isNaN(val) || val <= 0) return toast.error("Valor inválido");
    setMonthlyGoal(val);
    setIsGoalModalOpen(false);
    toast.success("Meta atualizada!");
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 md:m-2">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Financeiro
          </h1>
          <p className="text-zinc-400">
            Gestão de caixa e inteligência de lucros.
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 justify-start w-[200px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date
                ? format(date, "dd 'de' MMM, yyyy", { locale: ptBR })
                : "Filtrar por Data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-zinc-950 border-zinc-800"
            align="end"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="text-zinc-100"
              classNames={{
                day_selected:
                  "bg-white text-black hover:bg-zinc-200 focus:bg-white font-bold rounded-md",
                day_today:
                  "bg-zinc-800 text-white font-bold border border-zinc-700 rounded-md",
              }}
            />
            <div className="p-2 border-t border-zinc-800">
              <Button
                variant="ghost"
                className="w-full text-xs h-8"
                onClick={() => setDate(undefined)}
              >
                Limpar Filtro
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* KPIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Faturamento */}
        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.totalRevenue)}
            </div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> Receita confirmada
            </p>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Ticket Médio
            </CardTitle>
            <PieChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(data.totalTicket)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Média por cliente</p>
          </CardContent>
        </Card>

        {/* Meta */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-2 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Meta Mensal
              </CardTitle>
              <button
                onClick={() => {
                  setTempGoal(monthlyGoal.toString());
                  setIsGoalModalOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            <span className="text-xs font-bold text-white">
              {goalProgress.toFixed(0)}%
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs text-zinc-500 mb-2">
              <span>
                Atual:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(currentRevenue)}
              </span>
              <span>
                Alvo:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(monthlyGoal)}
              </span>
            </div>
            <Progress
              value={goalProgress}
              className="h-2 bg-zinc-800 [&>div]:bg-white"
            />
            <p className="text-xs text-zinc-500 mt-2">
              {currentRevenue >= monthlyGoal ? (
                <span className="text-emerald-500 font-bold">
                  Meta batida! 🎉
                </span>
              ) : (
                `Faltam ${new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(monthlyGoal - currentRevenue)}.`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO (AGORA OCUPA LARGURA TOTAL) */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">
            Receita Diária
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "#27272a", opacity: 0.4 }}
                />
                <Bar dataKey="total" fill="#fff" radius={[4, 4, 0, 0]}>
                  {data.chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === data.chartData.length - 1
                          ? "#10b981"
                          : "#3f3f46"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE TRANSAÇÕES (SEM COLUNA DE MÉTODO) */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">
            Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* DESKTOP */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableHead className="text-zinc-400">
                    Cliente / Data
                  </TableHead>
                  <TableHead className="text-zinc-400">Categoria</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-zinc-500"
                    >
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.transactions.map((t) => (
                    <TableRow
                      key={t.id}
                      className="border-zinc-800 hover:bg-zinc-950/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-zinc-700">
                            <AvatarImage src={t.clientAvatar} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold text-xs">
                              {t.clientName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                              {t.clientName}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {format(new Date(t.date), "dd MMM, HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-sm">
                        {t.category}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", statusStyles[t.status])}
                        >
                          {t.status === "PAID"
                            ? "Pago"
                            : t.status === "PENDING"
                            ? "Pendente"
                            : "Cancelado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-white">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE (SEM MÉTODO) */}
          <div className="md:hidden space-y-4">
            {data.transactions.map((t) => (
              <div
                key={t.id}
                className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-zinc-700">
                      <AvatarImage src={t.clientAvatar} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">
                        {t.clientName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-bold text-sm">
                        {t.clientName}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {format(new Date(t.date), "dd/MM/yyyy • HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold block">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(t.amount)}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-zinc-800 w-full" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{t.category}</span>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", statusStyles[t.status])}
                  >
                    {t.status === "PAID"
                      ? "Pago"
                      : t.status === "PENDING"
                      ? "Pendente"
                      : "Cancelado"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MODAL META */}
      <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Definir Meta Mensal</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Qual é o seu objetivo de faturamento para este mês?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="goal" className="text-zinc-300">
              Valor da Meta (R$)
            </Label>
            <div className="mt-2 relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="goal"
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGoalModalOpen(false)}
              className="bg-transparent border-zinc-800 text-zinc-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveGoal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Salvar Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
