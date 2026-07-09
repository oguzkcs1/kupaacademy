"use client";

import { useState } from "react";
import {
  ClipboardList, Clock, Trophy, Play, CheckCircle2, X, ChevronRight, Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number;
}

interface QuizDef {
  id: string;
  title: string;
  training: string;
  timeLimit: number;
  passingScore: number;
  questions: QuizQuestion[];
}

const QUIZZES: QuizDef[] = [
  {
    id: "q1",
    title: "Espresso Temelleri Sınavı",
    training: "Espresso Temelleri",
    timeLimit: 10,
    passingScore: 70,
    questions: [
      { id: "1", text: "Espresso çekiminde ideal su sıcaklığı kaç derecedir?", options: ["80°C", "88-93°C", "100°C", "70°C"], correct: 1 },
      { id: "2", text: "Standart bir espresso çekiminde ne kadar kahve kullanılır?", options: ["5-7g", "7-9g", "18-21g", "30g"], correct: 2 },
      { id: "3", text: "Espresso çekim süresi genellikle kaç saniyedir?", options: ["10-15 saniye", "25-30 saniye", "60 saniye", "5 saniye"], correct: 1 },
      { id: "4", text: "Crema rengi hangi tonu ifade eder?", options: ["Koyu kahverengi", "Altın-amber", "Beyaz", "Siyah"], correct: 1 },
      { id: "5", text: "Kahve öğütme kalınlığı espresso için nasıl olmalıdır?", options: ["Çok kaba", "Orta", "İnce", "Çok ince"], correct: 2 },
    ],
  },
  {
    id: "q2",
    title: "Müşteri İletişimi Sınavı",
    training: "Müşteri Karşılama & İletişim",
    timeLimit: 8,
    passingScore: 75,
    questions: [
      { id: "1", text: "Müşteri şikayet ettiğinde ilk yapılması gereken nedir?", options: ["Savunmaya geçmek", "Dinlemek ve empati kurmak", "Yöneticiye yönlendirmek", "Özür dilemeden çözüm sunmak"], correct: 1 },
      { id: "2", text: "Müşteriyi karşılarken hangi ifade daha uygun?", options: ["'Ne istiyorsunuz?'", "'Buyurun, nasıl yardımcı olabilirim?'", "'Bekle biraz'", "'Şimdi meşgulüm'"], correct: 1 },
      { id: "3", text: "Siparişi tekrar etmek neden önemlidir?", options: ["Zaman kazanmak için", "Yanlış anlaşılmaları önlemek için", "Müşteriyi etkilemek için", "Zorunlu olduğu için"], correct: 1 },
      { id: "4", text: "Müşteri çok uzun bekliyorsa ne yapmalısınız?", options: ["Görmezden gelmek", "Bilgilendirmek ve özür dilemek", "Daha hızlı çalışmak", "Başka birini göndermek"], correct: 1 },
    ],
  },
  {
    id: "q3",
    title: "Gıda Güvenliği Sınavı",
    training: "Gıda Güvenliği & Hijyen",
    timeLimit: 12,
    passingScore: 80,
    questions: [
      { id: "1", text: "Elleri ne zaman yıkamak zorunludur?", options: ["Sadece tuvaletten sonra", "Her gıda işlemi öncesi ve sonrası", "Sadece başlangıçta", "İki saatte bir"], correct: 1 },
      { id: "2", text: "Soğuk zincir kaç derecenin altında tutulmalıdır?", options: ["10°C", "5°C", "0°C", "15°C"], correct: 1 },
      { id: "3", text: "HACCP neyin kısaltmasıdır?", options: ["Tehlike Analizi Kritik Kontrol Noktaları", "Hijyen Analizi Kontrol Prosedürü", "Gıda Güvenliği Sertifikası", "Kalite Kontrol Protokolü"], correct: 0 },
      { id: "4", text: "Pişmiş gıda kaç saat içinde tüketilmelidir?", options: ["24 saat", "4 saat (oda sıcaklığında)", "12 saat", "48 saat"], correct: 1 },
      { id: "5", text: "Çapraz bulaşma nedir?", options: ["Farklı ürünlerin birbirine karışması", "Pişmiş ve çiğ gıdalar arası mikrop geçişi", "İki sıvının karıştırılması", "Farklı renk kesme tahtası kullanımı"], correct: 1 },
    ],
  },
];

interface QuizResult {
  quizId: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export default function QuizzesPage() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizDef | null>(null);

  const getResult = (quizId: string) => results.find((r) => r.quizId === quizId);

  const handleQuizComplete = (quizId: string, score: number, passed: boolean) => {
    setResults((prev) => {
      const existing = prev.findIndex((r) => r.quizId === quizId);
      const result = { quizId, score, passed, completedAt: new Date().toISOString() };
      if (existing >= 0) {
        const updated = [...prev];
        if (score > prev[existing].score) updated[existing] = result;
        return updated;
      }
      return [...prev, result];
    });
    setActiveQuiz(null);
    if (passed) {
      toast.success(`Sınavı geçtiniz! Puanınız: %${score} 🎉`);
    } else {
      toast.error(`Sınavı geçemediniz. Puanınız: %${score}. Tekrar deneyin.`);
    }
  };

