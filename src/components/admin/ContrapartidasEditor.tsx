import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Contrapartida {
  id: string;
  titulo?: string;
  valor: string;
  beneficios: string[];
  ativo: boolean;
  ordem: number;
  indice?: string;
}

const DEFAULT_INDICE_OPTIONS = [
  'por episódio',
  'por temporada',
  'por projeto',
  'por evento',
  'por mês',
  'por ano',
];

interface ContrapartidasEditorProps {
  contrapartidas: Contrapartida[];
  onChange: (contrapartidas: Contrapartida[]) => void;
}

// Função para formatar valor como moeda brasileira
const formatCurrencyInput = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número e formata
  const numValue = parseInt(numbers, 10);
  
  // Formata como moeda brasileira
  return numValue.toLocaleString('pt-BR');
};

// Função para extrair número do valor formatado
const extractNumber = (formattedValue: string): string => {
  return formattedValue.replace(/\D/g, '');
};

const ContrapartidasEditor: React.FC<ContrapartidasEditorProps> = ({ 
  contrapartidas, 
  onChange 
}) => {
  const [newBeneficio, setNewBeneficio] = useState<{ [key: string]: string }>({});
  const [confirmingDelete, setConfirmingDelete] = useState<{ contrapartidaId: string; beneficioIndex: number } | null>(null);
  const [indiceOptions, setIndiceOptions] = useState<string[]>(DEFAULT_INDICE_OPTIONS);
  const [newIndice, setNewIndice] = useState("");
  const [confirmingDeleteIndice, setConfirmingDeleteIndice] = useState<string | null>(null);

  const addContrapartida = () => {
    const newContrapartida: Contrapartida = {
      id: crypto.randomUUID(),
      titulo: '',
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

  const handleValorChange = (id: string, rawValue: string) => {
    const formatted = formatCurrencyInput(rawValue);
    updateContrapartida(id, 'valor', extractNumber(formatted));
  };

  const getDisplayValue = (valor: string): string => {
    if (!valor) return '';
    const num = parseInt(valor, 10);
    if (isNaN(num)) return valor;
    return num.toLocaleString('pt-BR');
  };

  const addBeneficio = (contrapartidaId: string) => {
    const beneficio = newBeneficio[contrapartidaId]?.trim();
    if (!beneficio) return;
    
    const contrapartida = contrapartidas.find(c => c.id === contrapartidaId);
    if (!contrapartida) return;

    updateContrapartida(contrapartidaId, 'beneficios', [...contrapartida.beneficios, beneficio]);
    setNewBeneficio(prev => ({ ...prev, [contrapartidaId]: '' }));
  };

  const confirmRemoveBeneficio = (contrapartidaId: string, index: number) => {
    const contrapartida = contrapartidas.find(c => c.id === contrapartidaId);
    if (!contrapartida) return;

    const newBeneficios = contrapartida.beneficios.filter((_, i) => i !== index);
    updateContrapartida(contrapartidaId, 'beneficios', newBeneficios);
    setConfirmingDelete(null);
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
            {/* Título do Nível */}
            <div className="space-y-2">
              <Label htmlFor={`titulo-${contrapartida.id}`}>
                Nome do Nível
              </Label>
              <Input
                id={`titulo-${contrapartida.id}`}
                value={contrapartida.titulo || ''}
                onChange={(e) => updateContrapartida(contrapartida.id, 'titulo', e.target.value)}
                placeholder="Ex: PATINHAS DE OURO, BRONZE, PRATA..."
              />
            </div>

            {/* Valor e Índice */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`valor-${contrapartida.id}`}>
                  Valor (R$)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id={`valor-${contrapartida.id}`}
                    value={getDisplayValue(contrapartida.valor)}
                    onChange={(e) => handleValorChange(contrapartida.id, e.target.value)}
                    placeholder="5.000"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Índice (tag)</Label>
                
                {/* Adicionar novo índice */}
                <div className="flex gap-2">
                  <Input
                    value={newIndice}
                    onChange={(e) => setNewIndice(e.target.value)}
                    placeholder="Adicionar novo índice..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = newIndice.trim();
                        if (trimmed && !indiceOptions.includes(trimmed)) {
                          setIndiceOptions([...indiceOptions, trimmed]);
                          setNewIndice("");
                        }
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const trimmed = newIndice.trim();
                      if (trimmed && !indiceOptions.includes(trimmed)) {
                        setIndiceOptions([...indiceOptions, trimmed]);
                        setNewIndice("");
                      }
                    }}
                    disabled={!newIndice.trim() || indiceOptions.includes(newIndice.trim())}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de índices */}
                <div className="flex flex-wrap gap-2">
                  {indiceOptions.map((option) => {
                    const isSelected = contrapartida.indice === option;
                    const isConfirming = confirmingDeleteIndice === option;
                    
                    return (
                      <Badge
                        key={option}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          if (!isConfirming) {
                            updateContrapartida(
                              contrapartida.id, 
                              'indice', 
                              isSelected ? undefined : option
                            );
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-all select-none flex items-center gap-1",
                          isSelected 
                            ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                            : "hover:bg-muted",
                          isConfirming && "ring-2 ring-red-500/50"
                        )}
                      >
                        <span>{option}</span>
                        {!isConfirming && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingDeleteIndice(option);
                            }}
                            className="ml-0.5 hover:bg-red-500/30 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </button>
                        )}
                        {isConfirming && (
                          <div className="flex items-center gap-0.5 ml-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove from options
                                setIndiceOptions(indiceOptions.filter(o => o !== option));
                                // Clear from any contrapartida using this indice
                                contrapartidas.forEach(c => {
                                  if (c.indice === option) {
                                    updateContrapartida(c.id, 'indice', undefined);
                                  }
                                });
                                setConfirmingDeleteIndice(null);
                              }}
                              className="hover:bg-green-500/30 rounded-full p-0.5"
                            >
                              <Check className="h-3 w-3 text-green-400" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDeleteIndice(null);
                              }}
                              className="hover:bg-red-500/30 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3 text-red-400" />
                            </button>
                          </div>
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-3">
              <Label>Benefícios</Label>
              
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
                  variant="outline" 
                  size="icon"
                  onClick={() => addBeneficio(contrapartida.id)}
                  disabled={!newBeneficio[contrapartida.id]?.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Lista de benefícios como badges */}
              <div className="flex flex-wrap gap-2">
                {contrapartida.beneficios.map((beneficio, bIndex) => {
                  const isConfirming = confirmingDelete?.contrapartidaId === contrapartida.id && 
                                       confirmingDelete?.beneficioIndex === bIndex;
                  
                  return (
                    <Badge
                      key={bIndex}
                      variant="default"
                      className={cn(
                        "cursor-default transition-all select-none flex items-center gap-1 bg-primary text-primary-foreground",
                        isConfirming && "ring-2 ring-red-500/50"
                      )}
                    >
                      <span>{beneficio}</span>
                      {!isConfirming && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmingDelete({ contrapartidaId: contrapartida.id, beneficioIndex: bIndex });
                          }}
                          className="ml-0.5 hover:bg-red-500/30 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3 text-red-400" />
                        </button>
                      )}
                      {isConfirming && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmRemoveBeneficio(contrapartida.id, bIndex);
                            }}
                            className="hover:bg-green-500/30 rounded-full p-0.5"
                          >
                            <Check className="h-3 w-3 text-green-400" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingDelete(null);
                            }}
                            className="hover:bg-red-500/30 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </button>
                        </div>
                      )}
                    </Badge>
                  );
                })}
              </div>

              {contrapartida.beneficios.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Adicione benefícios para esta contrapartida
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContrapartidasEditor;
