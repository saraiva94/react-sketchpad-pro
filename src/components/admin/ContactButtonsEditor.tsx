import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Phone, MessageCircle } from "lucide-react";

export interface ContactButton {
  id: string;
  name: string;
  link: string;
}

export const ContactButtonsEditor = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactButton[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "contact_buttons")
      .maybeSingle();

    if (data) {
      const value = data.value as unknown as { contacts: ContactButton[] };
      setContacts(value.contacts || []);
    } else {
      // Default contact
      setContacts([{
        id: crypto.randomUUID(),
        name: "WhatsApp Porto Bello",
        link: "https://wa.me/5521967264730"
      }]);
    }
  };

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        id: crypto.randomUUID(),
        name: "",
        link: ""
      }
    ]);
  };

  const prefillWhatsApp = (id: string) => {
    updateContact(id, "link", "https://wa.me/55");
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const updateContact = (id: string, field: "name" | "link", value: string) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const saveContacts = async () => {
    setSaving(true);

    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "contact_buttons")
      .maybeSingle();

    const jsonValue = JSON.parse(JSON.stringify({ contacts }));

    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: jsonValue })
        .eq("key", "contact_buttons");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "contact_buttons", value: jsonValue }]);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar os contatos.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "Botões de contato atualizados com sucesso.",
      });
    }

    setSaving(false);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Botões de Contato (Página do Projeto)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure os links de contato que aparecerão na página de cada projeto. 
          Use links wa.me para WhatsApp (ex: https://wa.me/5521967264730) ou qualquer outro link válido.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={contact.id} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Nome do Contato</Label>
              <Input
                value={contact.name}
                onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                placeholder="Ex: WhatsApp Porto Bello"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Link (wa.me, tel:, ou URL)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => prefillWhatsApp(contact.id)}
                  title="Preencher com WhatsApp"
                  className="shrink-0 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                </Button>
                <Input
                  value={contact.link}
                  onChange={(e) => updateContact(contact.id, "link", e.target.value)}
                  placeholder={contact.link.startsWith("https://wa.me/55") ? "Complete com DDD + número (ex: 21967264730)" : "Clique no botão WhatsApp para preencher com número ou cole o link do site de contato"}
                  className="flex-1"
                />
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeContact(contact.id)}
              disabled={contacts.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" onClick={addContact} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Contato
          </Button>
          <Button onClick={saveContacts} disabled={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Contatos"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
