import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProjectSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectName: string;
  projectType: string;
  synopsis: string;
  mediaLink: string;
  hasIncentiveLaw: boolean;
  incentiveLawDetails?: string;
  additionalInfo: string;
  submittedAt: string;
}

// Estado global simulado (placeholder para integração futura)
export const projectSubmissions: ProjectSubmission[] = [];

const SubmitProjectPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [mediaLink, setMediaLink] = useState("");
  const [hasIncentiveLaw, setHasIncentiveLaw] = useState(false);
  const [incentiveLawDetails, setIncentiveLawDetails] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Nome é obrigatório";
    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido";
    }
    if (!phone.trim()) newErrors.phone = "Telefone é obrigatório";
    if (!projectName.trim()) newErrors.projectName = "Nome do projeto é obrigatório";
    if (!projectType) newErrors.projectType = "Tipo do projeto é obrigatório";
    if (!synopsis.trim()) newErrors.synopsis = "Sinopse é obrigatória";
    if (!mediaLink.trim()) newErrors.mediaLink = "Link de mídia é obrigatório";
    if (hasIncentiveLaw && !incentiveLawDetails.trim()) {
      newErrors.incentiveLawDetails = "Detalhes da lei de incentivo são obrigatórios";
    }
    if (!additionalInfo.trim()) newErrors.additionalInfo = "Informações adicionais são obrigatórias";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submission: ProjectSubmission = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      projectName,
      projectType,
      synopsis,
      mediaLink,
      hasIncentiveLaw,
      incentiveLawDetails: hasIncentiveLaw ? incentiveLawDetails : undefined,
      additionalInfo,
      submittedAt: new Date().toISOString(),
    };

    projectSubmissions.push(submission);
    console.log("Nova solicitação de projeto:", submission);
    console.log("Todas as solicitações:", projectSubmissions);

    setShowSuccessModal(true);
    clearForm();
  };

  const clearForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setProjectName("");
    setProjectType("");
    setSynopsis("");
    setMediaLink("");
    setHasIncentiveLaw(false);
    setIncentiveLawDetails("");
    setAdditionalInfo("");
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back to DevMenu */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Menu
            </Button>
          </Link>
        </div>
      </div>

      <div className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg animate-fade-in">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-foreground">
              Enviar Projeto para Análise
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha o formulário abaixo com os dados do seu projeto cultural
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Dados Pessoais</h3>
                
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Dados do Projeto */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-foreground">Dados do Projeto</h3>
                
                <div>
                  <Label htmlFor="projectName">Nome do Projeto *</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Nome do seu projeto cultural"
                    className={errors.projectName ? "border-destructive" : ""}
                  />
                  {errors.projectName && (
                    <p className="text-sm text-destructive mt-1">{errors.projectName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectType">Tipo do Projeto *</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger className={errors.projectType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinema">Cinema</SelectItem>
                      <SelectItem value="teatro">Teatro</SelectItem>
                      <SelectItem value="musica">Música</SelectItem>
                      <SelectItem value="danca">Dança</SelectItem>
                      <SelectItem value="literatura">Literatura</SelectItem>
                      <SelectItem value="artes-visuais">Artes Visuais</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectType && (
                    <p className="text-sm text-destructive mt-1">{errors.projectType}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="synopsis">Sinopse *</Label>
                  <Textarea
                    id="synopsis"
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Descreva brevemente seu projeto (2-3 parágrafos)"
                    rows={4}
                    className={errors.synopsis ? "border-destructive" : ""}
                  />
                  {errors.synopsis && (
                    <p className="text-sm text-destructive mt-1">{errors.synopsis}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mediaLink">Link de Vídeo ou PDF *</Label>
                  <Input
                    id="mediaLink"
                    type="url"
                    value={mediaLink}
                    onChange={(e) => setMediaLink(e.target.value)}
                    placeholder="https://..."
                    className={errors.mediaLink ? "border-destructive" : ""}
                  />
                  {errors.mediaLink && (
                    <p className="text-sm text-destructive mt-1">{errors.mediaLink}</p>
                  )}
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="hasIncentiveLaw"
                    checked={hasIncentiveLaw}
                    onCheckedChange={(checked) => setHasIncentiveLaw(checked === true)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="hasIncentiveLaw"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Possui lei de incentivo aprovada?
                    </Label>
                  </div>
                </div>

                {hasIncentiveLaw && (
                  <div className="animate-fade-in">
                    <Label htmlFor="incentiveLawDetails">Detalhes da Lei de Incentivo *</Label>
                    <Textarea
                      id="incentiveLawDetails"
                      value={incentiveLawDetails}
                      onChange={(e) => setIncentiveLawDetails(e.target.value)}
                      placeholder="Informe qual lei, número do processo, etc."
                      rows={3}
                      className={errors.incentiveLawDetails ? "border-destructive" : ""}
                    />
                    {errors.incentiveLawDetails && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.incentiveLawDetails}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="additionalInfo">Conte mais sobre o projeto *</Label>
                  <Textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Compartilhe mais detalhes, objetivos, impacto esperado, etc."
                    rows={5}
                    className={errors.additionalInfo ? "border-destructive" : ""}
                  />
                  {errors.additionalInfo && (
                    <p className="text-sm text-destructive mt-1">{errors.additionalInfo}</p>
                  )}
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="min-w-[200px]">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Projeto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Modal de Sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Projeto Enviado com Sucesso!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Sua solicitação foi recebida e será analisada em breve. Entraremos em contato
              através do email informado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowSuccessModal(false)} size="lg">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmitProjectPage;
