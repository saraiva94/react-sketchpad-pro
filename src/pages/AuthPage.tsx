import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({
        title: "Verifique os dados",
        description: parsed.error.issues[0]?.message ?? "Dados inválidos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) {
        toast({
          title: "Não foi possível entrar",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        await supabase.auth.signOut();
        toast({
          title: "Erro de sessão",
          description: "Não foi possível validar a sessão. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });

      if (roleErr || !isAdmin) {
        await supabase.auth.signOut();
        toast({
          title: "Acesso negado",
          description: "Sua conta não tem permissão de administrador.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bem-vindo!",
        description: "Admin autenticado com sucesso.",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        showNav={false}
        rightContent={
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        }
      />

      <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Acesso Administrativo
            </CardTitle>
            <CardDescription>
              Entre com e-mail e senha do admin para liberar o botão "Admin" na navbar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !canSubmit}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AuthPage;
