import { SignupForm } from "@/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-4 md:p-8 bg-[#070913] overflow-hidden select-none font-['Times_New_Roman',_Times,_serif]">
      {/* Background glow elements (Lighter/Brighter) */}
      <div className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full bg-[#2e1a47] opacity-60 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[700px] h-[700px] rounded-full bg-[#1e293b] opacity-80 blur-[130px] pointer-events-none" />
      
      {/* Bright diagonal glow light streak behind the card (mocking the image glow) */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-r from-transparent via-cyan-500/15 to-purple-500/15 rotate-[-15deg] blur-[100px] pointer-events-none" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      
      {/* Glow lines / streaks */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/15 via-[#070913]/90 to-[#070913] pointer-events-none" />
      
      {/* Glowing diagonal lines (from image) */}
      <div className="absolute top-0 right-0 w-[800px] h-[2px] bg-gradient-to-l from-cyan-400/30 via-indigo-400/30 to-transparent rotate-[-35deg] transform origin-top-right blur-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[2px] bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-transparent rotate-[-35deg] transform origin-bottom-left blur-sm pointer-events-none" />
      
      {/* Sparkle icon at bottom-right */}
      <div className="absolute bottom-10 right-10 opacity-30 text-white animate-pulse pointer-events-none">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3 L14 9 L20 12 L14 15 L12 21 L10 15 L4 12 L10 9 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="w-full max-w-5xl z-10">
        <SignupForm />
      </div>
    </div>
  )
}
