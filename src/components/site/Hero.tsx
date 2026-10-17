import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, Activity, Brain, Shield, Zap } from "lucide-react";
import heroImg from "@/assets/hero-ai-health.jpg";
import { useRef, useEffect } from "react";

/* ── Floating particle component ── */
function Particle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-primary/40"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -30, 0],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ── Stat card with counter animation ── */
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl blur-sm group-hover:blur-md transition-all duration-300" />
      <div className="relative p-3 rounded-xl border border-primary/10 bg-background/50 backdrop-blur-sm">
        <dt className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {value}
        </dt>
        <dd className="text-[11px] text-muted-foreground mt-0.5 font-medium tracking-wide uppercase">{label}</dd>
      </div>
    </motion.div>
  );
}

/* ── Pill badge ── */
function Badge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-xs text-muted-foreground mb-6"
    >
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="font-medium">{text}</span>
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

/* ── 3D tilt card wrapper ── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  const brightness = useSpring(useTransform(x, [-0.5, 0.5], [0.95, 1.05]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, filter: useTransform(brightness, v => `brightness(${v})`), transformStyle: "preserve-3d", perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Floating info chip ── */
function FloatingChip({
  icon: Icon,
  label,
  value,
  color,
  position,
  delay,
  floatY,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  position: string;
  delay: number;
  floatY: number[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: floatY }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`absolute ${position} glass rounded-2xl p-3.5 shadow-lg border border-white/10 backdrop-blur-md hidden sm:block z-10`}
      style={{ transform: "translateZ(40px)" }}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <p className="text-sm font-bold leading-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Grid lines background ── */
function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
    </div>
  );
}

/* ── Radial glow ── */
function RadialGlow() {
  return (
    <>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(160 80% 50% / 0.25) 0%, transparent 70%)" }}
      />
    </>
  );
}

export function Hero() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    delay: i * 0.4,
  }));

  return (
    <section
      id="top"
      className="relative pt-28 pb-24 overflow-hidden bg-background"
      style={{ perspective: "1200px" }}
    >
      <GridLines />
      <RadialGlow />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-16 items-center">
        {/* ── LEFT COLUMN ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Badge icon={Sparkles} text="Predictive analytics for youth mental health" />

          {/* Headline with stagger */}
          <div className="overflow-hidden">
            {["AI-Powered", "Mental Health", "Prediction"].map((word, i) => (
              <motion.h1
                key={word}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={`block text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight ${
                  i === 2
                    ? "bg-gradient-to-r from-primary via-primary/80 to-emerald-400 bg-clip-text text-transparent"
                    : ""
                }`}
              >
                {word}
              </motion.h1>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed"
          >
            Using Machine Learning to identify early signs of depression, anxiety, and sleep disorders — combining behavioral, wearable, and lifestyle signals into trustworthy clinical insight.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <motion.a
              href="#about"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
            >
              Explore research
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.a>

            <motion.a
              href="#predict"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-primary/20 bg-primary/5 hover:bg-primary/10 backdrop-blur-sm transition-colors"
            >
              <Activity className="w-4 h-4 text-primary" />
              Try prediction model
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 grid grid-cols-3 gap-3 max-w-xs"
          >
            <StatCard value="92.4%" label="Accuracy" delay={0.85} />
            <StatCard value="3" label="ML models" delay={0.95} />
            <StatCard value="12k+" label="Samples" delay={1.05} />
          </motion.dl>
        </motion.div>

        {/* ── RIGHT COLUMN — 3D Card ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Ambient glow behind card */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -inset-8 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, hsl(160 80% 50% / 0.1) 50%, transparent 80%)" }}
          />

          <TiltCard className="relative">
            {/* Main image card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ transform: "translateZ(0px)" }}>
              <img
                src={heroImg}
                alt="Neural network brain visualization for AI mental health prediction"
                width={1280}
                height={1024}
                className="w-full h-auto"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

              {/* Bottom inline badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-background/80 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10"
                style={{ transform: "translateZ(20px)" }}
              >
                <span className="text-xs font-medium text-muted-foreground">Live prediction engine</span>
                <div className="flex items-center gap-1.5">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs font-semibold text-emerald-400">Online</span>
                </div>
              </motion.div>
            </div>

            {/* Floating chip — top right */}
            <FloatingChip
              icon={Brain}
              label="Model confidence"
              value="94.1%"
              color="bg-primary"
              position="-top-5 -right-6"
              delay={1.1}
              floatY={[0, -8, 0]}
            />

            {/* Floating chip — bottom left */}
            <FloatingChip
              icon={Shield}
              label="Risk detected"
              value="Low"
              color="bg-emerald-500"
              position="-bottom-5 -left-6"
              delay={1.3}
              floatY={[0, 8, 0]}
            />

            {/* Floating chip — middle right */}
            <FloatingChip
              icon={Zap}
              label="Response time"
              value="0.3s"
              color="bg-amber-500"
              position="top-1/2 -right-8"
              delay={1.5}
              floatY={[0, -6, 0]}
            />
          </TiltCard>

          {/* Progress bar card */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute -bottom-8 right-4 glass rounded-2xl p-4 shadow-xl border border-white/10 backdrop-blur-md w-48 hidden md:block"
            style={{ transform: "translateZ(30px)" }}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Model confidence</p>
            <p className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">94.1%</p>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94%" }}
                transition={{ delay: 1.6, duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
              />
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}