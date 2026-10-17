import { Brain, HeartPulse, Activity, LineChart } from "lucide-react";

const items = [
  { icon: Brain, label: "Random Forest", desc: "Ensemble decision learner" },
  { icon: LineChart, label: "Logistic Regression", desc: "Probabilistic baseline" },
  { icon: Activity, label: "Decision Tree", desc: "Interpretable splits" },
  
];

export function About() {
  return (
    <section id="about" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary mb-3">About the research</p>
          <h2 className="text-3xl md:text-5xl font-semibold">
            Detecting youth mental health risks before they become crises.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Our study applies supervised Machine Learning — Random Forest, Logistic
            Regression, and Decision Trees — across behavioral, physiological,
            lifestyle, wearable, and social media data to predict depression,
            anxiety, and sleep disorders in adolescents and young adults.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div
              key={it.label}
              className="group rounded-2xl p-6 bg-card shadow-soft hover:shadow-elegant hover:-translate-y-1 transition border border-border"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow group-hover:scale-110 transition">
                <it.icon className="w-5 h-5" />
              </div>
              <div className="mt-4 font-display font-semibold">{it.label}</div>
              <div className="text-sm text-muted-foreground mt-1">{it.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { v: "12,480", l: "Participants analyzed" },
            { v: "47", l: "Behavioral & wearable features" },
            { v: "0.93", l: "Best ROC-AUC (Random Forest)" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl p-6 glass"
            >
              <div className="text-3xl font-display font-semibold text-gradient">
                {s.v}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
