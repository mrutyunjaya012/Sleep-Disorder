import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Brain,
  Moon,
  HeartPulse,
  User,
  Activity,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";

type Result = {
  sleep_disorder: {
    prediction: string;
    risk: number;
    confidence: number;
  };

  anxiety: {
    prediction: string;
    risk: number;
    confidence: number;
  };

  depression: {
    prediction: string;
    risk: number;
    confidence: number;
  };
};

type FormState = {
  // Personal
  age: number | "";
  gender: string;
  heightCm: number | "";
  weightKg: number | "";
  // Sleep
  sleepHours: number;
  sleepQuality: number;
  bedtimeRegularity: number;
  awakenings: number;
  // Lifestyle
  stress: number;
  anxietyScore: number;
  moodScore: number;
  activityMinutes: number;
  screenTimeHours: number;
  socialMediaHours: number;
  caffeineCups: number;
  alcohol: string;
  smoking: string;
  diet: string;
  socialSupport: number;
  // Vitals (wearable)
  restingHr: number;
  hrv: number;
  spo2: number;
  steps: number;
};

const DEFAULTS: FormState = {
  age: 21,
  gender: "Male",
  heightCm: 170,
  weightKg: 65,
  sleepHours: 6,
  sleepQuality: 6,
  bedtimeRegularity: 5,
  awakenings: 1,
  stress: 6,
  anxietyScore: 5,
  moodScore: 6,
  activityMinutes: 30,
  screenTimeHours: 5,
  socialMediaHours: 3,
  caffeineCups: 2,
  alcohol: "Occasionally",
  smoking: "Never",
  diet: "Balanced",
  socialSupport: 6,
  restingHr: 72,
  hrv: 55,
  spo2: 98,
  steps: 6500,
};

// function predict(f: FormState): Result {
//   const sleepDeficit = Math.max(0, 8 - f.sleepHours);
//   const lowQuality = 10 - f.sleepQuality;
//   const lowSupport = 10 - f.socialSupport;
//   const lowMood = 10 - f.moodScore;
//   const inactivity = Math.max(0, 60 - f.activityMinutes) / 60;

//   const dep =
//     f.stress * 5 +
//     lowMood * 6 +
//     sleepDeficit * 5 +
//     lowSupport * 4 +
//     f.socialMediaHours * 2 +
//     inactivity * 8 +
//     (f.hrv < 40 ? 8 : 0);

//   const anx =
//     f.anxietyScore * 7 +
//     f.stress * 4 +
//     f.caffeineCups * 2 +
//     f.screenTimeHours * 1.5 +
//     (f.restingHr > 85 ? 8 : 0) +
//     lowSupport * 2;

//   const slp =
//     sleepDeficit * 8 +
//     lowQuality * 5 +
//     f.awakenings * 4 +
//     (10 - f.bedtimeRegularity) * 3 +
//     f.caffeineCups * 2 +
//     f.screenTimeHours * 1.2;

//   const clamp = (n: number) => Math.max(4, Math.min(97, Math.round(n)));
//   return { depression: clamp(dep), anxiety: clamp(anx), sleep: clamp(slp) };
// }
const API_URL = "http://127.0.0.1:8004/predict";
const steps = [
  { id: "personal", label: "Personal", icon: User },
  { id: "sleep", label: "Sleep", icon: Moon },
  { id: "lifestyle", label: "Lifestyle", icon: Activity },
  { id: "vitals", label: "Vitals", icon: Stethoscope },
] as const;

const inputCls =
  "w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <span className="mt-1 block text-xs text-muted-foreground/80">
          {hint}
        </span>
      )}
    </label>
  );
}

function Range({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-primary"
    />
  );
}

export function Predict() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const bmi = useMemo(() => {
    const h = Number(form.heightCm);
    const w = Number(form.weightKg);
    if (!h || !w) return null;
    const m = h / 100;
    return +(w / (m * m)).toFixed(1);
  }, [form.heightCm, form.weightKg]);

  const progress = ((stepIdx + 1) / steps.length) * 100;
  const isLast = stepIdx === steps.length - 1;

