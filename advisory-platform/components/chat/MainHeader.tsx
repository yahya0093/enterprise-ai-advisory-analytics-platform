type MainHeaderProps = {
  isAdmin: boolean;
  onGoToAdminPage: () => void;
  onOpenLogoutModal: () => void;
  onOpenSidebar: () => void;
  onGoToDashboard: () => void;
};

export default function MainHeader({
  isAdmin,
  onGoToAdminPage,
  onOpenLogoutModal,
  onOpenSidebar,
  onGoToDashboard,
}: MainHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#090D12]/85 border-b border-slate-800/80 z-20 flex-shrink-0 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl border border-slate-700 bg-[#111821] text-slate-200 hover:bg-[#18212D] transition-all cursor-pointer"
          aria-label="فتح القائمة الجانبية"
        >
          ☰
        </button>

        <div className="flex flex-col items-end leading-none min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.85)] flex-shrink-0" />
            <h1 className="text-[20px] sm:text-[24px] md:text-[28px] font-black tracking-tight text-white truncate">
              مجلس الاستشارة
            </h1>
          </div>

          <span className="hidden sm:block mt-2 sm:mt-3 text-[9px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.38em] text-slate-500 truncate">
            Advisory Council
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onGoToDashboard}
          className="inline-flex bg-emerald-600/10 text-emerald-300 border border-emerald-500/20 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
        >
          الداشبورد
        </button>

        {isAdmin && (
          <button
            onClick={onGoToAdminPage}
            className="inline-flex bg-blue-600/10 text-blue-300 border border-blue-500/20 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
          >
            إدارة الحسابات
          </button>
        )}

        <button
          onClick={onOpenLogoutModal}
          className="bg-red-600/10 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98] cursor-pointer"
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}