"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// --- TIPOS E SCHEMAS ---
interface ServiceItem {
  id: string;
  name: string;
  price: number | string;
  duration: number;
  description?: string;
  active: boolean;
}

const serviceSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  price: z.coerce.number().min(1, "Preço inválido"),
  duration: z.coerce.number().min(5, "Duração mínima 5 min"),
  description: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados dos Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(
    null
  );
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(
    null
  );

  // Formulário
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as any,
  });

  // --- BUSCAR DADOS ---
  async function fetchServices() {
    try {
      const response = await api.get("/services");
      // Tratamento robusto para diferentes formatos de resposta
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : response.data.services || [];
      setServices(data);
    } catch (error) {
      toast.error("Erro ao carregar serviços.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  // --- AÇÕES ---

  // 1. Abrir Modal de Criação
  function handleOpenCreate() {
    setEditingService(null);
    reset({ name: "", price: 0, duration: 30, description: "" });
    setIsFormOpen(true);
  }

  // 2. Abrir Modal de Edição
  function handleOpenEdit(service: ServiceItem) {
    setEditingService(service);
    // Preenche o formulário com os dados existentes
    setValue("name", service.name);
    setValue("price", Number(service.price));
    setValue("duration", service.duration);
    setValue("description", service.description || "");
    setIsFormOpen(true);
  }

  // 3. Salvar (Criar ou Editar)
  async function onSubmit(data: ServiceFormData) {
    try {
      if (editingService) {
        // EDITAR
        await api.put(`/services/${editingService.id}`, data);
        toast.success("Serviço atualizado!");
      } else {
        // CRIAR
        await api.post("/services", { ...data, active: true });
        toast.success("Serviço criado!");
      }
      setIsFormOpen(false);
      fetchServices();
    } catch (err: any) {
      toast.error("Erro ao salvar serviço.");
    }
  }

  // 4. Excluir
  async function handleConfirmDelete() {
    if (!serviceToDelete) return;
    try {
      // Supondo rota DELETE /services/:id
      await api.delete(`/services/${serviceToDelete.id}`);
      toast.success("Serviço excluído.");
      setServiceToDelete(null);
      fetchServices();
    } catch (error) {
      toast.error("Erro ao excluir. O serviço pode estar em uso.");
    }
  }

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:m-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Serviços
          </h2>
          <p className="text-zinc-400">Menu de serviços da barbearia.</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-white text-black hover:bg-zinc-200 font-bold"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      {/* BUSCA */}
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 w-full md:max-w-sm focus-within:ring-1 focus-within:ring-white transition-all">
        <Search className="h-4 w-4 text-zinc-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar serviço..."
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
              <TableHead className="text-zinc-400 font-bold">Nome</TableHead>
              <TableHead className="text-zinc-400 font-bold">Duração</TableHead>
              <TableHead className="text-zinc-400 font-bold">Preço</TableHead>
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
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-zinc-500"
                >
                  Nenhum serviço encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow
                  key={service.id}
                  className="border-zinc-800 hover:bg-zinc-900 transition-colors"
                >
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex flex-col">
                        <span>{service.name}</span>
                        {!service.active && (
                          <span className="text-[10px] text-red-500 uppercase font-bold">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {service.duration} min
                  </TableCell>
                  <TableCell className="text-zinc-300 font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(service.price))}
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
                          onClick={() => handleOpenEdit(service)}
                          className="text-zinc-300 focus:text-white focus:bg-zinc-900 cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setServiceToDelete(service)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-950/20 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
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

      {/* MODAL CRIAR/EDITAR */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {editingService
                ? "Altere os dados do serviço abaixo."
                : "Preencha os dados para criar um novo serviço."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-zinc-400">Nome</Label>
              <Input
                {...register("name")}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-white"
              />
              {errors.name && (
                <span className="text-xs text-red-400">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-zinc-400">Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("price")}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-white"
                />
                {errors.price && (
                  <span className="text-xs text-red-400">
                    {errors.price.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="text-zinc-400">Duração (min)</Label>
                <Input
                  type="number"
                  {...register("duration")}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-white"
                />
                {errors.duration && (
                  <span className="text-xs text-red-400">
                    {errors.duration.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-zinc-400">Descrição (Opcional)</Label>
              <Input
                {...register("description")}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-white"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black hover:bg-zinc-200 w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DELETAR */}
      <Dialog
        open={!!serviceToDelete}
        onOpenChange={() => setServiceToDelete(null)}
      >
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px]">
          <DialogHeader>
            <div className="mx-auto bg-red-900/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-red-900/50">
              <AlertTriangle className="text-red-500 w-6 h-6" />
            </div>
            <DialogTitle className="text-center">Excluir Serviço?</DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              Você tem certeza que deseja excluir{" "}
              <strong>{serviceToDelete?.name}</strong>? Essa ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setServiceToDelete(null)}
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
