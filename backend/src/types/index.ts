export interface Barber {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Service {
  name: string;
  price: string;
}

export interface Booking {
  id: string;
  date: string;
  status: string;
  service: Service;
  barber: { name: string; avatar: string };
}

export interface DashboardData {
  monthlyRevenue: number;
  appointmentsToday: number;
  totalClients: number;
  chartData: { name: string; faturamento: number; servicos: number }[];
  recentBookings: {
    id: string;
    client: { name: string; email: string; avatar?: string };
    service: { name: string };
    date: string;
    status: string;
  }[];
  topServices: { name: string; qtd: number }[];
}
