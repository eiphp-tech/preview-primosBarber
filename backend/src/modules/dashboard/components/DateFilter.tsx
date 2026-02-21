import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateFilterProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DateFilter({ date, setDate }: DateFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2 min-w-[140px] justify-start text-left font-normal"
        >
          <CalendarIcon className="h-4 w-4" />
          {date
            ? format(date, "MMM/yyyy", { locale: ptBR }).toUpperCase()
            : "Filtrar Data"}
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
          initialFocus
          className="bg-transparent text-zinc-100"
          classNames={{
            day_selected:
              "bg-white text-black hover:bg-zinc-200 focus:bg-white font-bold rounded-md",
            day_today:
              "bg-zinc-800 text-white font-bold border border-zinc-700 rounded-md",
            day: "h-9 w-9 p-0 font-normal text-zinc-300 aria-selected:opacity-100 hover:bg-zinc-800 rounded-md transition-colors",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
