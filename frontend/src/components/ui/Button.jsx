export function Button({ variant = 'primary', size = 'md', icon: LeftIcon, children, className = '', ...rest }) {
  const sizeCls = size === 'sm' ? 'h-8 px-3 text-[13px]' : size === 'lg' ? 'h-11 px-5 text-[15px]' : 'h-9 px-4 text-[13px]';
  const variantCls = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_4px_14px_-6px_rgba(99,102,241,0.6)]',
    ghost:   'bg-transparent hover:bg-white/5 text-ink/80 border border-border hover:border-border-2',
    danger:  'bg-[#b1393b] hover:bg-[#c14143] text-white font-medium',
    subtle:  'bg-white/5 hover:bg-white/10 text-ink/80',
  }[variant];
  return (
    <button type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeCls} ${variantCls} ${className}`}
      {...rest}>
      {LeftIcon && <LeftIcon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, tone = 'mute', className = '', ...rest }) {
  const toneCls = tone === 'danger'
    ? 'text-ink/60 hover:text-[#f87171] hover:bg-[#3f1515]/60'
    : 'text-ink/60 hover:text-ink hover:bg-white/10';
  return (
    <button type="button" aria-label={label} title={label}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${toneCls} ${className}`}
      {...rest}>
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
