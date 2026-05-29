import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, CheckCheck, AlertCircle, Check, ArrowRight } from 'lucide-react';
import logoIcon  from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';

function scorePassword(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8)           s++;
  if (/[A-Z]/.test(p))          s++;
  if (/[0-9]/.test(p))          s++;
  if (/[^A-Za-z0-9]/.test(p))   s++;
  if (p.length >= 12)           s = Math.min(4, s + 1);
  return s;
}

function StrengthMeter({ value }) {
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente'];
  const colors = ['#f87171',   '#fb923c', '#fbbf24',  '#34d399', '#34d399'];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-1 rounded-full flex-1 transition-colors"
            style={{ background: i < value ? colors[Math.max(0, value - 1)] : '#2a2a3a' }} />
        ))}
      </div>
      <div className="mt-1 text-[11px] text-mute">
        Fortaleza: <span style={{ color: value > 0 ? colors[Math.max(0, value - 1)] : '#64748b' }}>{labels[value]}</span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Register() {
  const { signInWithGoogle, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree]             = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const strength     = scorePassword(password);
  const emailErr     = submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Introduce un email válido.' : null;
  const passwordErr  = submitted && password.length < 8 ? 'Mínimo 8 caracteres.' : null;
  const confirmErr   = submitted && confirm !== password ? 'Las contraseñas no coinciden.' : null;
  const agreeErr     = submitted && !agree ? 'Debes aceptar los términos.' : null;

  const handleGoogle = async () => {
    setError(null);
    await signInWithGoogle();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitted(true);
    if (emailErr || passwordErr || confirmErr || !email || password.length < 8 || confirm !== password || !agree) return;
    setLoading(true);
    setError(null);
    const { error: err } = await signUp(email, password);
    setLoading(false);
    if (err) return setError(err.message);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#34d399]/15 grid place-items-center mx-auto mb-5">
            <Check className="w-8 h-8 text-[#34d399]" />
          </div>
          <h2 className="text-[22px] font-semibold text-ink mb-2">Revisa tu email</h2>
          <p className="text-[13.5px] text-mute mb-6">
            Enviamos un enlace de confirmación a <strong className="text-ink">{email}</strong>. Haz clic en él para activar tu cuenta.
          </p>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-500 text-[13px] font-medium">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="rounded-2xl border border-border overflow-hidden bg-bg flex w-full max-w-[860px] min-h-[680px] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">

        {/* Brand panel */}
        <aside className="hidden lg:flex flex-col w-[44%] p-10 bg-chrome border-r border-border relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 60% 50% at 20% 0%, rgba(99,102,241,0.18), transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 10%, rgba(139,92,246,0.12), transparent 65%)
              `,
            }} />
          <div className="relative z-10 flex flex-col h-full">
            <div className="inline-flex items-center">
              <img src={logoIcon} alt="TaskFlow"
                className="h-5 object-contain" />
              <span className="text-[20px] font-semibold tracking-tight text-ink ml-2">TaskFlow</span>
            </div>
            <div className="mt-auto">
              <p className="text-[22px] leading-snug tracking-tight text-ink font-medium">
                Empieza con un workspace en blanco — invita a tu equipo cuando quieras.
              </p>
              <ul className="mt-7 flex flex-col gap-3 text-[13.5px] text-ink/80">
                {[
                  'Proyectos y tableros ilimitados durante 14 días',
                  'Hasta 5 miembros del equipo en el plan gratuito',
                  'Importa tareas desde CSV, Trello o Asana',
                ].map(line => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 grid place-items-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex items-center gap-2 text-[11.5px] text-mute">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                Cifrado en tránsito y en reposo
              </div>
            </div>
          </div>
        </aside>

        {/* Form */}
        <main className="flex-1 flex flex-col">
          <div className="h-14 px-6 flex items-center justify-between border-b border-border">
            <Link to="/" className="text-[12.5px] text-mute hover:text-ink transition-colors">
              ← Volver a TaskFlow.app
            </Link>
            <div className="text-[12.5px] text-mute">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-500 font-medium">Iniciar sesión</Link>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <form onSubmit={handleSubmit} className="w-full max-w-[420px]">
              <h1 className="text-[26px] font-semibold tracking-tight text-ink">Crea tu cuenta</h1>
              <p className="text-[13.5px] text-mute mt-1.5">Tu primer proyecto está a un minuto de distancia.</p>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0 mt-0.5" />
                  <p className="text-[12.5px] text-[#f87171]">{error}</p>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3.5">
                <button type="button" onClick={handleGoogle}
                  className="w-full h-11 rounded-lg bg-white hover:bg-white/95 text-[#1f1f1f] font-medium text-[14px] inline-flex items-center justify-center gap-2.5 transition-colors">
                  <GoogleIcon /> Registrarse con Google
                </button>

                <div className="flex items-center gap-3 my-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] text-mute uppercase tracking-wider">o con email</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <label className="block">
                  <span className="text-[12.5px] font-medium text-ink/90 mb-1.5 block">Email <span className="text-[#f87171]">*</span></span>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-mute absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type="email" autoComplete="email" placeholder="tu@empresa.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className={`w-full h-11 rounded-lg bg-bg/60 border ${emailErr ? 'border-[#b13b3d]' : 'border-border'} focus:border-indigo-500 outline-none text-[14px] text-ink placeholder:text-mute pl-10 pr-3.5 transition-colors`}
                    />
                  </div>
                  {emailErr && <p className="mt-1.5 text-[11.5px] text-[#f87171] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{emailErr}</p>}
                </label>

                <label className="block">
                  <span className="text-[12.5px] font-medium text-ink/90 mb-1.5 block">Contraseña <span className="text-[#f87171]">*</span></span>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-mute absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type={showPw ? 'text' : 'password'} autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className={`w-full h-11 rounded-lg bg-bg/60 border ${passwordErr ? 'border-[#b13b3d]' : 'border-border'} focus:border-indigo-500 outline-none text-[14px] text-ink placeholder:text-mute pl-10 pr-11 transition-colors`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-md text-mute hover:text-ink hover:bg-white/5">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && <StrengthMeter value={strength} />}
                  {passwordErr && <p className="mt-1.5 text-[11.5px] text-[#f87171] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passwordErr}</p>}
                </label>

                <label className="block">
                  <span className="text-[12.5px] font-medium text-ink/90 mb-1.5 block">Confirmar contraseña <span className="text-[#f87171]">*</span></span>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-mute absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                      placeholder="Repite tu contraseña"
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      className={`w-full h-11 rounded-lg bg-bg/60 border ${confirmErr ? 'border-[#b13b3d]' : 'border-border'} focus:border-indigo-500 outline-none text-[14px] text-ink placeholder:text-mute pl-10 pr-11 transition-colors`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-md text-mute hover:text-ink hover:bg-white/5">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmErr && <p className="mt-1.5 text-[11.5px] text-[#f87171] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{confirmErr}</p>}
                </label>

                <label className="flex items-start gap-2.5 mt-1 cursor-pointer select-none">
                  <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border border-border bg-bg accent-indigo-500 shrink-0" />
                  <span className="text-[12.5px] text-ink/80 leading-snug">
                    Acepto los <span className="text-indigo-400">Términos</span> y la <span className="text-indigo-400">Política de privacidad</span>.
                  </span>
                </label>
                {agreeErr && <p className="-mt-2 text-[11.5px] text-[#f87171] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{agreeErr}</p>}

                <button type="submit" disabled={loading}
                  className="mt-2 w-full h-12 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium text-[15px] inline-flex items-center justify-center gap-2 transition-colors">
                  {loading ? 'Creando cuenta…' : <><span>Crear cuenta gratis</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
