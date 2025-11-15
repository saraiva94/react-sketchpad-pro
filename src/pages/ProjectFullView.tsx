import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Download, 
  Heart, 
  Bookmark, 
  Users, 
  Calendar,
  MapPin,
  Tag,
  TrendingUp,
  Award,
  Newspaper,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProjectFullView = () => {
  const [isSaved, setIsSaved] = useState(false);

  // Dados mockados
  const project = {
    title: "Projeto Cultural Ipsum Dolor",
    tags: ["Cinema", "Documentário", "Cultural"],
    budget: "R$ 150.000,00",
    raised: "R$ 45.000,00",
    backers: 23,
    location: "São Paulo, SP",
    year: "2024",
    heroImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    synopsis: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
    creator: {
      name: "Maria Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      bio: "Diretora e produtora cultural com 15 anos de experiência"
    },
    team: [
      { name: "João Santos", role: "Diretor de Fotografia", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao" },
      { name: "Ana Costa", role: "Roteirista", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
      { name: "Pedro Lima", role: "Editor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" },
      { name: "Carla Dias", role: "Produtora", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla" },
    ],
    rewards: [
      { value: "R$ 50,00", title: "Apoiador Bronze", benefits: ["Agradecimento nos créditos", "Acesso antecipado ao trailer"] },
      { value: "R$ 150,00", title: "Apoiador Prata", benefits: ["Todos os benefícios anteriores", "Pôster digital exclusivo", "Convite para pré-estreia"] },
      { value: "R$ 500,00", title: "Apoiador Ouro", benefits: ["Todos os benefícios anteriores", "DVD autografado", "Visita ao set de filmagem", "Jantar com a equipe"] },
    ],
    impact: {
      cultural: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Projeto visa resgatar memórias culturais da região.",
      social: "Impacto direto em 500 famílias da comunidade local, gerando empregos e fortalecendo a economia criativa.",
      audience: "Estimativa de 50.000 espectadores nos primeiros 6 meses",
      differentials: ["Primeira produção regional do gênero", "Uso de técnicas inovadoras", "Inclusão de artistas locais"]
    },
    awards: [
      "Prêmio de Melhor Documentário - Festival de Cinema 2023",
      "Menção Honrosa - Mostra Cultural Internacional",
      "Vencedor Categoria Inovação - Prêmio Nacional de Cultura"
    ],
    media: [
      "Reportagem no Jornal Nacional - TV Globo",
      "Entrevista na Rádio Cultura",
      "Matéria especial - Revista Cultura Magazine",
      "Destaque no Portal G1"
    ],
    updates: [
      { date: "15/03/2024", title: "Início das Filmagens", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Primeiro dia de gravação foi um sucesso!" },
      { date: "10/03/2024", title: "Aprovação do Roteiro", content: "Roteiro final aprovado pela equipe. Preparativos para início das filmagens." },
      { date: "05/03/2024", title: "Projeto Aprovado", content: "Projeto aprovado pelos apoiadores iniciais. Vamos começar!" }
    ]
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

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={project.heroImage} 
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-4xl font-bold mb-4 text-foreground">{project.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{project.year}</span>
                  </div>
                </div>
                <Button className="w-full sm:w-auto" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Apresentação
                </Button>
              </CardContent>
            </Card>

            {/* Video Section */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Vídeo de Apresentação</h2>
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={project.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Sobre o Projeto</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Sinopse</h3>
                    <p className="text-muted-foreground leading-relaxed">{project.synopsis}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Descrição Completa</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Section */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Ficha Técnica</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.team.map((member, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rewards Section */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Contrapartidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.rewards.map((reward, i) => (
                    <Card key={i} className="border-2 hover:border-accent transition-colors">
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-accent mb-2">{reward.value}</div>
                        <h3 className="font-semibold text-lg mb-4">{reward.title}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {reward.benefits.map((benefit, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-accent mt-1">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Impact Section */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  Impacto do Projeto
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Impacto Cultural</h3>
                    <p className="text-muted-foreground">{project.impact.cultural}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Impacto Social</h3>
                    <p className="text-muted-foreground">{project.impact.social}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Público Estimado</h3>
                    <p className="text-muted-foreground">{project.impact.audience}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Diferenciais</h3>
                    <ul className="space-y-2">
                      {project.impact.differentials.map((diff, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-accent mt-1">✓</span>
                          <span>{diff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Awards Section */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-accent" />
                  Reconhecimento
                </h2>
                <div className="space-y-3">
                  {project.awards.map((award, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-accent/5">
                      <Award className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{award}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Media Section */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-accent" />
                  Na Mídia
                </h2>
                <div className="space-y-3">
                  {project.media.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
                      <Newspaper className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Updates Section */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-accent" />
                  Atualizações do Projeto
                </h2>
                <div className="space-y-6">
                  {project.updates.map((update, i) => (
                    <div key={i} className="border-l-4 border-accent pl-6 py-2">
                      <div className="text-sm text-muted-foreground mb-1">{update.date}</div>
                      <h3 className="font-semibold text-lg mb-2">{update.title}</h3>
                      <p className="text-muted-foreground">{update.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Budget Card */}
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-accent mb-1">{project.raised}</div>
                    <div className="text-sm text-muted-foreground">de {project.budget} arrecadados</div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-accent w-[30%] rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <Users className="w-4 h-4" />
                    <span>{project.backers} apoiadores</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold mb-4">Ações</h3>
                  <Button className="w-full" size="lg">
                    <Users className="w-4 h-4 mr-2" />
                    Solicitar Conexão
                  </Button>
                  <Button variant="secondary" className="w-full" size="lg">
                    <Heart className="w-4 h-4 mr-2" />
                    Quero Apoiar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Salvo nos Favoritos' : 'Salvar nos Favoritos'}
                  </Button>
                </CardContent>
              </Card>

              {/* Creator Card */}
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Criador do Projeto</h3>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={project.creator.avatar} />
                      <AvatarFallback>{project.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{project.creator.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{project.creator.bio}</p>
                      <Button variant="link" className="px-0 mt-2" size="sm">
                        Ver perfil completo →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFullView;
