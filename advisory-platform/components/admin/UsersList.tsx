import type { ProfileRow } from "@/types/admin";

type UsersListProps = {
  profiles: ProfileRow[];
  isLoading: boolean;
  processingId: string | null;
  onApprove: (id: string) => void;
  onOpenDeactivateModal: (id: string, username: string) => void;
};

export default function UsersList({
  profiles,
  isLoading,
  processingId,
  onApprove,
  onOpenDeactivateModal,
}: UsersListProps) {
  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-gray-800">
        <h2 className="text-lg font-bold">قائمة الحسابات</h2>
        <p className="text-sm text-gray-400 mt-1">
          من هنا تقدر تراجع الحسابات وتفعل أو تلغي تفعيل الحسابات
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-400">جاري تحميل الحسابات...</p>
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          لا يوجد حسابات حالياً
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[#101010] transition-colors"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-white">
                    {profile.username}
                  </h3>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      profile.role === "admin"
                        ? "border-purple-500/30 text-purple-300 bg-purple-500/10"
                        : "border-gray-700 text-gray-300 bg-[#161616]"
                    }`}
                  >
                    {profile.role === "admin" ? "أدمن" : "مستخدم"}
                  </span>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      profile.is_approved
                        ? "border-green-500/30 text-green-300 bg-green-500/10"
                        : "border-yellow-500/30 text-yellow-300 bg-yellow-500/10"
                    }`}
                  >
                    {profile.is_approved ? "مفعّل" : "بانتظار التفعيل"}
                  </span>
                </div>

                <p className="text-sm text-gray-400">{profile.email}</p>
                <p className="text-xs text-gray-600">ID: {profile.id}</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {profile.role !== "admin" && !profile.is_approved && (
                  <button
                    onClick={() => onApprove(profile.id)}
                    disabled={processingId === profile.id}
                    className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {processingId === profile.id
                      ? "جاري التفعيل..."
                      : "تفعيل الحساب"}
                  </button>
                )}

                {profile.role !== "admin" && profile.is_approved && (
                  <button
                    onClick={() =>
                      onOpenDeactivateModal(profile.id, profile.username)
                    }
                    disabled={processingId === profile.id}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {processingId === profile.id
                      ? "جاري الإلغاء..."
                      : "إلغاء التفعيل"}
                  </button>
                )}

                {profile.role === "admin" && (
                  <span className="text-sm text-purple-300 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl">
                    حساب الأدمن
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}