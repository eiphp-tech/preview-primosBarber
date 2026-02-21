import { Sidebar } from "@/modules/dashboard/components/Sidebar";
import { MobileSidebar } from "@/modules/dashboard/components/MobileSidebar"; // Importe aqui
import { Scissors } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {/* 1. Sidebar Fixa (Apenas Desktop) */}
      <Sidebar />

      {/* 2. Header Mobile (Apenas Mobile) */}
      <header className="md:hidden h-16 px-6 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
        <MobileSidebar />
      </header>

      {/* 3. Conteúdo Principal */}
      <main className="md:ml-64 min-h-screen pb-6 p-4">
        <div className="p-6 md:p-3">{children}</div>
      </main>
    </div>
  );
}
