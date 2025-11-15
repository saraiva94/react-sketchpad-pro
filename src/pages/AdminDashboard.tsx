import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Mail,
  Eye,
  Clock,
  FileText,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminDashboard = () => {
  // Dados mockados
  const [projects] = useState([
    { 
      id: 1, 
      title: "Projeto Documentário Ipsum", 
      status: "Em andamento", 
      date: "15/03/2024",
      category: "Cinema",
      budget: "R$ 150.000"
    },
    { 
      id: 2, 
      title: "Festival Cultural Lorem", 
      status: "Aprovado", 
      date: "10/03/2024",
      category: "Evento",
      budget: "R$ 80.000"
    },
    { 
      id: 3, 
      title: "Exposição Artística Dolor", 
      status: "Pendente", 
      date: "05/03/2024",
      category: "Artes Visuais",
      budget: "R$ 45.000"
    },
  ]);

  const [requests] = useState([
    {
      id: 1,
      projectName: "Projeto Teatro Sit Amet",
      requester: "João Silva",
      email: "joao@email.com",
      date: "18/03/2024",
      status: "Aguardando"
    },
    {
      id: 2,
      projectName: "Mostra de Cinema Consectetur",
      requester: "Maria Santos",
      email: "maria@email.com",
      date: "17/03/2024",
      status: "Aguardando"
    },
  ]);

  const [messages] = useState([
    {
      id: 1,
      name: "Pedro Costa",
      email: "pedro@email.com",
      phone: "(11) 98765-4321",
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Gostaria de saber mais sobre como funciona o processo de aprovação de projetos.",
      date: "19/03/2024",
      read: false
    },
    {
      id: 2,
      name: "Ana Lima",
      email: "ana@email.com",
      phone: "(21) 91234-5678",
      message: "Tenho interesse em apoiar projetos culturais. Como posso me cadastrar na plataforma?",
      date: "18/03/2024",
      read: false
    },
    {
      id: 3,
      name: "Carlos Oliveira",
      email: "carlos@email.com",
      phone: "(31) 99876-5432",
      message: "Meu projeto foi aprovado, mas preciso fazer algumas alterações. É possível?",
      date: "17/03/2024",
      read: true
    },
  ]);

  const handleCreateProject = () => {
    console.log("Navegando para página de criação de projeto...");
    // Navegar para /create-project
    window.location.href = "/create-project";
  };

  const handleEdit = (id: number) => {
    console.log("Editar projeto ID:", id);
  };

  const handleDelete = (id: number) => {
    console.log("Excluir projeto ID:", id);
  };

  const handleApprove = (id: number) => {
    console.log("Aprovar solicitação ID:", id);
  };

  const handleReject = (id: number) => {
    console.log("Rejeitar solicitação ID:", id);
  };

  const handleMarkAsRead = (id: number) => {
    console.log("Marcar mensagem como lida ID:", id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em andamento":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Aprovado":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Pendente":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Menu
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-2">Gerencie projetos e interações do site</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Create Project Button */}
        <Card className="border-2 border-accent/20 bg-accent/5 shadow-lg">
          <CardContent className="p-8 text-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={handleCreateProject}
            >
              <Plus className="w-6 h-6 mr-2" />
              Adicionar Novo Projeto
            </Button>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Projetos Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${project.id}`} />
                            <AvatarFallback>P{project.id}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                              <Badge variant="outline">{project.category}</Badge>
                              <span className="text-sm text-muted-foreground">{project.budget}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-15">
                          <Clock className="w-4 h-4" />
                          <span>{project.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(project.id)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requests Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Solicitações de Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requester}`} />
                            <AvatarFallback>{request.requester[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.projectName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Por: {request.requester} • {request.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-11">
                          <Clock className="w-4 h-4" />
                          <span>{request.date}</span>
                          <Badge variant="outline" className="ml-2">{request.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Mensagens do Fale Conosco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card key={msg.id} className={`border ${msg.read ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.name}`} />
                            <AvatarFallback>{msg.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{msg.name}</h3>
                            <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                              <span>{msg.email}</span>
                              <span>{msg.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">{msg.date}</span>
                          {!msg.read && (
                            <Badge variant="default" className="bg-accent">
                              Nova
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="pl-11">
                        <p className="text-muted-foreground leading-relaxed">{msg.message}</p>
                        {!msg.read && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            onClick={() => handleMarkAsRead(msg.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
