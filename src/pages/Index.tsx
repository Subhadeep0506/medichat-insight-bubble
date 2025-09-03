import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Sparkles, ShieldCheck, MessageSquare, Users, Star, LogIn, UserPlus as UserPlusIcon, FolderOpen, Bot, History, ImageUp, FileUp } from "lucide-react";
import { supportCategories, selfAssessments, testimonials } from "@/types/constants";

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-30 transition-all duration-300 ${scrolled
        ? "backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 bg-white/80 dark:bg-slate-900/70 shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        <span className={`text-2xl font-bold text-[#0f172a] dark:text-white tracking-tight ${scrolled ? "text-slate-900" : "text-slate-100"}`}>
          MentalCare
        </span>
        <div className="hidden md:flex gap-6 items-center text-sm text-slate-700 dark:text-slate-200">
          <button className={`hover:text-white-600 dark:hover:text-white ${scrolled ? "text-slate-900" : "text-slate-100"}`} onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>Features</button>
          <button className={`hover:text-white-600 dark:hover:text-white ${scrolled ? "text-slate-900" : "text-slate-100"}`} onClick={() => window.scrollTo({ top: window.innerHeight * 1.6, behavior: "smooth" })}>Assessments</button>
          <button className={`hover:text-white-600 dark:hover:text-white ${scrolled ? "text-slate-900" : "text-slate-100"}`} onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>Contact</button>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            size="sm"
            className="bg-[#37a36c] text-white dark:bg-[#2a7d52] rounded-full px-6 font-semibold transition hover:bg-[#319c63] dark:hover:bg-[#319c63]"
            onClick={() => navigate("/register")}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#37a36c] text-[#37a36c] rounded-full px-6 font-semibold bg-white transition hover:bg-[#cbeed5] dark:hover:text-[#37a36c]"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
};


