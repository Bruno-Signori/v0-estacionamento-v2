"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Search, Car } from "lucide-react"
import type { Veiculo, TipoVeiculo } from "@/types/supabase"

interface VeiculosListProps {
  veiculos: Veiculo[]
  tiposVeiculo: TipoVeiculo[]
  onEdit: (veiculo: Veiculo) => void
  onDelete: (id: number) => void
}

export function VeiculosList({ veiculos, tiposVeiculo, onEdit, onDelete }: VeiculosListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Filtrar veículos com base na busca
  const filteredVeiculos = veiculos.filter(
    (veiculo) =>
      veiculo.nr_placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.nm_modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.nm_cor?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Obter nome do tipo de veículo
  const getTipoVeiculoNome = (id: number) => {
    const tipo = tiposVeiculo.find((t) => t.id === id)
    return tipo ? tipo.nm_tipo : "Desconhecido"
  }

  // Confirmar exclusão
  const confirmDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  // Executar exclusão
  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId)
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por placa, modelo ou cor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredVeiculos.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Mensalista</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVeiculos.map((veiculo) => (
                <TableRow key={veiculo.id}>
                  <TableCell className="font-medium">{veiculo.nr_placa}</TableCell>
                  <TableCell>{getTipoVeiculoNome(veiculo.id_tipo_veiculo)}</TableCell>
                  <TableCell>{veiculo.nm_modelo || "-"}</TableCell>
                  <TableCell>{veiculo.nm_cor || "-"}</TableCell>
                  <TableCell>
                    {veiculo.fl_mensalista ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Não
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(veiculo)} className="h-8 w-8 p-0 mr-2">
                      <span className="sr-only">Editar</span>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(veiculo.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <span className="sr-only">Excluir</span>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Car className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum veículo encontrado</h3>
          <p className="text-sm text-gray-500">
            {searchTerm ? "Tente uma busca diferente ou " : ""}
            adicione um novo veículo para começar.
          </p>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
