import type { PricingTable } from "../configuracoes"

// Dados iniciais para simulação
export const initialPricingTables: PricingTable[] = [
  {
    id: "1",
    name: "Carro - Padrão",
    description: "Tabela padrão para carros",
    vehicleType: "carro",
    isDefault: true,
    toleranceMinutes: 10, // 10 minutos de tolerância
    maxValue: 50, // Máximo de R$ 50,00
    periods: [
      { id: "1-1", name: "Primeira Hora", minutes: 60, price: 10 },
      { id: "1-2", name: "Hora Adicional", minutes: 60, price: 7 },
    ],
  },
  {
    id: "2",
    name: "Moto - Padrão",
    description: "Tabela padrão para motos",
    vehicleType: "moto",
    isDefault: true,
    toleranceMinutes: 15, // 15 minutos de tolerância
    maxValue: 30, // Máximo de R$ 30,00
    periods: [
      { id: "2-1", name: "Primeira Hora", minutes: 60, price: 5 },
      { id: "2-2", name: "Hora Adicional", minutes: 60, price: 3 },
    ],
  },
  {
    id: "3",
    name: "Caminhonete - Padrão",
    description: "Tabela padrão para caminhonetes",
    vehicleType: "camionete",
    isDefault: true,
    toleranceMinutes: 5, // 5 minutos de tolerância
    maxValue: 70, // Máximo de R$ 70,00
    periods: [
      { id: "3-1", name: "Primeira Hora", minutes: 60, price: 15 },
      { id: "3-2", name: "Hora Adicional", minutes: 60, price: 10 },
    ],
  },
  {
    id: "4",
    name: "Diária Executiva",
    description: "Tabela especial para diárias",
    vehicleType: "carro",
    isDefault: false,
    toleranceMinutes: 0, // Sem tolerância
    maxValue: 80, // Máximo de R$ 80,00
    periods: [
      { id: "4-1", name: "Até 12 horas", minutes: 720, price: 50 },
      { id: "4-2", name: "Diária Completa", minutes: 1440, price: 80 },
    ],
  },
]
