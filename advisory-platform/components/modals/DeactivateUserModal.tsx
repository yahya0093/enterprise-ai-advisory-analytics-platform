import type { ConfirmDeactivateUser } from "@/types/admin";

type DeactivateUserModalProps = {
  user: ConfirmDeactivateUser;
  processingId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeactivateUserModal({
  user,
  processingId,
  onConfirm,
  onCancel,
}: DeactivateUserModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-800 bg-[#0d0d0d] shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 text-xl">
              !
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                تأكيد إلغاء التفعيل
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                هذا الإجراء سيمنع المستخدم من الدخول حتى يتم تفعيله مرة ثانية
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-2xl border border-gray-800 bg-[#111] px-4 py-4">
            <p className="text-sm text-gray-400 mb-2">اسم المستخدم</p>
            <p className="text-base font-bold text-white">{user.username}</p>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={onConfirm}
            disabled={processingId === user.id}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-2xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {processingId === user.id
              ? "جاري إلغاء التفعيل..."
              : "نعم، إلغاء التفعيل"}
          </button>

          <button
            onClick={onCancel}
            disabled={processingId === user.id}
            className="flex-1 bg-[#161616] hover:bg-[#1d1d1d] text-gray-200 border border-gray-700 py-3 rounded-2xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}