type AdminHeaderProps = {
  onBack: () => void;
  onOpenLogoutModal: () => void;
};

export default function AdminHeader({
  onBack,
  onOpenLogoutModal,
}: AdminHeaderProps) {
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-[#0a0a0a] border-b border-gray-800 shadow-sm">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-100">إدارة الحسابات</h1>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
          Admin Users Panel
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 cursor-pointer"
        >
          الرجوع إلى الشات
        </button>

        <button
          onClick={onOpenLogoutModal}
          className="bg-red-600/10 text-red-500 border border-red-500/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/20 active:scale-95 cursor-pointer"
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}