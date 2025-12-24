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
import { useLanguage } from "@/hooks/useLanguage";

// Credenciais do admin
const ADMIN_KEY = "Admin2025";
const ADMIN_PASSWORD = "administradorpi2025";

const schema = z.object({
  key: z.string().min(1, "Informe a chave de acesso"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const AuthPage = () => {
  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const canSubmit = useMemo(() => key.trim() && password.trim(), [key, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({ key, password });
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
      // Validar credenciais hardcoded
      if (parsed.data.key === ADMIN_KEY && parsed.data.password === ADMIN_PASSWORD) {
        // Marcar como admin logado
        localStorage.setItem("isAdminLoggedIn", "true");
        
        toast({
          title: "Bem-vindo!",
          description: "Admin autenticado com sucesso.",
        });
        navigate("/admin");
      } else {
        toast({
          title: "Acesso negado",
          description: "Chave ou senha incorretos.",
          variant: "destructive",
        });
      }
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
              {t.common.back}
            </Button>
          </Link>
        }
      />

      <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {t.login.title}
            </CardTitle>
            <CardDescription>
              {t.login.accessKey}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">{t.login.accessKey}</Label>
                <Input
                  id="key"
                  type="text"
                  placeholder={t.login.accessKey}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.login.password}</Label>
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
                {isLoading ? t.common.loading : t.login.enter}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AuthPage;
