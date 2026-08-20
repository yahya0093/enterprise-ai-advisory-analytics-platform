"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import UsersStatsCards from "@/components/admin/UsersStatsCards";
import UsersList from "@/components/admin/UsersList";
import LogoutConfirmModal from "@/components/modals/LogoutConfirmModal";
import DeactivateUserModal from "@/components/modals/DeactivateUserModal";
import useAdminUsersPage from "@/hooks/useAdminUsersPage";

export default function AdminUsersPage() {
  const {
    isCheckingAuth,
    isLoading,
    profiles,
    message,
    processingId,
    confirmDeactivateUser,
    showLogoutConfirm,
    pendingUsers,
    approvedUsers,
    handleApprove,
    openDeactivateModal,
    closeDeactivateModal,
    handleDeactivateConfirmed,
    handleBack,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
  } = useAdminUsersPage();

  if (isCheckingAuth) {
    return (
      <div
        className="min-h-screen bg-black text-white flex items-center justify-center"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-400 font-bold">
            جاري التحقق من صلاحيات الأدمن...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" dir="rtl">
      <AdminHeader onBack={handleBack} onOpenLogoutModal={openLogoutModal} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <UsersStatsCards
          total={profiles.length}
          pending={pendingUsers.length}
          approved={approvedUsers.length}
        />

        {message && (
          <div className="mb-6 rounded-2xl border border-gray-800 bg-[#101010] px-4 py-3 text-center text-sm text-gray-200 shadow-lg">
            {message}
          </div>
        )}

        <UsersList
          profiles={profiles}
          isLoading={isLoading}
          processingId={processingId}
          onApprove={handleApprove}
          onOpenDeactivateModal={openDeactivateModal}
        />
      </main>

      <DeactivateUserModal
        user={confirmDeactivateUser}
        processingId={processingId}
        onConfirm={handleDeactivateConfirmed}
        onCancel={closeDeactivateModal}
      />

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={closeLogoutModal}
        title="تأكيد تسجيل الخروج"
        description="هل أنت متأكد أنك تريد تسجيل الخروج من لوحة الإدارة؟"
        bodyText="سيتم إنهاء الجلسة الحالية والعودة إلى صفحة تسجيل الدخول."
        confirmText="نعم، تسجيل الخروج"
        cancelText="إلغاء"
      />
    </div>
  );
}