"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KupaLogo } from "@/components/kupa-logo";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Veri Sorumlusu",
    body: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") uyarınca, kişisel verileriniz; veri sorumlusu sıfatıyla Kupa Coffee Co. tarafından aşağıda açıklanan kapsamda işlenmektedir.",
    ],
  },
  {
    title: "2. İşlenen Kişisel Veriler",
    body: [
      "Kariyer başvuru formu aracılığıyla; ad-soyad, telefon numarası, e-posta adresi, tercih edilen şehir, başvurulan pozisyon, deneyim bilgisi, ilettiğiniz ön yazı/not ve varsa özgeçmiş (CV) belgeniz işlenmektedir.",
    ],
  },
  {
    title: "3. Kişisel Verilerin İşlenme Amaçları",
    body: [
      "Kişisel verileriniz; açık iş pozisyonları için başvurunuzun değerlendirilmesi, işe alım süreçlerinin yürütülmesi, sizinle iletişime geçilmesi ve insan kaynakları faaliyetlerinin planlanması amaçlarıyla işlenmektedir.",
    ],
  },
  {
    title: "4. Kişisel Verilerin Aktarılması",
    body: [
      "Kişisel verileriniz, yalnızca işe alım süreçlerinin yürütülmesi amacıyla ve gerekli olduğu ölçüde yetkili şube ve insan kaynakları birimleriyle paylaşılabilir. Verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmaz.",
    ],
  },
  {
    title: "5. Verilerin Saklanma Süresi",
    body: [
      "Başvurunuza ilişkin kişisel verileriniz, işe alım sürecinin tamamlanmasını takiben ilgili mevzuatta öngörülen süreler boyunca veya başvurunuzun ileride değerlendirilebilmesi amacıyla makul bir süre saklanır; sürenin sonunda silinir, yok edilir veya anonim hale getirilir.",
    ],
  },
  {
    title: "6. Haklarınız",
    body: [
      "KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını öğrenme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini veya yok edilmesini talep etme ve işlenmesine itiraz etme haklarına sahipsiniz.",
      "Bu haklarınızı kullanmak için Kupa Coffee Co. ile iletişime geçebilirsiniz.",
    ],
  },
];

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/"><KupaLogo variant="color" width={104} height={52} /></Link>
          <Button asChild variant="ghost" size="sm" className="font-medium">
            <Link href="/kariyer"><ArrowLeft className="w-4 h-4 mr-1.5" />Başvuruya Dön</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight">KVKK Aydınlatma Metni</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed mt-2">{p}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-muted/40 border border-border p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bu metin genel bilgilendirme amaçlıdır. İşletmenizin özel durumuna göre
            hukuk danışmanınızla birlikte gözden geçirilmesi önerilir.
          </p>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kupa Coffee Co. — Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
