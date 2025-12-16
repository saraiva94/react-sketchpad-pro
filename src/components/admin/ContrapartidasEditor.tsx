import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Check, X } from "lucide-react";

export interface Contrapartida {
  id: string;
  valor: string;
  beneficios: string[];
  ativo: boolean;
  ordem: number;
  indice?: string;
}

const INDICE_OPTIONS = [
  { value: 'por_episodio', label: 'por episódio' },
  { value: 'por_temporada', label: 'por temporada' },
  { value: 'por_projeto', label: 'por projeto' },
  { value: 'por_evento', label: 'por evento' },
  { value: 'por_mes', label: 'por mês' },
  { value: 'por_ano', label: 'por ano' },
];

interface ContrapartidasEditorProps {
  contrapartidas: Contrapartida[];
  onChange: (contrapartidas: Contrapartida[]) => void;
}

const ContrapartidasEditor: React.FC<ContrapartidasEditorProps> = ({ 
  contrapartidas, 
  onChange 
}) => {
  const [newBeneficio, setNewBeneficio] = useState<{ [key: string]: string }>({});

  const addContrapartida = () => {
    const newContrapartida: Contrapartida = {
      id: crypto.randomUUID(),
      valor: '',
      beneficios: [],
      ativo: true,
      ordem: contrapartidas.length,
      indice: undefined
    };
    onChange([...contrapartidas, newContrapartida]);
  };

  const removeContrapartida = (id: string) => {
    onChange(contrapartidas.filter(c => c.id !== id));
  };

  const updateContrapartida = (id: string, field: keyof Contrapartida, value: any) => {
    onChange(contrapartidas.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const addBeneficio = (contrapartidaId: string) => {
    const beneficio = newBeneficio[contrapartidaId]?.trim();
    if (!beneficio) return;
    
    const contrapartida = contrapartidas.find(c => c.id === contrapartidaId);
    if (!contrapartida) return;

    updateContrapartida(contrapartidaId, 'beneficios', [...contrapartida.beneficios, beneficio]);
    setNewBeneficio(prev => ({ ...prev, [contrapartidaId]: '' }));
  };

  const removeBeneficio = (contrapartidaId: string, index: number) => {
    const contrapartida = contrapartidas.find(c => c.id === contrapartidaId);
    if (!contrapartida) return;

    const newBeneficios = contrapartida.beneficios.filter((_, i) => i !== index);
    updateContrapartida(contrapartidaId, 'beneficios', newBeneficios);
  };

  const moveContrapartida = (id: string, direction: 'up' | 'down') => {
    const index = contrapartidas.findIndex(c => c.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contrapartidas.length) return;

    const newContrapartidas = [...contrapartidas];
    [newContrapartidas[index], newContrapartidas[newIndex]] = [newContrapartidas[newIndex], newContrapartidas[index]];
    
    // Update ordem values
    newContrapartidas.forEach((c, i) => {
      c.ordem = i;
    });

    onChange(newContrapartidas);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Contrapartidas para Investidores</Label>
        <Button type="button" variant="outline" size="sm" onClick={addContrapartida}>
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Contrapartida
        </Button>
      </div>

      {contrapartidas.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Nenhuma contrapartida cadastrada. Clique em "Adicionar Contrapartida" para começar.
        </p>
      )}

      {contrapartidas.map((contrapartida, index) => (
        <Card key={contrapartida.id} className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">
                  Contrapartida #{index + 1}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`ativo-${contrapartida.id}`} className="text-sm">
                    Ativo
                  </Label>
                  <Switch
                    id={`ativo-${contrapartida.id}`}
                    checked={contrapartida.ativo}
                    onCheckedChange={(checked) => updateContrapartida(contrapartida.id, 'ativo', checked)}
                  />
                </div>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => moveContrapartida(contrapartida.id, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => moveContrapartida(contrapartida.id, 'down')}
                  disabled={index === contrapartidas.length - 1}
                >
                  ↓
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeContrapartida(contrapartida.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Valor e Índice */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`valor-${contrapartida.id}`}>
                  Valor (ex: 5000)
                </Label>
                <Input
                  id={`valor-${contrapartida.id}`}
                  value={contrapartida.valor}
                  onChange={(e) => updateContrapartida(contrapartida.id, 'valor', e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`indice-${contrapartida.id}`}>
                  Índice (tag)
                </Label>
                <Select
                  value={contrapartida.indice || ''}
                  onValueChange={(value) => updateContrapartida(contrapartida.id, 'indice', value || undefined)}
                >
                  <SelectTrigger id={`indice-${contrapartida.id}`}>
                    <SelectValue placeholder="Selecionar índice..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {INDICE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-2">
              <Label>Benefícios</Label>
              
              {/* Lista de benefícios existentes */}
              <div className="space-y-2">
                {contrapartida.beneficios.map((beneficio, bIndex) => (
                  <div key={bIndex} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="flex-1 text-sm">{beneficio}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBeneficio(contrapartida.id, bIndex)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Adicionar novo benefício */}
              <div className="flex gap-2">
                <Input
                  value={newBeneficio[contrapartida.id] || ''}
                  onChange={(e) => setNewBeneficio(prev => ({ 
                    ...prev, 
                    [contrapartida.id]: e.target.value 
                  }))}
                  placeholder="Adicionar benefício..."
                  maxLength={160}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addBeneficio(contrapartida.id);
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="secondary" 
                  size="sm"
                  onClick={() => addBeneficio(contrapartida.id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Pressione Enter ou clique + para adicionar
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContrapartidasEditor;
