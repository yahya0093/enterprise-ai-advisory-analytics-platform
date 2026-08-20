type AdvisorCardProps = {
  icon: string;
  name: string;
  role: string;
  isSelected: boolean;
  onClick: () => void;
};

export default function AdvisorCard({
  icon,
  name,
  role,
  isSelected,
  onClick,
}: AdvisorCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group border rounded-2xl sm:rounded-3xl text-center cursor-pointer transition-all duration-200 px-4 py-5 sm:px-4 sm:py-6 ${
        isSelected
          ? "border-blue-500/60 bg-blue-600/10 shadow-[0_0_25px_rgba(37,99,235,0.14)] ring-1 ring-blue-500/30"
          : "bg-[#0B0F14]/90 border-slate-800 hover:border-slate-600 hover:bg-[#101722] hover:-translate-y-0.5"
      }`}
    >
      <div className="text-[26px] sm:text-[30px] mb-2.5 sm:mb-3 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>

      <p className="font-extrabold text-sm sm:text-base text-slate-100 truncate">
        {name}
      </p>

      <p className="text-slate-500 text-[11px] sm:text-xs mt-1.5 sm:mt-2 leading-5">
        {role}
      </p>
    </div>
  );
}