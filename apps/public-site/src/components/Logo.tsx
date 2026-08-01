type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<LogoSize, string> = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-12',
  xl: 'h-16',
}

interface LogoProps {
  size?: LogoSize
  className?: string
  withWordmark?: boolean
}

export function DevtakumiLogo({ size = 'md', className = '', withWordmark = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <img
        src={`${import.meta.env.BASE_URL}devtakumi-logo.png`}
        alt="devtakumi"
        className={`${sizeClasses[size]} w-auto object-contain drop-shadow-[0_0_14px_rgba(249,115,22,0.25)]`}
        draggable={false}
      />
      {withWordmark && (
        <span className="font-display font-bold text-white leading-none tracking-tight">
          dev<span className="text-orange-500">takumi</span>
        </span>
      )}
    </span>
  )
}

/** @deprecated Use DevtakumiLogo — kept for any legacy imports */
export function DevtakumiLogoIcon({ className = 'h-9 w-9' }: { className?: string }) {
  return <DevtakumiLogo size="sm" className={className} />
}