const Feature = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur border-border">
    <CardHeader className="space-y-1">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
      <CardDescription className="pt-1 text-slate-600 dark:text-slate-400">{desc}</CardDescription>
    </CardHeader>
  </Card>
);

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-slate-300 dark:text-white">{value}</div>
    <div className="text-sm text-slate-400 dark:text-slate-400">{label}</div>
  </div>
);

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Navbar />

      {/* Hero with animated gradient */}
      <section className="relative">
        <BackgroundGradientAnimation
          interactive
          containerClassName="h-[88vh] w-full"
          className="relative"
        >
          <div className="absolute inset-0 bg-black/0" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 h-full flex items-center pb-20 md:pb-28">
            <div className="w-full flex flex-col md:flex-row items-center gap-10">
              <div className="max-w-2xl">
                <Reveal delay={0}>
                  <Badge className="rounded-full px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 w-fit mb-4">
                    Secure • Private • Accessible
                  </Badge>
                </Reveal>
                <Reveal delay={100}>
                  <h1 className="text-slate-200 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                    Mental health tools for modern care
                  </h1>
                </Reveal>
                <Reveal delay={200}>
                  <p className="mt-4 text-lg md:text-xl text-slate-400 dark:text-slate-300 max-w-xl">
                    Chat, manage cases, and access evidence-based resources — all in one place designed for people and teams.
                  </p>
                </Reveal>
                <Reveal delay={300}>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      className="bg-[#37a36c] text-white dark:bg-[#2a7d52] rounded-full px-6 font-semibold hover:bg-[#319c63]"
                      onClick={() => navigate("/register")}
                    >
                      Create free account
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => navigate("/login")}
                    >
                      Try demo
                    </Button>
                  </div>
                </Reveal>
                <Reveal delay={400}>
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-white">
                    <Stat value="12k+" label="People supported" />
                    <Stat value="98%" label="Satisfaction" />
                    <Stat value="120+" label="Clinician orgs" />
                    <Stat value="24/7" label="Access" />
                  </div>
                </Reveal>
              </div>
              <Reveal delay={150}>
                <div className="w-full flex justify-center">
                  <img src="assets/Person with medical mask-pana.png" alt="Healthcare professional with mask" className="w-4/5 max-w-[520px] object-contain drop-shadow-2xl transition-transform duration-700 ease-out md:hover:scale-[1.03]" />
                </div>
              </Reveal>
            </div>
          </div>
        </BackgroundGradientAnimation>
      </section>

      {/* Feature highlights */}
      <section className="max-w-7xl mx-auto px-6 mt-6 md:-mt-8 relative z-10">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Feature icon={Sparkles} title="AI-assisted chat" desc="Natural conversations to triage, reflect, and discover resources with guidance." />
            <Feature icon={ShieldCheck} title="Privacy by design" desc="End-to-end secure flows with minimal data exposure and strong controls." />
            <Feature icon={MessageSquare} title="Case tracking" desc="Create, update, and review patient cases with structured notes and history." />
          </div>
        </Reveal>
      </section>

      {/* Product features (informational) */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <Reveal>
          <h2 className="text-2xl font-bold mb-2">Everything you can do</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">A complete toolkit for clinicians, patients, and teams.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Reveal>
            <Card className="group border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <CardTitle>Login & Registration</CardTitle>
                </div>
                <CardDescription>Secure sign-up and sign-in to access your workspace.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Create an account or log in anytime.</li>
                  <li>Personalized, persistent experience.</li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={50}>
            <Card className="group border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <CardTitle>Patients</CardTitle>
                </div>
                <CardDescription>Add, view, and manage patient profiles.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Store demographics and medical history.</li>
                  <li>Edit details with audit-friendly structure.</li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={100}>
            <Card className="group border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <CardTitle>Cases per patient</CardTitle>
                </div>
                <CardDescription>Track conditions, notes, and updates per case.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Create multiple cases for a single patient.</li>
                  <li>Review progress and decisions in one place.</li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={150}>
            <Card className="group border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <CardTitle>Case chat</CardTitle>
                </div>
                <CardDescription>Start AI-powered conversations for each case.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ask clinical questions and explore insights.</li>
                  <li>Context stays scoped to the selected case.</li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={200}>
            <Card className="group border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <History className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <CardTitle>Sessions</CardTitle>
                </div>
                <CardDescription>Start new chats or continue earlier sessions.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Preserve conversation history per case.</li>
                  <li>Resume where you left off anytime.</li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={250}>
            <Card className="group border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <ImageUp className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <CardTitle>Uploads (images & PDFs)</CardTitle>
                </div>
                <CardDescription>Attach scans and medical reports for context.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Upload images and PDFs within a case.</li>
                  <li>LLM references files when answering.</li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Support Categories */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">I'm looking for support for...</h2>
          <Button variant="ghost" className="gap-2">
            <Users className="h-4 w-4" /> Explore all
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportCategories.map((cat, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <Card
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur border-border hover:shadow-lg transition-all duration-300 group"
              >
                <CardContent className="p-4">
                  <div className="rounded-xl p-4 mb-4 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 group-hover:scale-[1.02] transition-transform">
                    <img src={cat.image} className="h-28 object-contain" alt={cat.title} />
                  </div>
                  <div className="font-semibold mb-1">{cat.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{cat.description}</div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Assessments */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <Reveal>
          <h2 className="text-2xl font-bold mb-4">Choose self-assessment</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selfAssessments.map((sa, idx) => (
            <Reveal key={idx} delay={idx * 80}>
              <Card
                className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur border-border hover:shadow-lg transition-all duration-300 ${idx === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
              >
                <CardContent className="p-4 h-full flex flex-col">
                  <div className={`rounded-xl flex items-center justify-center mb-3 ${idx === 0 ? "p-4 bg-blue-50 dark:bg-blue-900/20" : "p-4 bg-blue-50 dark:bg-blue-900/20"
                    }`}>
                    <img
                      src={sa.image}
                      className={`${idx === 0 ? "h-24" : "h-24"} object-contain`}
                      alt={sa.title}
                    />
                  </div>
                  <div className={`${idx === 0 ? "text-base" : "text-base"} font-semibold`}>{sa.title}</div>
                  <div className={`${idx === 0 ? "text-sm" : "text-sm"} text-slate-600 dark:text-slate-400`}>{sa.description}</div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials carousel */}
      <section className="max-w-5xl mx-auto px-6 mt-16">
        <Reveal>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold">What people say</h2>
          </div>
        </Reveal>
        <div className="relative">
          <Carousel opts={{ loop: true }}>
            <CarouselContent>
              {testimonials.map((t, i) => (
                <CarouselItem key={i}>
                  <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur border-border">
                    <CardContent className="p-6">
                      <p className="text-lg leading-relaxed">“{t.quote}”</p>
                      <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">— {t.author}</div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 my-20">
        <Reveal>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-900">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">Start supporting mental wellbeing today</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2 max-w-2xl">
                  Create cases, chat securely, and access resources that make a difference. No credit card required.
                </p>
              </div>
              <div className="flex gap-3">
                <Button size="lg" className="rounded-full" onClick={() => navigate("/register")}>Get Started</Button>
                <Button size="lg" variant="outline" className="rounded-full" onClick={() => navigate("/cases")}>View Cases</Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </div>
  );
};

export default Index;
