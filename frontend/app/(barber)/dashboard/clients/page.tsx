"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Search,
  Mail,
  Phone,
  MoreHorizontal,
  History,
  Calendar,
  Clock,
  Scissors,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// --- TIPOS ---
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

interface BookingHistory {
  id: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"; // Ajustado para bater com o backend
  service: { name: string; price: number };
}

const statusBadges: Record<string, { label: string; className: string }> = {
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ESTADOS DO HISTÓRICO
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<BookingHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await api.get("/users");
        const list = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setClients(list);
      } catch (error) {
        toast.error("Erro ao carregar clientes.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchClients();
  }, []);

  async function handleOpenHistory(client: Client) {
    setSelectedClient(client);
    setIsSheetOpen(true);
    setIsLoadingHistory(true);
    setHistory([]);

    try {
      const response = await api.get(`/bookings?customerId=${client.id}`);
      const list = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setHistory(list);
    } catch (error) {
      toast.error("Erro ao carregar histórico.");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 m-2">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Clientes
          </h2>
          <p className="text-zinc-400">Base de clientes cadastrados.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm text-zinc-300">
          Total: <strong className="text-white">{clients.length}</strong>
        </div>
      </div>

      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 w-full md:max-w-sm">
        <Search className="h-4 w-4 text-zinc-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          className="bg-transparent border-none text-white placeholder:text-zinc-500 focus:outline-none w-full text-sm py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              <TableHead className="text-zinc-400 font-bold w-[300px]">
                Cliente
              </TableHead>
              <TableHead className="text-zinc-400 font-bold">Contato</TableHead>
              <TableHead className="text-zinc-400 font-bold">
                Cadastro
              </TableHead>
              <TableHead className="text-zinc-400 font-bold text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-zinc-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" /> Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-zinc-800 hover:bg-zinc-900 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-700">
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400">
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">
                          {client.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-zinc-300 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-zinc-500" />{" "}
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-zinc-500" />{" "}
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-zinc-950 border-zinc-800"
                      >
                        <DropdownMenuLabel className="text-zinc-500 text-xs uppercase">
                          Opções
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleOpenHistory(client)}
                          className="text-zinc-300 focus:text-white focus:bg-zinc-900 cursor-pointer"
                        >
                          <History className="mr-2 h-4 w-4" /> Ver Histórico
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- GAVETA DE HISTÓRICO --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-zinc-950 border-l-zinc-800 text-white w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-zinc-700">
                <AvatarImage src={selectedClient?.avatar} />
                <AvatarFallback className="bg-zinc-800 text-white">
                  {selectedClient?.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {selectedClient?.name}
            </SheetTitle>
            <SheetDescription className="text-zinc-400">
              Histórico completo de atendimentos.
            </SheetDescription>
          </SheetHeader>

          {isLoadingHistory ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-white" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {/* KPIs do Cliente */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-center">
                  <div className="text-2xl font-bold text-white">
                    {history.length}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase">Visitas</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(
                      history.reduce(
                        (acc, item) => acc + (Number(item.service?.price) || 0),
                        0,
                      ),
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase">
                    Gasto Total
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative border-l border-zinc-800 ml-3 space-y-6 pb-4">
                {history.map((booking) => {
                  const badge =
                    statusBadges[booking.status] || statusBadges["PENDING"];
                  return (
                    <div key={booking.id} className="ml-6 relative">
                      <div
                        className={cn(
                          "absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-zinc-950",
                          booking.status === "CONFIRMED"
                            ? "bg-emerald-500"
                            : booking.status === "COMPLETED"
                              ? "bg-blue-500"
                              : booking.status === "PENDING"
                                ? "bg-yellow-500"
                                : "bg-zinc-600",
                        )}
                      />

                      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                            <Calendar className="h-4 w-4 text-zinc-500" />
                            {format(
                              new Date(booking.date),
                              "dd 'de' MMMM, yyyy",
                              { locale: ptBR },
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", badge.className)}
                          >
                            {badge.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                          <Clock className="h-3 w-3" />{" "}
                          {format(new Date(booking.date), "HH:mm")}
                        </div>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <Scissors className="h-4 w-4 text-zinc-500" />{" "}
                          {booking.service?.name}
                          <span className="text-zinc-500 text-xs ml-auto">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(booking.service?.price))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500">
              <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Nenhum histórico encontrado.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
