import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { DashboardData } from "@/types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true);
      try {
        const dateStr = date ? format(date, "yyyy-MM-dd") : "";
        const response = await api.get(`/dashboard?date=${dateStr}`);
        setData(response.data.data);
      } catch (error) {
        console.error("Erro dashboard:", error);
        toast.error("Erro ao carregar métricas.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, [date]);

  return {
    data,
    isLoading,
    date,
    setDate,
  };
}
