import { Icons } from "@/components/icons"

interface MobileRestrictionProps {
  accentColor: string
}

export const MobileRestriction = ({ accentColor }: MobileRestrictionProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] p-8 text-center lg:hidden">
      {/* Background Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${accentColor}40, transparent)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <Icons.logo
            className="size-10"
            style={{ color: accentColor }}
          />
          <span className="text-sm font-bold tracking-[0.2em] uppercase text-white/40">
            Removerized
          </span>
        </div>

        <div
          className="h-px w-32 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
          }}
        />

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Desktop Optimization Required
          </h2>
          <p className="max-w-xs text-[0.9rem] leading-relaxed text-white/50">
            Removerized uses heavy on-device AI models designed for high-performance desktop environments. For the best experience, please visit us on your computer.
          </p>
        </div>

        <div
          className="mt-4 rounded-xl border p-5 transition-colors"
          style={{
            borderColor: `${accentColor}20`,
            background: `linear-gradient(135deg, ${accentColor}08, transparent)`,
          }}
        >
          <p
            className="text-[0.8rem] font-semibold uppercase tracking-widest mb-1"
            style={{ color: accentColor }}
          >
            Privacy First
          </p>
          <p className="text-[0.75rem] leading-relaxed text-white/35">
            Our AI runs locally. No data ever leaves your device, requiring the processing power of a desktop browser.
          </p>
        </div>
      </div>
    </div>
  )
}
