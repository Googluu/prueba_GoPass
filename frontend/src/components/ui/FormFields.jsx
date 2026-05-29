import { AlertTriangle, ChevronDown } from 'lucide-react';

export function Field({ label, hint, error, required, children, id }) {
  return (
    <label htmlFor={id} className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] font-medium text-ink/90">
          {label}{required && <span className="text-[#f87171] ml-0.5">*</span>}
        </span>
        {hint && <span className="text-[11px] text-mute">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="mt-1.5 text-[11px] text-[#f87171] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </div>
      )}
    </label>
  );
}

export function TextInput({ error, className = '', ...rest }) {
  return (
    <input type="text"
      className={`w-full h-10 px-3 rounded-lg bg-bg/60 border ${error ? 'border-[#b13b3d]' : 'border-border'} focus:border-indigo-500 focus:bg-bg outline-none text-[13px] text-ink placeholder:text-mute transition-colors ${className}`}
      {...rest} />
  );
}

export function TextArea({ rows = 3, className = '', ...rest }) {
  return (
    <textarea rows={rows}
      className={`w-full px-3 py-2.5 rounded-lg bg-bg/60 border border-border focus:border-indigo-500 focus:bg-bg outline-none text-[13px] text-ink placeholder:text-mute transition-colors resize-none ${className}`}
      {...rest} />
  );
}

export function Select({ children, className = '', ...rest }) {
  return (
    <div className="relative">
      <select
        className={`w-full h-10 pl-3 pr-9 rounded-lg bg-bg/60 border border-border focus:border-indigo-500 focus:bg-bg outline-none text-[13px] text-ink transition-colors appearance-none ${className}`}
        {...rest}>
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-mute absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export function DateInput({ className = '', ...rest }) {
  return (
    <input type="date"
      className={`w-full h-10 px-3 rounded-lg bg-bg/60 border border-border focus:border-indigo-500 focus:bg-bg outline-none text-[13px] text-ink transition-colors ${className}`}
      {...rest} />
  );
}

export function TimeInput({ className = '', ...rest }) {
  return (
    <input type="time"
      className={`w-full h-10 px-3 rounded-lg bg-bg/60 border border-border focus:border-indigo-500 focus:bg-bg outline-none text-[13px] text-ink transition-colors ${className}`}
      {...rest} />
  );
}
