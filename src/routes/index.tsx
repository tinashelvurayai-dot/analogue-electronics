import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cpu, KeyRound, Sparkles, Mail, BookOpen, Zap, Trophy, Brain, Clock, CheckCircle2, Download, UserPlus, UserCheck, Star, Users, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { InstallAppButton } from "@/components/InstallAppButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const nav = useNavigate();
  const tapsRef = useRef<{ count: number; timer: ReturnType<typeof setTimeout> | null }>({ count: 0, timer: null });
  const handleLogoTap = () => {
    const s = tapsRef.current;
    s.count += 1;
    if (s.timer) clearTimeout(s.timer);
    s.timer = setTimeout(() => { s.count = 0; }, 1500);
    if (s.count >= 7) {
      s.count = 0;
      if (s.timer) clearTimeout(s.timer);
      toast.success("Admin portal unlocked");
      nav({ to: "/admin-setup" });
    }
  };
  const [settings, setSettings] = useState<{ primary_agent_name: string; solo_amount: number; pair_amount: number } | null>(null);
  useEffect(() => {
    supabase.from("app_settings").select("primary_agent_name, solo_amount, pair_amount").eq("id", true).maybeSingle()
      .then(({ data }) => data && setSettings(data as any));
  }, []);
  const DEFAULT_AGENT_PLACEHOLDER = "Contact admin for agent details";
  const agentRaw = settings?.primary_agent_name?.trim();
  const agent = agentRaw && agentRaw !== DEFAULT_AGENT_PLACEHOLDER ? agentRaw : null;
  const solo = settings?.solo_amount ?? 5;
  const pair = settings?.pair_amount ?? 8;
  return (
    <div className="min-h-screen bg-hero">
      <AppHeader />
      <main>
        {/* HERO */}
        <section className="container mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs text-secondary mb-6">
            <Zap className="h-3 w-3" /> Built from real National Diploma past papers
          </div>
          <img
            src={logo}
            alt="Power Electronics 1 logo"
            onClick={handleLogoTap}
            className="mx-auto h-28 w-auto mb-6 drop-shadow-[0_0_60px_rgba(99,102,241,0.55)] cursor-pointer select-none"
          />
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white">
            Master Power Electronics.<br />
            <span className="text-brand-gradient">Ace your exam with confidence.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-white/80">
            Every concept that has ever appeared in your exam, rebuilt as flip-cards your brain actually remembers.
            <strong className="text-white"> Full topic content is available once access is approved.</strong> No card. No setup. No catch.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-brand-gradient text-primary-foreground shadow-glow text-base">
              <Link to="/request-access"><UserPlus className="h-4 w-4 mr-1" /> Request Access</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10 hover:text-white">
              <Link to="/sign-in"><KeyRound className="h-4 w-4 mr-1" /> I have a code</Link>
            </Button>
            <InstallAppButton />

          </div>
          <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-white/70">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-secondary" /> No subscription</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-secondary" /> No exam dates, ever</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-secondary" /> Works offline once installed</span>
          </div>
          {/* SOCIAL PROOF BAR */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 backdrop-blur">
            <span className="flex items-center gap-1 text-sm text-white">
              <span className="flex text-yellow-400">{[0,1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}</span>
              <strong className="ml-1">4.9 / 5</strong>
              <span className="text-white/70">from students</span>
            </span>
            <span className="h-4 w-px bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-1 text-sm text-white">
              <Users className="h-4 w-4 text-secondary" />
              <strong>1,318</strong>
              <span className="text-white/70">users preparing now · join the race</span>
            </span>
          </div>
        </section>

        {/* PAIN _ AGITATE */}
        <section className="container mx-auto px-4 py-12">
          <Card className="p-8 md:p-12 bg-card text-card-foreground shadow-card-elev">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Power Electronics concepts tested year after year.</h2>
                <p className="text-muted-foreground">
                  Thyristors, diodes, and rectifiers. Gate triggering and commutation. DC-DC and AC-DC conversion.
                  Thermal management and snubber design. Protection circuits. The same exam-tested topics delivered in exam format.
                </p>
                <p className="mt-4 font-semibold">
                  The students who pass aren't smarter. <span className="text-brand-gradient">They've just seen the questions before.</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { i: Brain, n: "400+", l: "exam questions with answers" },
                  { i: Trophy, n: "100%", l: "professional LaTeX formatting" },
                  { i: Clock, n: "20 min", l: "daily revision is enough" },
                  { i: BookOpen, n: "5", l: "exam papers covered" },
                ].map(({ i: Icon, n, l }) => (
                  <div key={l} className="rounded-xl border border-black/20 p-4 text-center bg-white">
                    <Icon className="h-5 w-5 mx-auto text-secondary mb-2" />
                    <p className="text-2xl font-bold text-black">{n}</p>
                    <p className="text-xs text-black mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* HOW */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">From confused to confident in 3 steps</h2>
          <p className="text-center text-white/70 mb-10">No downloads required. No setup. Open and revise.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { i: Sparkles, t: "1. Request access", d: "Enter your full name and WhatsApp number. Admin approves your request." },
              { i: KeyRound, t: "2. Pay an agent", d: `Hand over $${solo} (solo) or $${pair} (two of you together) to an authorised agent. Agent notifies admin after payment.` },
              { i: Cpu, t: "3. Get access code", d: "Admin sends your access code via agent or WhatsApp. Sign in with your full name + code, every card unlocks. Install to your phone and revise offline." },
            ].map(({ i: Icon, t, d }) => (
              <Card key={t} className="p-6 bg-card text-card-foreground shadow-card-elev hover:border-secondary transition border-2 border-transparent">
                <div className="h-12 w-12 rounded-lg bg-brand-gradient flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{t}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{d}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* PRICE */}
        <section className="container mx-auto px-4 py-12">
          <Card className="p-10 bg-card text-card-foreground shadow-card-elev">
            <h2 className="text-3xl font-bold text-center">Cheaper than a rewrite.</h2>
            <p className="text-center text-muted-foreground mt-2">Pay once. Keep access till end of exam. No monthly anything.</p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="rounded-xl border-2 border-border p-6 text-center">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Solo</p>
                <p className="text-5xl font-bold mt-2">${solo}</p>
                <p className="text-sm text-muted-foreground mt-2">One individual, full access</p>
              </div>
              <div className="rounded-xl border-2 border-secondary p-6 text-center bg-secondary/5 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-semibold">BEST VALUE</span>
                <p className="text-sm uppercase tracking-wider text-secondary">Pair (sign up together)</p>
                <p className="text-5xl font-bold mt-2">${pair}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Two new users, registered together. Save together when you sign up as a pair.
                </p>
              </div>
            </div>
            <p className="text-center mt-6 text-sm text-muted-foreground">Pay any authorised agent in cash. No card. No online payment.</p>
            <div className="mt-6 rounded-lg border border-secondary/40 bg-secondary/5 p-4 flex items-center justify-center gap-2 text-sm text-center">
              <UserCheck className="h-4 w-4 text-secondary shrink-0" />
              {agent ? (
                <span className="text-foreground inline-flex items-center justify-center gap-2 flex-wrap">
                  <span>Authorised agent: <strong>{agent}</strong></span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-secondary/50 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified ZIM Agent
                  </span>
                </span>
              ) : <span className="text-muted-foreground">Admin will name your authorised agent after you submit a request.</span>}
            </div>
          </Card>
        </section>




        {/* TRUST */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { i: BookOpen, t: "Real exam content", d: "Five full past paper sets, model answers verified." },
              { i: Download, t: "Install on phone", d: "Add to home screen, revise even offline." },
              { i: Mail, t: "Real human support", d: "powerelectronics1@gmail.com" },
            ].map(({ i: Icon, t, d }) => (
              <Card key={t} className="p-4 bg-card text-card-foreground">
                <Icon className="h-5 w-5 text-secondary mb-2" />
                <p className="font-semibold">{t}</p>
                <p className="text-xs text-muted-foreground mt-1">{d}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-2 text-white">What students say</h2>
          <p className="text-center text-white/70 mb-10">Real results from students who stopped guessing and started revising.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Tariro M.", badge: "+27%", quote: "Smashed two mock papers in a weekend. The AI tutor is unreal." },
              { name: "Bongani K.", badge: "Top 5%", quote: "Finally understood PID tuning. Worth way more than $3." },
              { name: "Aisha R.", badge: "Distinction", quote: "Past papers + practice in one place. Saved my finals." },
            ].map((t) => (
              <Card key={t.name} className="p-6 bg-card text-card-foreground shadow-card-elev">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-gradient flex items-center justify-center text-primary-foreground font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{t.name}</p>
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full mt-0.5">
                        {t.badge}
                      </span>
                    </div>
                  </div>
                  <div className="flex text-yellow-500">
                    {[0,1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">"{t.quote}"</p>
              </Card>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Your future self is begging you to start.</h2>
          <p className="text-white/70 mt-3 max-w-xl mx-auto">5 free cards per topic. No code needed. Click. Request access. Revise.</p>
          <Button asChild size="lg" className="mt-6 bg-brand-gradient text-primary-foreground shadow-glow">
            <Link to="/request-access">Request Access</Link>
          </Button>
        </section>
      </main>
      <footer className="border-t border-border/40 mt-6 py-8 text-center text-sm text-white/60">
        © Power Electronics 1. Master the circuit. Control the power. Ace the exam.
      </footer>
    </div>
  );
}
