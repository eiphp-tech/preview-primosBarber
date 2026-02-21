import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/types";

interface TopServicesProps {
  services: DashboardData["topServices"];
}

export function TopServices({ services }: TopServicesProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-700 h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-extrabold text-white">
          Top Serviços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.length === 0 ? (
          <p className="text-zinc-500 text-sm">Sem dados.</p>
        ) : (
          services.map((serv, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-zinc-800 last:border-0 pb-3 last:pb-0"
            >
              <span className="text-sm font-medium text-zinc-200">
                {serv.name}
              </span>
              <span className="text-sm font-bold text-white">{serv.qtd}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
