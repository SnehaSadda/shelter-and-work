import logoImg from "@/assets/haven-logo.jpg";

export function Logo({ className = "", showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoImg}
        alt="Haven logo"
        className="h-8 w-8 rounded-lg object-cover"
      />
      {showWordmark && <span className="text-lg font-semibold tracking-tight">Haven</span>}
    </div>
  );
}