  const pending = QUIZZES.filter((q) => {
    const r = getResult(q.id);
    return !r || !r.passed;
  });
  const completed = QUIZZES.filter((q) => getResult(q.id)?.passed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Sınavlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {pending.length} bekleyen · {completed.length} tamamlanan
        </p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-3">Bekleyen Sınavlar</h2>
          <div className="space-y-3">
            {pending.map((quiz) => {
              const result = getResult(quiz.id);
              return (
                <Card key={quiz.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{quiz.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{quiz.training}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3.5 h-3.5" />
                            {quiz.questions.length} soru
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {quiz.timeLimit} dakika
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" />
                            Geçer: %{quiz.passingScore}
                          </span>
                        </div>
                        {result && !result.passed && (
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={result.score} className="h-1.5 w-24" />
                            <span className="text-xs text-destructive font-medium">Son puan: %{result.score}</span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" onClick={() => setActiveQuiz(quiz)}>
                        <Play className="w-3 h-3" />
                        {result ? "Tekrar Al" : "Başla"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-3">Tamamlanan Sınavlar</h2>
          <div className="space-y-3">
            {completed.map((quiz) => {
              const result = getResult(quiz.id)!;
              return (
                <Card key={quiz.id} className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{quiz.title}</h3>
                          <Badge variant="success" className="text-xs">Geçildi</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{quiz.training}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Progress value={result.score} className="h-1.5 w-24 [&>div]:bg-green-500" />
                          <span className="text-xs font-semibold text-green-600">%{result.score}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveQuiz(quiz)}>
                        Tekrar Al
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={(score, passed) => handleQuizComplete(activeQuiz.id, score, passed)}
        />
      )}
    </div>
  );
}

function QuizModal({
  quiz,
  onClose,
  onComplete,
}: {
  quiz: QuizDef;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const question = quiz.questions[currentQ];
  const isLast = currentQ === quiz.questions.length - 1;

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (isLast) {
      const correct = newAnswers.filter((a, i) => a === quiz.questions[i].correct).length;
      const score = Math.round((correct / quiz.questions.length) * 100);
      const passed = score >= quiz.passingScore;
      setStep("result");
      onComplete(score, passed);
    } else {
      setCurrentQ((q) => q + 1);
    }
  };

  const correct = answers.filter((a, i) => a === quiz.questions[i].correct).length;
  const score = answers.length > 0 ? Math.round((correct / quiz.questions.length) * 100) : 0;
  const passed = score >= quiz.passingScore;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        {step === "intro" && (
          <>
            <DialogHeader>
              <DialogTitle>{quiz.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Sınava başlamadan önce aşağıdaki bilgileri okuyun:</p>
              <div className="space-y-2">
                {[
                  `${quiz.questions.length} soru`,
                  `Süre limiti: ${quiz.timeLimit} dakika`,
                  `Geçer not: %${quiz.passingScore}`,
                  "Her sorunun bir doğru cevabı var",
                ].map((info) => (
                  <div key={info} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    <span>{info}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1">İptal</Button>
                <Button onClick={() => setStep("quiz")} className="flex-1">
                  <Play className="w-4 h-4" />
                  Sınava Başla
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "quiz" && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base">Soru {currentQ + 1} / {quiz.questions.length}</DialogTitle>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Progress value={((currentQ) / quiz.questions.length) * 100} className="h-1.5 mt-2" />
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="font-medium text-sm leading-relaxed">{question.text}</p>
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border text-sm transition-all",
                      selected === i
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
              <Button className="w-full" onClick={handleNext} disabled={selected === null}>
                {isLast ? "Sınavı Bitir" : "Sonraki Soru"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {step === "result" && (
          <>
            <DialogHeader>
              <DialogTitle>Sınav Sonucu</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center space-y-4">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                passed ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
              )}>
                {passed
                  ? <Award className="w-10 h-10 text-green-600 dark:text-green-400" />
                  : <X className="w-10 h-10 text-red-600 dark:text-red-400" />
                }
              </div>
              <div>
                <p className={cn("text-4xl font-bold", passed ? "text-green-600" : "text-red-600")}>%{score}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {quiz.questions.length} sorudan {correct} doğru
                </p>
              </div>
              <Badge variant={passed ? "success" : "destructive"} className="text-sm px-4 py-1">
                {passed ? "BAŞARILI 🎉" : "BAŞARISIZ"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {passed
                  ? "Tebrikler! Bu sınavı başarıyla geçtiniz."
                  : `Geçer not %${quiz.passingScore}. Tekrar deneyebilirsiniz.`
                }
              </p>
              <Button onClick={onClose} className="w-full">Kapat</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
