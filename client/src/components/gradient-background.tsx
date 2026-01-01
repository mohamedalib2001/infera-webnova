interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientBackground({ children, className = "" }: GradientBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 dark:from-violet-950/30 dark:via-background dark:to-cyan-950/30" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-pink-400/30 dark:from-violet-600/20 dark:to-pink-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-orange-400/20 dark:from-pink-600/15 dark:to-orange-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
