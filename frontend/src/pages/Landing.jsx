import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Zap, Shield, Sparkles, ArrowUpRight } from 'lucide-react';
import logoIcon  from '../assets/logo.png';
import logoTitle from '../assets/logo-titulo.png';

function BrandMark() {
  return (
    <div className="inline-flex items-center gap-2">
      <img src={logoIcon} alt="TaskFlow" className="w-8 h-5" />
      <span className="text-[20px] font-semibold tracking-tight text-ink">TaskFlow</span>
    </div>
  );
}

function KanbanPreview() {
  const cols = [
    {
      title: 'To Do', color: '#94a3b8',
      cards: [
        { title: 'Auditar accesibilidad',    border: '#ef4444' },
        { title: 'Mover navegación a CMS',   border: '#fbbf24' },
        { title: 'Feedback de ventas',        border: '#34d399' },
      ],
    },
    {
      title: 'In Progress', color: '#818cf8',
      cards: [
        { title: 'Página de pricing v2',     border: '#ef4444' },
        { title: 'Componentes del header',   border: '#fbbf24' },
      ],
    },
    {
      title: 'Done', color: '#34d399',
      cards: [
        { title: 'Validar paleta con marca', border: '#fbbf24', done: true },
        { title: 'Bocetos de la home',        border: '#34d399', done: true },
      ],
    },
  ];
  return (
    <div className="w-[820px] max-w-full rounded-2xl bg-chrome border border-border overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
      <div className="h-9 px-3 border-b border-border flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <div className="ml-4 text-[11px] text-mute">taskflow.app/projects/web-redesign</div>
      </div>
      <div className="grid grid-cols-3 gap-3 p-3 bg-bg">
        {cols.map(col => (
          <div key={col.title} className="rounded-xl bg-bg/40 border border-border p-2.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-[12px] font-semibold" style={{ color: col.color }}>{col.title}</span>
            </div>
            <div className="flex flex-col gap-2">
              {col.cards.map((c, i) => (
                <div key={i} className="rounded-lg bg-surface border border-border p-2.5 pl-3"
                  style={{ borderLeftWidth: 3, borderLeftColor: c.border }}>
                  <div className={`text-[12px] leading-tight ${c.done ? 'text-mute line-through' : 'text-ink'}`}>
                    {c.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, color, title, description }) {
  return (
    <article className="rounded-xl bg-surface border border-border p-5 hover:border-indigo-500/60 transition-colors">
      <div className="w-10 h-10 rounded-lg grid place-items-center mb-3.5"
        style={{ background: `${color}1a`, color }}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-[14.5px] font-semibold text-ink mb-1.5">{title}</h3>
      <p className="text-[13px] text-mute leading-relaxed">{description}</p>
    </article>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Nav */}
      <nav className="h-16 px-6 flex items-center gap-6 border-b border-border bg-chrome/60 backdrop-blur sticky top-0 z-20">
        <BrandMark />
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login"
            className="h-9 px-3.5 text-[13px] inline-flex items-center rounded-lg hover:bg-white/5 text-ink/80 font-medium transition-colors">
            Iniciar sesión
          </Link>
          <Link to="/register"
            className="h-9 px-3.5 text-[13px] inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors shadow-[0_8px_24px_-10px_rgba(99,102,241,0.7)]">
            Crear cuenta <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 0%, rgba(99,102,241,0.18), transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(139,92,246,0.12), transparent 65%),
            radial-gradient(ellipse 50% 30% at 50% 100%, rgba(99,102,241,0.08), transparent 70%)
          `,
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            maskImage: 'linear-gradient(180deg, black 0%, black 60%, transparent 100%)',
          }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-white/[0.04] border border-border text-[11.5px] text-ink/80 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Novedad — Vistas de tablero por proyecto</span>
            <ArrowUpRight className="w-3 h-3 text-mute" />
          </div>

          <h1 className="text-[44px] md:text-[56px] font-semibold tracking-[-0.02em] leading-[1.05] text-ink">
            Cada proyecto, <br className="hidden md:block" />
            <span className="bg-linear-to-br from-indigo-400 to-[#a78bfa] bg-clip-text text-transparent">
              en un solo flujo.
            </span>
          </h1>
          <p className="mt-5 text-[15px] md:text-[17px] text-mute max-w-2xl mx-auto leading-relaxed">
            TaskFlow es el espacio de trabajo donde tu equipo organiza proyectos,
            mueve tareas por estados y mantiene todo bajo control. Rápido, oscuro
            por defecto y diseñado para concentrarse.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register"
              className="relative overflow-hidden h-12 px-6 text-[15px] inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors shadow-[0_8px_24px_-10px_rgba(99,102,241,0.7)]">
              Empezar <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="h-12 px-6 text-[15px] inline-flex items-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-ink border border-border font-medium transition-colors">
              Iniciar sesión
            </Link>
          </div>

          <div className="mt-14 flex justify-center px-4">
            <div style={{ transform: 'perspective(1200px) rotateX(8deg) rotateY(-6deg)', transformOrigin: 'center' }}>
              <KanbanPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11.5px] font-semibold tracking-wider text-indigo-400 uppercase mb-2">
            Por qué TaskFlow
          </div>
          <h2 className="text-[28px] font-semibold tracking-tight text-ink">
            Todo lo que tu equipo necesita, sin la fricción.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={Layers}  color="#6366f1" title="Proyectos sin caos"
            description="Agrupa tareas por proyecto con prioridades, fechas y estados. La estructura aparece sola, sin plantillas que rellenar." />
          <FeatureCard icon={Zap}     color="#fbbf24" title="Velocidad real"
            description="Atajos de teclado, drag & drop instantáneo y sincronización en tiempo real. Nada de pantallas de carga." />
          <FeatureCard icon={Shield}  color="#34d399" title="Privado por defecto"
            description="Workspaces aislados, control granular de permisos y backup continuo. Tus datos son tuyos." />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-linear-to-br from-indigo-500/8 to-transparent p-8 md:p-10 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h3 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-ink">
              Listo para tu primer proyecto.
            </h3>
            <p className="text-[13.5px] text-mute mt-1.5">
              Crea tu workspace en menos de un minuto.
            </p>
          </div>
          <Link to="/register"
            className="h-12 px-6 text-[15px] inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors">
            Crear cuenta <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap text-[12px] text-mute">
          <BrandMark />
          <span>© 2026 TaskFlow</span>
        </div>
      </footer>
    </div>
  );
}
