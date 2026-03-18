import { useEffect, useRef, useState } from "react";
import {
  Video, Calendar, FileText, Bot,
  UserCog, Brain, CheckCircle, ArrowUpRight,
  Shield, Zap, Clock, Star,
} from "lucide-react";

/* ── Intersection-observer hook ─────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Animated number ────────────────────────────────── */
function AnimNum({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.5);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 50;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 28);
    return () => clearInterval(id);
  }, [inView, target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Data ────────────────────────────────────────────── */
const TILES = [
  {
    num: "01", icon: Video,
    title: "Video Consult",
    desc: "HD face-to-face calls with licensed specialists. Prescription issued instantly.",
    gradient: "from-blue-500 to-blue-600",
    glow: "rgba(37,99,235,0.18)",
    chip: "Most popular",
  },
  {
    num: "02", icon: Calendar,
    title: "Book Appointments",
    desc: "Real-time slot availability. Calendar sync & automated reminders.",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(124,58,237,0.18)",
    chip: null,
  },
  {
    num: "03", icon: FileText,
    title: "Health Records",
    desc: "All reports, prescriptions & notes — organised in a searchable timeline.",
    gradient: "from-cyan-500 to-sky-600",
    glow: "rgba(8,145,178,0.18)",
    chip: null,
  },
  {
    num: "04", icon: Bot,
    title: "AI Assistant",
    desc: "Describe symptoms for an instant triage before your doctor visit.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(5,150,105,0.18)",
    chip: "Powered by AI",
  },
];

const DEEP = [
  {
    icon: UserCog,
    tag: "Consultations",
    title: "Expert doctors,\non demand",
    desc: "Every doctor on MedConnect is verified, credentialed, and reviewed by real patients.",
    bullets: ["HD video & voice calls", "Secure in-app messaging", "Digital prescriptions"],
    gradient: "from-blue-500 to-indigo-600",
    chipColor: "#2563EB",
  },
  {
    icon: Brain,
    tag: "AI Symptom Check",
    title: "Know before\nyou go",
    desc: "Our AI surfaces the most likely conditions so your consultation is faster and sharper.",
    bullets: ["Instant assessment, no wait", "Personalised health insights", "Seamless handoff to a doctor"],
    gradient: "from-violet-500 to-purple-600",
    chipColor: "#7C3AED",
  },
  {
    icon: Shield,
    tag: "Privacy & Security",
    title: "Your data,\nalways safe",
    desc: "HIPAA-compliant infrastructure with end-to-end encryption on every consultation.",
    bullets: ["End-to-end encryption", "Zero third-party data sharing", "SOC-2 Type II certified"],
    gradient: "from-cyan-500 to-blue-600",
    chipColor: "#0891B2",
  },
];

const STATS = [
  { icon: UserCog, value: 1200, suffix: "+", label: "Verified Doctors" },
  { icon: Star, value: 98, suffix: "%", label: "Patient Satisfaction" },
  { icon: Clock, value: 5, suffix: "m", label: "Avg. Wait Time" },
  { icon: Zap, value: 50, suffix: "k+", label: "Consultations Done" },
];

/* ── Tile card ──────────────────────────────────────── */
function Tile({ num, icon: Icon, title, desc, gradient, glow, chip, index }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="group relative flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 overflow-hidden
                 cursor-default transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.55s ${index * 0.1}s ease, transform 0.55s ${index * 0.1}s ease, box-shadow 0.3s ease`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 20px 60px ${glow}, 0 4px 16px rgba(0,0,0,0.08)`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)")}
    >
      {/* number watermark */}
      <span className="absolute top-4 right-5 font-mono text-5xl font-black text-gray-100 select-none pointer-events-none leading-none">
        {num}
      </span>

      {/* chip */}
      {chip && (
        <div className={`self-start text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-gradient-to-r ${gradient} text-white`}>
          {chip}
        </div>
      )}

      {/* icon */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg
                       transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <div>
        <h3 className="text-gray-900 font-bold text-base mb-1.5 leading-snug">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>

      {/* animated bottom bar */}
      <div className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r ${gradient} rounded-full
                       w-0 group-hover:w-full transition-all duration-500`} />
    </div>
  );
}

/* ── Deep card ──────────────────────────────────────── */
function DeepCard({ icon: Icon, tag, title, desc, bullets, gradient, chipColor, index }) {
  const [ref, inView] = useInView();
  const lines = title.split("\n");

  return (
    <div
      ref={ref}
      className="group relative flex flex-col justify-between p-8 rounded-3xl bg-white border border-gray-100 overflow-hidden
                 cursor-default transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ${index * 0.12}s ease, transform 0.6s ${index * 0.12}s ease`,
      }}
    >
      {/* background blob */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07]
                    transition-all duration-500 group-hover:opacity-[0.14] group-hover:scale-110`}
      />

      <div>
        {/* tag pill */}
        <span
          className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-5 border"
          style={{ color: chipColor, borderColor: chipColor + "40", background: chipColor + "10" }}
        >
          {tag}
        </span>

        {/* icon */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg
                         transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* title */}
        <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-4">
          {lines.map((l, i) => <span key={i} className="block">{l}</span>)}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed mb-7">{desc}</p>

        {/* bullets */}
        <ul className="space-y-3">
          {bullets.map(b => (
            <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
              <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                <CheckCircle className="w-3 h-3 text-white" />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* "Learn more" footer */}
      <button
        className="mt-8 self-start inline-flex items-center gap-1.5 text-sm font-semibold group/btn transition-all duration-200"
        style={{ color: chipColor }}
      >
        Learn more
        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
      </button>
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────── */
function StatCard({ icon: Icon, value, suffix, label }) {
  const [ref, inView] = useInView(0.4);
  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-white border border-gray-100
                 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-1">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <p className="text-3xl font-black text-gray-900 tracking-tight">
        {inView ? <AnimNum target={value} suffix={suffix} /> : `0${suffix}`}
      </p>
      <p className="text-xs text-gray-500 font-medium text-center">{label}</p>
    </div>
  );
}

/* ── Root ───────────────────────────────────────────── */
export default function FeaturesGrid() {
  return (
    <section id="features" className="py-4">

      {/* ══ SECTION HEADER ══════════════════════════════════ */}
      <div className="text-center mb-16">
        <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-4">
          What we offer
        </p>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
          Everything you need,<br className="hidden sm:block" />
          <span className="bg-[#4a90e2]  bg-clip-text text-transparent"> in one place</span>
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto text-base leading-relaxed">
          From booking a consultation to reviewing your health records — MedConnect handles it all, seamlessly.
        </p>
      </div>

      {/* ══ STATS ROW ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ══ CORE SERVICE TILES (4-col) ══════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
        {TILES.map((t, i) => <Tile key={t.num} {...t} index={i} />)}
      </div>

      {/* ══ DIVIDER ════════════════════════════════════════ */}
      <div className="flex items-center gap-4 mb-20">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200" />
        <span className="text-xs font-bold tracking-widest uppercase text-gray-400">How it works deeper</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200" />
      </div>

      {/* ══ DEEP FEATURE CARDS (3-col) ══════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {DEEP.map((d, i) => <DeepCard key={d.tag} {...d} index={i} />)}
      </div>

    </section>
  );
}