const next = async () => {

  if (!isLast) {
    setStepIdx((i) => i + 1);
    return;
  }

  if (!form.gender) {
    alert("Please select gender before running prediction.");
    return;
  }

  try {

    const payload = {

      age: Number(form.age),

      gender: form.gender.toLowerCase(),

      height: Number(form.heightCm),

      weight: Number(form.weightKg),

      bmi: bmi || 0,

      sleep_duration: form.sleepHours,

      sleep_quality: form.sleepQuality,

      bedtime_regularity: form.bedtimeRegularity,

      night_awakenings: form.awakenings,

      stress_level: form.stress,

      anxiety_score: form.anxietyScore,

      mood_score: form.moodScore,

      physical_activity: form.activityMinutes,

      screen_time: form.screenTimeHours,

      social_media: form.socialMediaHours,

      caffeine: form.caffeineCups,

      social_support: form.socialSupport,

      alcohol_use: form.alcohol.toLowerCase(),

      smoking: form.smoking.toLowerCase(),

      diet_quality: form.diet.toLowerCase(),

      resting_heart_rate: form.restingHr,

      heart_rate_variability: form.hrv,

      spo2: form.spo2,

      daily_steps: form.steps,
    };

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log(data);

    setResult(data);

    const el = document.getElementById("risk-result");

    el?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });

  } catch (error) {

    console.error(error);

    alert("Prediction failed. Backend not running.");

  }
};

  const reset = () => {
    setForm(DEFAULTS);
    setStepIdx(0);
    setResult(null);
  };

  return (
    <section id="predict" className="py-24 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-medium text-primary mb-3">Live demo</p>
          <h2 className="text-3xl md:text-5xl font-semibold">
            Try the prediction model
          </h2>
          <p className="mt-4 text-muted-foreground">
            Provide self-reported lifestyle and wearable inputs across four
            stages. The model returns a simulated risk profile for depression,
            anxiety, and sleep disorders.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-6 md:p-8 shadow-soft">
            {/* Stepper */}
            <div className="mb-6">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === stepIdx;
                  const done = i < stepIdx;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStepIdx(i)}
                      className={`flex flex-col items-center gap-1.5 text-xs font-medium transition ${
                        active
                          ? "text-primary"
                          : done
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full grid place-items-center border ${
                          active
                            ? "border-primary bg-primary/10"
                            : done
                              ? "border-primary/40 bg-primary/5"
                              : "border-border bg-background"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              className="space-y-6"
            >
              {stepIdx === 0 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Age" hint="Range: 13–35 years">
                    <input
                      type="number"
                      min={13}
                      max={35}
                      className={inputCls}
                      value={form.age}
                      onChange={(e) =>
                        update(
                          "age",
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      className={inputCls}
                      value={form.gender}
                      onChange={(e) => update("gender", e.target.value)}
                    >
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </Field>
                  <Field label="Height (cm)" hint="Range: 120–220 cm">
                    <input
                      type="number"
                      min={120}
                      max={220}
                      className={inputCls}
                      value={form.heightCm}
                      onChange={(e) =>
                        update(
                          "heightCm",
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                  <Field label="Weight (kg)" hint="Range: 30–200 kg">
                    <input
                      type="number"
                      min={30}
                      max={200}
                      className={inputCls}
                      value={form.weightKg}
                      onChange={(e) =>
                        update(
                          "weightKg",
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                  <Field
                    label="BMI (auto-calculated)"
                    hint="Healthy range: 18.5–24.9"
                  >
                    <input
                      readOnly
                      className={`${inputCls} bg-muted/40`}
                      value={bmi ?? ""}
                      placeholder="—"
                    />
                  </Field>
                </div>
              )}

              {stepIdx === 1 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={`Sleep duration: ${form.sleepHours}h / night`}>
                    <Range
                      value={form.sleepHours}
                      onChange={(n) => update("sleepHours", n)}
                      min={2}
                      max={12}
                    />
                  </Field>
                  <Field label={`Sleep quality: ${form.sleepQuality}/10`}>
                    <Range
                      value={form.sleepQuality}
                      onChange={(n) => update("sleepQuality", n)}
                    />
                  </Field>
                  <Field
                    label={`Bedtime regularity: ${form.bedtimeRegularity}/10`}
                    hint="How consistent is your sleep schedule?"
                  >
                    <Range
                      value={form.bedtimeRegularity}
                      onChange={(n) => update("bedtimeRegularity", n)}
                    />
                  </Field>
                  <Field
                    label={`Night awakenings: ${form.awakenings}`}
                    hint="Average times you wake up per night"
                  >
                    <Range
                      value={form.awakenings}
                      onChange={(n) => update("awakenings", n)}
                      min={0}
                      max={8}
                    />
                  </Field>
                </div>
              )}

              {stepIdx === 2 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={`Stress level: ${form.stress}/10`}>
                    <Range
                      value={form.stress}
                      onChange={(n) => update("stress", n)}
                    />
                  </Field>
                  <Field label={`Anxiety score: ${form.anxietyScore}/10`}>
                    <Range
                      value={form.anxietyScore}
                      onChange={(n) => update("anxietyScore", n)}
                    />
                  </Field>
                  <Field label={`Mood score: ${form.moodScore}/10`}>
                    <Range
                      value={form.moodScore}
                      onChange={(n) => update("moodScore", n)}
                    />
                  </Field>
                  <Field
                    label={`Physical activity: ${form.activityMinutes} min/day`}
                  >
                    <Range
                      value={form.activityMinutes}
                      onChange={(n) => update("activityMinutes", n)}
                      min={0}
                      max={180}
                      step={5}
                    />
                  </Field>
                  <Field label={`Screen time: ${form.screenTimeHours}h / day`}>
                    <Range
                      value={form.screenTimeHours}
                      onChange={(n) => update("screenTimeHours", n)}
                      min={0}
                      max={16}
                    />
                  </Field>
                  <Field
                    label={`Social media: ${form.socialMediaHours}h / day`}
                  >
                    <Range
                      value={form.socialMediaHours}
                      onChange={(n) => update("socialMediaHours", n)}
                      min={0}
                      max={12}
                    />
                  </Field>
                  <Field label={`Caffeine: ${form.caffeineCups} cups/day`}>
                    <Range
                      value={form.caffeineCups}
                      onChange={(n) => update("caffeineCups", n)}
                      min={0}
                      max={8}
                    />
                  </Field>
                  <Field label={`Social support: ${form.socialSupport}/10`}>
                    <Range
                      value={form.socialSupport}
                      onChange={(n) => update("socialSupport", n)}
                    />
                  </Field>
                  <Field label="Alcohol use">
                    <select
                      className={inputCls}
                      value={form.alcohol}
                      onChange={(e) => update("alcohol", e.target.value)}
                    >
                      <option>Never</option>
                      <option>Occasionally</option>
                      <option>Weekly</option>
                      <option>Daily</option>
                    </select>
                  </Field>
                  <Field label="Smoking">
                    <select
                      className={inputCls}
                      value={form.smoking}
                      onChange={(e) => update("smoking", e.target.value)}
                    >
                      <option>Never</option>
                      <option>Former</option>
                      <option>Occasional</option>
                      <option>Daily</option>
                    </select>
                  </Field>
                  <Field label="Diet quality">
                    <select
                      className={inputCls}
                      value={form.diet}
                      onChange={(e) => update("diet", e.target.value)}
                    >
                      <option>Poor</option>
                      <option>Average</option>
                      <option>Balanced</option>
                      <option>Excellent</option>
                    </select>
                  </Field>
                </div>
              )}

              {stepIdx === 3 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Resting heart rate (bpm)"
                    hint="Typical: 60–100 bpm"
                  >
                    <input
                      type="number"
                      min={40}
                      max={140}
                      className={inputCls}
                      value={form.restingHr}
                      onChange={(e) =>
                        update("restingHr", Number(e.target.value))
                      }
                    />
                  </Field>
                  <Field
                    label="Heart rate variability (ms)"
                    hint="Healthy youth: 40–80 ms"
                  >
                    <input
                      type="number"
                      min={10}
                      max={150}
                      className={inputCls}
                      value={form.hrv}
                      onChange={(e) => update("hrv", Number(e.target.value))}
                    />
                  </Field>
                  <Field label="SpO₂ (%)" hint="Normal: 95–100%">
                    <input
                      type="number"
                      min={80}
                      max={100}
                      className={inputCls}
                      value={form.spo2}
                      onChange={(e) => update("spo2", Number(e.target.value))}
                    />
                  </Field>
                  <Field
                    label="Daily steps"
                    hint="Wearable 7-day average"
                  >
                    <input
                      type="number"
                      min={0}
                      max={40000}
                      step={100}
                      className={inputCls}
                      value={form.steps}
                      onChange={(e) => update("steps", Number(e.target.value))}
                    />
                  </Field>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    stepIdx === 0 ? reset() : setStepIdx((i) => i - 1)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary transition"
                >
                  {stepIdx === 0 ? (
                    <>
                      <RotateCcw className="w-4 h-4" /> Reset
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4" /> Back
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95 transition"
                >
                  {isLast ? (
                    <>
                      <Sparkles className="w-4 h-4" /> Run prediction
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div
            id="risk-result"
            className="lg:col-span-2 rounded-2xl glass p-6 shadow-soft h-fit lg:sticky lg:top-24"
          >
            <div className="text-xs text-muted-foreground">
              Prediction result
            </div>
            <div className="font-display font-semibold mt-1">Risk profile</div>
            <div className="space-y-5 mt-6">
             {[
  {
    icon: Brain,
    label: "Depression",
    value: result?.depression?.risk,
    prediction: result?.depression?.prediction,
  },

  {
    icon: HeartPulse,
    label: "Anxiety",
    value: result?.anxiety?.risk,
    prediction: result?.anxiety?.prediction,
  },

  {
    icon: Moon,
    label: "Sleep disorder",
    value: result?.sleep_disorder?.risk,
    prediction: result?.sleep_disorder?.prediction,
  },
].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="inline-flex items-center gap-2">
                      <r.icon className="w-4 h-4 text-primary" />
                      {r.label}
                    </span>
                    <div className="text-right">
  <div className="font-medium tabular-nums">
    {r.value != null ? `${r.value}%` : "—"}
  </div>

  <div className="text-[11px] text-muted-foreground">
    {r.prediction || ""}
  </div>
</div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: r.value != null ? `${r.value}%` : 0 }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-mint"
                    />
                  </div>
                </div>
              ))}
            </div>
            {result && (
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "BMI", v: bmi ?? "—" },
                  { k: "HRV", v: `${form.hrv}ms` },
                  { k: "Steps", v: form.steps.toLocaleString() },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-xl bg-background/60 border border-border px-2 py-2"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.k}
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-6 text-xs text-muted-foreground">
              {result
                ? "Demonstration output from a simulated model surface — not a clinical diagnosis."
                : "Complete all four stages and run the model to populate your risk profile."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
