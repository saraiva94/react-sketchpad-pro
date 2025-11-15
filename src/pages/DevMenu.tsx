import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Send, 
  Shield, 
  Plus, 
  Eye,
  Rocket
} from "lucide-react";

const DevMenu = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground">Menu de Desenvolvimento</h1>
          <p className="text-muted-foreground mt-2">Navegue pelas páginas do MVP para testes e revisão</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Públicas */}
          <Card className="border-2 border-accent/20 bg-accent/5 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Eye className="w-5 h-5" />
                Páginas Públicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/project-full/1">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <FileText className="w-4 h-4 mr-2" />
                  Visualização Completa do Projeto
                </Button>
              </Link>
              <Link to="/submit-project">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Projeto para Análise
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Administrativas */}
          <Card className="border-2 border-destructive/20 bg-destructive/5 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" />
                Páginas Administrativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin-090835">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Shield className="w-4 h-4 mr-2" />
                  Painel Administrativo
                </Button>
              </Link>
              <Link to="/create-project">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Novo Projeto
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Status do MVP */}
        <Card className="mt-8 max-w-4xl mx-auto border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Status do MVP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ Página de visualização completa do projeto</p>
              <p>✅ Página de envio público de projetos</p>
              <p>✅ Painel de administração secreto</p>
              <p>✅ Página de criação de projeto</p>
              <p>✅ Menu de desenvolvimento (esta página)</p>
              <p className="mt-4 text-foreground font-semibold">
                🎯 Todas as páginas essenciais estão prontas para revisão!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DevMenu;
