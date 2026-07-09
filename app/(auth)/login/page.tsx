"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, Shield, Zap, BookOpen } from "lucide-react";
import { KupaLogo } from "@/components/kupa-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { motion } from "framer-motion";

const features = [
  { icon: BookOpen, title: "Dijital Eğitimler", desc: "Tüm operasyon eğitimlerine tek yerden erişin" },
  { icon: Zap, title: "SOP & Reçeteler", desc: "Standart prosedürleri dijitalleştirin" },
  { icon: Shield, title: "Kurumsal Yönetim", desc: "Ekip performansını takip edin" },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        toast.success("Hoş geldiniz!");
        router.push("/dashboard");
      } else {
        toast.error("Geçersiz kullanıcı adı veya şifre");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col bg-[hsl(222,47%,11%)] relative overflow-hidden flex-shrink-0">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative flex flex-col h-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <KupaLogo variant="dark" width={160} height={160} />
          </motion.div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-auto mb-12"
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Operasyonunuzu<br />
              <span className="text-primary">dijitalleştirin.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Eğitimler, SOP'lar, reçeteler ve daha fazlası — tüm operasyon bilginiz tek platformda.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-white/85 text-sm font-medium">{f.title}</p>
                  <p className="text-white/40 text-xs">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-white/25 text-xs mt-12">© 2026 Kupa Academy. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <KupaLogo variant="color" width={120} height={60} />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Tekrar hoş geldiniz</h1>
            <p className="text-muted-foreground text-sm mt-1.5">Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">Kullanıcı adı</Label>
              <Input
                id="username"
                type="text"
                placeholder="kullanici.adi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
                <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  Şifremi unuttum
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-medium bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-8 p-4 rounded-xl bg-muted/60 border border-border/50">
            <p className="text-xs font-semibold text-foreground/70 mb-2">Demo Hesaplar</p>
            <div className="space-y-2">
              <div>
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide mb-0.5">Yönetici</p>
                <p className="text-xs text-muted-foreground font-mono">admin / admin123</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide mb-0.5">Barista</p>
                <p className="text-xs text-muted-foreground font-mono">mehmet.demir / barista123</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
