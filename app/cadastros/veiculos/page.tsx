import type { Metadata } from "next"
import { VeiculosManager } from "@/components/veiculos-manager"

export const metadata: Metadata = {
  title: "Cadastro de Veículos | ParkGestor",
  description: "Cadastro, edição e exclusão de veículos",
}

export default function CadastroVeiculosPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Cadastro de Veículos</h1>
      <VeiculosManager />
    </div>
  )
}
