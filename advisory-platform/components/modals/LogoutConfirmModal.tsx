type LogoutConfirmModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  bodyText?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function LogoutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "تأكيد تسجيل الخروج",
  description = "هل أنت متأكد أنك تريد تسجيل الخروج من النظام؟",
  bodyText = "في حال المتابعة، سيتم إنهاء الجلسة الحالية والعودة إلى صفحة تسجيل الدخول.",
  confirmText = "نعم، تسجيل الخروج",
  cancelText = "إلغاء",
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0D131B] shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl">
              ⎋
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-slate-400 mt-1">{description}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-2xl border border-slate-800 bg-[#111821] px-4 py-4">
            <p className="text-sm text-slate-400 leading-7">{bodyText}</p>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-2xl font-bold transition-all cursor-pointer"
          >
            {confirmText}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 bg-[#161D27] hover:bg-[#1B2430] text-slate-200 border border-slate-700 py-3 rounded-2xl font-bold transition-all cursor-pointer"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}