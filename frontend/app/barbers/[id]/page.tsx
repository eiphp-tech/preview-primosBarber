"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { Navbar } from "@/components/ui/Navbar";
import { toast } from "sonner";
import { BookingSheet } from "@/components/booking/BookingSheet";

interface Barber {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

// Map service names to local assets
const SERVICE_IMAGES: Record<string, string> = {
  corte: "/service-corte.png",
  "corte de cabelo": "/service-corte.png",
  barba: "/service-barba.png",
  pezinho: "/service-pezinho.png",
  acabamento: "/service-pezinho.png",
  sobrancelha: "/service-sobrancelha.png",
  massagem: "/service-massagem.png",
  hidratação: "/service-hidratacao.png",
  hidratacao: "/service-hidratacao.png",
};

const DEFAULT_SERVICE_IMAGE = "/service-corte.png";

function getServiceImage(name: string) {
  const normalize = name.toLowerCase().trim();
  // Try exact match or partial match
  for (const key in SERVICE_IMAGES) {
    if (normalize.includes(key)) return SERVICE_IMAGES[key];
  }
  return DEFAULT_SERVICE_IMAGE;
}

export default function BarberPage() {
  const params = useParams();
  const id = params.id as string;

  const [barber, setBarber] = useState<Barber | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Barber Details
        const barberRes = await api.get(`/barbers/${id}`);
        if (barberRes.data.success) {
          setBarber(barberRes.data.data);
        }

        // 2. Fetch Services
        const servicesRes = await api.get("/services");
        if (servicesRes.data.success || Array.isArray(servicesRes.data)) {
          // Adjust depending on how backend returns list (sometimes directly array or inside data)
          // Backend controller: return list(query) -> might be { success: true, data: [...] } or just [...]
          // Checking backend controller:
          // return reply.status(200).send({ success: true, ...result });
          // result is usually { data, meta } or just data. Let's assume data.
          setServices(servicesRes.data.data || []);
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Barbeiro não encontrado</h1>
          <Button
            variant="link"
            className="text-white"
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in zoom-in duration-500 font-sans">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Hero + Services) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="relative w-full h-[50vh] lg:h-[400px] rounded-2xl overflow-hidden group shadow-2xl border border-white/5">
              <Image
                src="/image/hero-bg.png"
                alt="Barbershop Internal"
                fill
                className="object-cover "
                priority
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center lg:items-center justify-end h-full">
                <h1 className="text-3xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-lg text-center">
                  {barber.name}
                </h1>
              </div>
            </div>

            {/* Services List */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2 after:content-[''] after:h-px after:bg-white/10 after:flex-1">
                Serviços Disponíveis
              </h2>

              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  Nenhum serviço disponível no momento.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="bg-[#111] border border-white/5 hover:border-zinc-300/50 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-zinc-900/10"
                    >
                      <CardContent className="p-0 flex h-32">
                        {/* Image Side */}
                        <div className="relative w-32 h-full shrink-0">
                          <Image
                            src={getServiceImage(service.name)}
                            alt={service.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        </div>

                        {/* Content Side */}
                        <div className="flex flex-col justify-between flex-1 p-4">
                          <div>
                            <h3 className="font-bold text-white text-base group-hover:text-zinc-300 transition-colors line-clamp-1">
                              {service.name}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                              {service.description ||
                                "Procedimento realizado com os melhores produtos do mercado."}
                            </p>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600 font-medium">
                                Valor
                              </span>
                              <span className="text-white font-bold text-lg">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(service.price)}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="h-8 bg-white text-black hover:bg-zinc-800 hover:text-white font-bold text-xs transition-all shadow-lg"
                              onClick={() => setSelectedService(service)}
                            >
                              Agendar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (Desktop Info) */}
          <div className="flex flex-col gap-6 mt-8 lg:mt-0">
            {/* Map / Location Card */}
            <Card className="bg-[#111] border-none overflow-hidden relative min-h-[220px] flex items-end group shadow-xl">
              {/* Map Placeholder Background */}
              <div className="absolute inset-0 bg-[#1a1a1a]">
                <div className="w-full h-full opacity-30 bg-[radial-gradient(#555_1px,transparent_1px)] [background-size:16px_16px]"></div>
                {/* Decorative map circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-amber-500/10 rounded-full blur-xl animate-pulse"></div>
              </div>

              <div className="relative z-10 m-4 p-4 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 w-full flex items-center gap-4 hover:border-zinc-500/30 transition-colors">
                <Avatar className="h-10 w-10 border border-zinc-300/50">
                  <AvatarImage src="/logotipo.svg" />
                  <AvatarFallback>PB</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    Primos Barber
                  </h4>
                  <p className="text-xs text-gray-400 truncate">
                    Rua Varginha, 1499 - Daniel Fonseca - Uberlândia - MG
                  </p>
                </div>
              </div>
            </Card>

            {/* About Us */}
            <div className="space-y-4 px-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Sobre Nós
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed text-justify">
                Bem-vindo à{" "}
                <span className="font-bold text-white">Primos Barber</span>.
                Mais que um corte, uma experiência. Nossa missão é elevar sua
                autoestima através de um atendimento de excelência e um ambiente
                que respira a cultura da barbearia clássica com toques modernos.
              </p>
            </div>

            {/* Separator */}
            <div className="h-px w-full bg-white/5" />

            {/* Contacts */}
            <div className="space-y-2">
              {[{ phone: "(11) 98204-5108" }, { phone: "(11) 99503-2351" }].map(
                (contact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="bg-black p-2 rounded-full text-white">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">
                        {contact.phone}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider group-hover:text-white group-hover:bg-white/10 cursor-pointer"
                    >
                      Copiar
                    </Button>
                  </div>
                ),
              )}
            </div>

            {/* Hours */}
            <div className="bg-[#111] rounded-xl p-5 border border-white/5">
              <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Horários
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  "Segunda",
                  "Terça-Feira",
                  "Quarta-Feira",
                  "Quinta-Feira",
                  "Sexta-Feira",
                  "Sábado",
                  "Domingo",
                ].map((day, idx) => {
                  const isSunday = day === "Domingo";
                  const isMonday = day === "Segunda";
                  const isWeekend = day === "Sábado";
                  const hours =
                    isSunday || isMonday
                      ? "Fechado"
                      : isWeekend
                        ? "08:00 - 17:00"
                        : "09:00 - 21:00";

                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-gray-400 text-xs py-1 border-b border-white/5 last:border-0 last:pb-0"
                    >
                      <span
                        className={
                          hours === "Fechado"
                            ? "text-gray-600"
                            : "text-gray-300"
                        }
                      >
                        {day}
                      </span>
                      <span
                        className={
                          hours === "Fechado"
                            ? "text-red-900 font-bold bg-red-900/10 px-2 py-0.5 rounded"
                            : "text-emerald-500"
                        }
                      >
                        {hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-white/5 bg-black">
        <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <span>
            © 2026 <span className="font-bold text-gray-400">WS Barber</span>.
            All rights reserved.
          </span>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Termos</span>
            <span className="hover:text-gray-400 cursor-pointer">
              Privacidade
            </span>
          </div>
        </div>
      </footer>

      {barber && (
        <BookingSheet
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          service={selectedService}
          barber={barber}
        />
      )}
    </div>
  );
}
