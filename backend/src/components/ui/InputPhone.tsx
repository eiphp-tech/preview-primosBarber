"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const countryCodes = [
  { code: "+1", country: "US" },
  { code: "+55", country: "BR" },
  { code: "+44", country: "UK" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+34", country: "ES" },
  { code: "+39", country: "IT" },
  { code: "+351", country: "PT" },
  { code: "+52", country: "MX" },
  { code: "+54", country: "AR" },
];

interface InputPhoneProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export const InputPhone = ({
  value = "",
  onChange,
  error,
}: InputPhoneProps) => {
  // Estado local para o código do país
  const [selectedCode, setSelectedCode] = useState(countryCodes[1]); // Começa com BR (+55)
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Formata apenas números
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbersOnly = e.target.value.replace(/\D/g, "");
    // Envia para o pai o formato completo: Código + Número (ex: +5511999999999)
    onChange(`${selectedCode.code}${numbersOnly}`);
  };

  // Atualiza quando troca o código do país
  const handleCodeChange = (country: (typeof countryCodes)[0]) => {
    setSelectedCode(country);
    setIsOpen(false);

    // Pega o número atual (remove o código antigo se existir, ou pega do input)
    // Para simplificar, vamos assumir que o 'value' vindo do pai já tem o código.
    // Mas aqui vamos focar na UX de digitação:
    const currentNumber = value.replace(selectedCode.code, "");
    onChange(`${country.code}${currentNumber}`);
  };

  // Separa o valor atual para exibir no input (remove o código do país visualmente)
  const displayValue = value.startsWith(selectedCode.code)
    ? value.slice(selectedCode.code.length)
    : value;

  return (
    <div className="w-full space-y-1">
      <div
        className={`
          flex items-center w-full bg-zinc-900/50 border rounded-xl px-4 py-3.5 transition-all
          ${
            error
              ? "border-red-500"
              : "border-zinc-700 focus-within:border-neutral-200/50 focus-within:ring-1 focus-within:ring-neutral-200/50"
          }
        `}
      >
        {/* Dropdown de Código */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 mr-3 border-r border-zinc-700 pr-3 cursor-pointer hover:text-white transition-colors group outline-none"
          >
            <span className="text-zinc-400 text-sm font-medium group-hover:text-white transition-colors">
              {selectedCode.code}
            </span>
            <ChevronDown
              className={`h-3 w-3 text-zinc-600 group-hover:text-white transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Lista do Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCodeChange(country)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800 transition-colors text-left"
                >
                  <span className="text-zinc-300 text-sm font-medium">
                    {country.code}
                  </span>
                  <span className="text-zinc-500 text-[10px] uppercase">
                    {country.country}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input de Texto */}
        <input
          type="tel"
          value={displayValue}
          onChange={handleNumberChange}
          placeholder="(11) 99999-9999"
          className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-600 focus:outline-none text-sm sm:text-base p-0"
        />
      </div>

      {/* Mensagem de Erro */}
      {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
    </div>
  );
};
