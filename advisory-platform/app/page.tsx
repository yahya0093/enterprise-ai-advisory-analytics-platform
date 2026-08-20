"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cleanText } from "@/lib/utils";
import LogoutConfirmModal from "@/components/modals/LogoutConfirmModal";
import AdvisorsGrid from "@/components/chat/AdvisorsGrid";
import MainHeader from "@/components/chat/MainHeader";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessagesList from "@/components/chat/MessagesList";
import ChatInput from "@/components/chat/ChatInput";
import useChatPage from "@/hooks/useChatPage";

export default function Home() {
  const {
    advisors,
    isCheckingAuth,
    isAdmin,
    showLogoutConfirm,
    selected,
    question,
    messages,
    isLoading,
    isSwitching,

    dashboardContext,
    useDashboardContext,
    setUseDashboardContext,

    sessionId,
    openFolder,
    groupedSessions,
    unassignedSessions,
    messagesEndRef,
    setSelected,
    setQuestion,
    setOpenFolder,
    startNewChat,
    loadSession,
    deleteSession,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
    goToAdminPage,
    handleSend,
  } = useChatPage();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // تم التعديل هنا: صرنا نخزن الـ ID فقط بدل الكائن كامل
  const [chatToDeleteId, setChatToDeleteId] = useState<string | null>(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [showBottomDashboardContext, setShowBottomDashboardContext] = useState(false);

  const lastBotText = useMemo(() => {
    const lastBotMessage = [...messages].reverse().find((msg) => msg.type === "bot");
    return lastBotMessage?.text || "";
  }, [messages]);

  useEffect(() => {
    setShowBottomDashboardContext(false);

    if (!dashboardContext || messages.length === 0 || isLoading || !lastBotText) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowBottomDashboardContext(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [dashboardContext, messages.length, isLoading, lastBotText]);


  useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  if (mode !== "campaign_analysis") return;
  if (question.trim()) return;
  if (messages.length > 0) return;

  setQuestion(
    "حلل الحملات الإعلانية المتاحة ضمن فترة الداشبورد الحالية، واربطها بالمبيعات والخصومات وAOV، ثم أعطني قرارًا عمليًا للفترة القادمة."
  );
}, [question, messages.length, setQuestion]);


  const goToDashboard = () => {
    window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:8080";
  };

  const scrollMainToTop = () => {
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 80);
  };

  const handleStartNewChat = () => {
    startNewChat();
    scrollMainToTop();
  };

  const handleStartNewChatFromMobileSidebar = () => {
    startNewChat();
    setIsSidebarOpen(false);
    scrollMainToTop();
  };

  const handleLoadSessionFromMobileSidebar = (id: string) => {
    loadSession(id);
    setIsSidebarOpen(false);
  };

  const handleGoToAdminFromMobileSidebar = () => {
    setIsSidebarOpen(false);
    goToAdminPage();
  };

  const handleOpenLogoutFromMobileSidebar = () => {
    setIsSidebarOpen(false);
    openLogoutModal();
  };

  // تم التعديل هنا: تستقبل ID المحادثة
  const handleRequestDeleteChat = (id: string) => {
    setChatToDeleteId(id);
  };

  const handleCancelDeleteChat = () => {
    if (isDeletingChat) return;
    setChatToDeleteId(null);
  };

  const handleConfirmDeleteChat = async () => {
    if (!chatToDeleteId || isDeletingChat) return;

    try {
      setIsDeletingChat(true);
      await deleteSession(chatToDeleteId);
      setChatToDeleteId(null);
    } catch (error) {
      console.error("Delete chat error:", error);
      alert("صار خطأ أثناء حذف المحادثة. جرّب مرة ثانية.");
    } finally {
      setIsDeletingChat(false);
    }
  };

  // دالة مساعدة عشان نجيب عنوان المحادثة لرسالة التأكيد
  const getChatTitle = (id: string | null) => {
    if (!id) return "هذه المحادثة";

    const inUnassigned = unassignedSessions.find(s => s.id === id);
    if (inUnassigned) return inUnassigned.title;

    for (const group of groupedSessions) {
      const inGroup = group.sessions.find(s => s.id === id);
      if (inGroup) return inGroup.title;
    }

    return "هذه المحادثة";
  };


  const DashboardContextCard = ({ className = "" }: { className?: string }) => {
    if (!dashboardContext) return null;

    const context: any = dashboardContext;

    const filterChips = [
      ["Branch", context.branch],
      ["Source", context.source],
      ["Type", context.branchType],
      ["Express", context.express],
      ["Service", context.service],
      ["Residency", context.residency],
      ["Bag", context.bag],
      ["Product", context.productVariant],
    ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");

    const discountUsage = context.discountUsage;

    return (
      <div className={`${className} w-full max-w-5xl rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-4 text-right shadow-lg shadow-emerald-950/10`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={goToDashboard}
                className="rounded-xl border border-blue-500/30 bg-blue-950/30 px-3 py-2 text-xs font-bold text-blue-200 transition-all duration-200 hover:bg-blue-900/50 hover:text-white hover:scale-[1.04] active:scale-[0.97] cursor-pointer"
              >
                الرجوع للداشبورد
              </button>

              <button
                type="button"
                onClick={() => setUseDashboardContext(!useDashboardContext)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] cursor-pointer ${useDashboardContext
                    ? "border-red-500/30 bg-red-950/30 text-red-200 hover:bg-red-900/50 hover:text-white"
                    : "border-emerald-500/30 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/50 hover:text-white"
                  }`}
              >
                {useDashboardContext ? "إيقاف السياق" : "تشغيل السياق"}
              </button>
            </div>

            <div
              className={`text-sm font-black ${useDashboardContext ? "text-emerald-300" : "text-slate-400"
                }`}
            >
              📌 {useDashboardContext ? "سياق الداشبورد مفعل" : "سياق الداشبورد متوقف"}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap justify-end gap-2 text-xs font-bold text-slate-200">
              {filterChips.map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1"
                >
                  {label}: {String(value)}
                </span>
              ))}

              <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                Date: {context.dateFrom} → {context.dateTo}
              </span>
            </div>

            {context.kpis && (
              <div className="flex flex-wrap justify-end gap-2 text-xs font-bold text-slate-200">
                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  العملاء: {context.kpis.customers?.toLocaleString() ?? 0}
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  الطلبات: {context.kpis.orders?.toLocaleString() ?? 0}
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  الإيراد: {context.kpis.grossRevenue?.toLocaleString() ?? 0} ⃁
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  بدون ضريبة: {context.kpis.revenueWithoutVat?.toLocaleString() ?? 0} ⃁
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  AOV: {context.kpis.aov?.toLocaleString() ?? 0} ⃁
                </span>
              </div>
            )}

            {discountUsage && (
              <div className="flex flex-wrap justify-end gap-2 text-xs font-bold text-emerald-100">
                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  عملاء البروموكود: {discountUsage.promoCustomers?.toLocaleString() ?? 0}
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  بدون بروموكود: {discountUsage.nonPromoCustomers?.toLocaleString() ?? 0}
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  طلبات البروموكود: {discountUsage.promoOrders?.toLocaleString() ?? 0}
                </span>

                <span className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-2 py-1">
                  قيمة خصم البروموكود: {discountUsage.promoDiscountWithVat?.toLocaleString() ?? 0} ⃁
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isCheckingAuth) {
    return (
      <div
        className="flex h-screen w-full bg-[#05070A] text-white items-center justify-center"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-slate-400 font-bold">
            جاري التحقق من الصلاحيات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-full bg-[#05070A] text-white overflow-hidden relative"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_20%)]" />

      {/* سايدبار الديسكتوب */}
      <div className="hidden lg:block w-[310px] xl:w-[340px] 2xl:w-[360px] flex-shrink-0">
        <ChatSidebar
          groupedSessions={groupedSessions}
          unassignedSessions={unassignedSessions}
          openFolder={openFolder}
          sessionId={sessionId}
          isAdmin={isAdmin}
          onStartNewChat={handleStartNewChat}
          onToggleFolder={(folderId) =>
            setOpenFolder(openFolder === folderId ? null : folderId)
          }
          onLoadSession={(id) => loadSession(id)}
          onRequestDeleteSession={handleRequestDeleteChat}
          onGoToAdminPage={goToAdminPage}
          onOpenLogoutModal={openLogoutModal}
        />
      </div>

      {/* سايدبار الموبايل */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[9999] lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* الخلفية */}
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm cursor-default"
          />

          {/* محتوى السايدبار */}
          <div
            className="absolute right-0 top-0 z-10 h-full w-[88vw] max-w-[320px] shadow-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <ChatSidebar
              groupedSessions={groupedSessions}
              unassignedSessions={unassignedSessions}
              openFolder={openFolder}
              sessionId={sessionId}
              isAdmin={isAdmin}
              onStartNewChat={handleStartNewChatFromMobileSidebar}
              onToggleFolder={(folderId) =>
                setOpenFolder(openFolder === folderId ? null : folderId)
              }
              onLoadSession={handleLoadSessionFromMobileSidebar}
              onRequestDeleteSession={handleRequestDeleteChat}
              onGoToAdminPage={handleGoToAdminFromMobileSidebar}
              onOpenLogoutModal={handleOpenLogoutFromMobileSidebar}
            />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-full bg-transparent relative z-10 min-w-0">
        <MainHeader
          isAdmin={isAdmin}
          onGoToAdminPage={goToAdminPage}
          onOpenLogoutModal={openLogoutModal}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onGoToDashboard={goToDashboard}
        />

        <div
          ref={mainScrollRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          className="flex-1 overflow-y-auto flex flex-col items-center px-4 sm:px-6 pb-32 pt-6 sm:pt-8 scroll-smooth"
        >
          <div className="w-full max-w-5xl flex flex-col items-center justify-center mb-8 sm:mb-10 mt-2 sm:mt-4">
            {messages.length === 0 && (
              <div className="text-center mb-6 sm:mb-8 px-2">
                <h2 className="text-[30px] sm:text-[42px] lg:text-[64px] font-black tracking-tight leading-[1.15] sm:leading-none">
                  <span className="text-white">المجلس الاستشاري </span>
                  <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                    الافتراضي
                  </span>
                </h2>

                <p className="mt-3 sm:mt-4 text-slate-400 text-sm sm:text-base lg:text-lg">
                  اختر مستشارك لتبدأ
                </p>
              </div>
            )}

            <AdvisorsGrid
              advisors={advisors}
              selected={selected}
              onSelect={setSelected}
            />
          </div>

          <DashboardContextCard className="mb-6" />
          <MessagesList
            messages={messages}
            isLoading={isLoading}
            isSwitching={isSwitching}
            messagesEndRef={messagesEndRef}
            cleanText={cleanText}
          />

          {showBottomDashboardContext && (
            <DashboardContextCard className="mt-4 mb-6" />
          )}
        </div>

        <ChatInput
          question={question}
          setQuestion={setQuestion}
          selected={selected}
          advisors={advisors}
          isLoading={isLoading}
          onSend={handleSend}
        />
      </main>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={closeLogoutModal}
      />

      {/* تم التعديل هنا ليتوافق مع طريقة جلب العنوان الجديدة */}
      <LogoutConfirmModal
        isOpen={chatToDeleteId !== null}
        onConfirm={handleConfirmDeleteChat}
        onCancel={handleCancelDeleteChat}
        title="حذف المحادثة"
        description="هل أنت متأكد أنك تريد حذف هذه المحادثة؟"
        bodyText={`سيتم حذف محادثة "${getChatTitle(chatToDeleteId)}" وجميع الرسائل المرتبطة بها من السجل. لا يمكن التراجع عن هذا الإجراء بعد الحذف.`}
        confirmText={isDeletingChat ? "جاري الحذف..." : "نعم، احذفها"}
        cancelText="إلغاء"
      />
    </div>
  );
}