"use client";

import { useRef } from "react";
import type { SyntheticEvent } from "react";

type ChatSession = {
  id: string;
  title: string;
  advisorId: string | null;
};

type GroupedSession = {
  id: string;
  name: string;
  role: string;
  icon: string;
  sessions: ChatSession[];
};

type ChatSidebarProps = {
  groupedSessions: GroupedSession[];
  unassignedSessions: ChatSession[];
  openFolder: string | null;
  sessionId: string;
  isAdmin: boolean;
  onStartNewChat: () => void;
  onToggleFolder: (folderId: string) => void;
  onLoadSession: (sessionId: string) => void;
  onRequestDeleteSession: (sessionId: string) => void; // تم التعديل لتستقبل النص مباشرة
  onGoToAdminPage: () => void;
  onOpenLogoutModal: () => void;
};

type SessionRowProps = {
  session: ChatSession;
  isActive: boolean;
  titleLimit: number;
  nested?: boolean;
  onOpen: (sessionId: string) => void;
  onDelete: (sessionId: string) => void; // تم التعديل لتستقبل النص مباشرة
  runAction: (event: SyntheticEvent, action: () => void) => void;
};

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function getShortTitle(title: string, limit: number) {
  return title.length > limit ? title.substring(0, limit) + "..." : title;
}

function SessionRow({
  session,
  isActive,
  titleLimit,
  nested = false,
  onOpen,
  onDelete,
  runAction,
}: SessionRowProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onPointerDown={(e) =>
          runAction(e, () => {
            onOpen(session.id);
          })
        }
        onClick={(e) =>
          runAction(e, () => {
            onOpen(session.id);
          })
        }
        className={`relative z-10 text-right w-full truncate rounded-xl transition-all cursor-pointer touch-manipulation select-none pl-10 ${
          nested
            ? "text-xs sm:text-sm px-3 py-2.5"
            : "text-xs sm:text-sm px-4 py-3 border"
        } ${
          isActive
            ? nested
              ? "bg-blue-600/15 text-blue-300 border border-blue-500/20"
              : "bg-[#131A24] text-white border-slate-700"
            : nested
            ? "text-slate-400 hover:bg-[#131A24] hover:text-slate-200"
            : "bg-[#0F141B] text-slate-400 border-transparent hover:border-slate-800 hover:bg-[#111821]"
        }`}
        title={session.title}
      >
        {getShortTitle(session.title, titleLimit)}
      </button>

      <button
        type="button"
        aria-label="حذف المحادثة"
        title="حذف المحادثة"
        onPointerDown={(e) =>
          runAction(e, () => {
            onDelete(session.id); // تم التعديل لتمرير الـ ID فقط
          })
        }
        onClick={(e) =>
          runAction(e, () => {
            onDelete(session.id); // تم التعديل لتمرير الـ ID فقط
          })
        }
        className="absolute left-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 opacity-100 lg:opacity-0 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto hover:bg-red-600 hover:text-white transition-all cursor-pointer touch-manipulation"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export default function ChatSidebar({
  groupedSessions,
  unassignedSessions,
  openFolder,
  sessionId,
  isAdmin,
  onStartNewChat,
  onToggleFolder,
  onLoadSession,
  onRequestDeleteSession,
  onGoToAdminPage,
  onOpenLogoutModal,
}: ChatSidebarProps) {
  const lastActionTimeRef = useRef(0);

  const runMobileSafeAction = (
    event: SyntheticEvent,
    action: () => void
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();

    if (now - lastActionTimeRef.current < 350) return;

    lastActionTimeRef.current = now;
    action();
  };

  return (
    <aside className="w-full lg:w-[310px] lg:min-w-[310px] lg:max-w-[310px] h-full bg-[#0B0F14]/95 border-l border-slate-800/80 p-3 sm:p-4 flex flex-col flex-shrink-0 backdrop-blur-xl">
      <button
        type="button"
        onPointerDown={(e) => runMobileSafeAction(e, onStartNewChat)}
        onClick={(e) => runMobileSafeAction(e, onStartNewChat)}
        className="relative z-20 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-2xl font-bold transition-all mb-4 lg:mb-6 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer text-sm sm:text-base touch-manipulation select-none"
      >
        <span className="text-lg">+</span> محادثة جديدة
      </button>

      <div className="lg:hidden flex flex-col gap-2 mb-4">
        {isAdmin && (
          <button
            type="button"
            onPointerDown={(e) =>
              runMobileSafeAction(e, onGoToAdminPage)
            }
            onClick={(e) => runMobileSafeAction(e, onGoToAdminPage)}
            className="relative z-20 w-full bg-blue-600/10 text-blue-300 border border-blue-500/20 py-3 px-4 rounded-2xl text-sm font-bold transition-all hover:bg-blue-600 hover:text-white active:scale-[0.98] cursor-pointer touch-manipulation select-none"
          >
            إدارة الحسابات
          </button>
        )}

        <button
          type="button"
          onPointerDown={(e) =>
            runMobileSafeAction(e, onOpenLogoutModal)
          }
          onClick={(e) => runMobileSafeAction(e, onOpenLogoutModal)}
          className="relative z-20 w-full bg-red-600/10 text-red-400 border border-red-500/20 py-3 px-4 rounded-2xl text-sm font-bold transition-all hover:bg-red-600 hover:text-white active:scale-[0.98] cursor-pointer touch-manipulation select-none"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="lg:hidden h-px bg-slate-800 mb-4" />

      <h3 className="text-slate-500 text-[10px] sm:text-[11px] font-semibold mb-3 sm:mb-4 px-2 tracking-[0.14em] sm:tracking-[0.18em]">
        ملفات المستشارين
      </h3>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 sm:gap-3 pr-1 custom-scrollbar">
        {groupedSessions.map((group) => (
          <div key={group.id} className="flex flex-col gap-1.5">
            <button
              type="button"
              onPointerDown={(e) =>
                runMobileSafeAction(e, () => onToggleFolder(group.id))
              }
              onClick={(e) =>
                runMobileSafeAction(e, () => onToggleFolder(group.id))
              }
              className={`relative z-20 flex justify-between items-center p-3 rounded-2xl transition-all duration-200 border cursor-pointer touch-manipulation select-none ${
                openFolder === group.id
                  ? "bg-[#131A24] border-slate-700 shadow-lg shadow-black/20"
                  : "bg-[#0F141B] border-transparent hover:border-slate-800 hover:bg-[#111821]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg sm:text-xl flex-shrink-0">
                  {group.icon}
                </span>

                <span className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                  {group.name}
                </span>

                <span className="bg-[#1A2230] text-[10px] sm:text-xs px-2 py-0.5 rounded-full text-slate-400 border border-slate-800 flex-shrink-0">
                  {group.sessions.length}
                </span>
              </div>

              <span className="text-[10px] sm:text-xs text-slate-500 flex-shrink-0">
                {openFolder === group.id ? "▼" : "◀"}
              </span>
            </button>

            {openFolder === group.id && (
              <div className="flex flex-col gap-1 pr-4 sm:pr-5 border-r-2 border-slate-800 mr-4 sm:mr-5 mt-1 mb-2">
                {group.sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    isActive={sessionId === session.id}
                    titleLimit={22}
                    nested
                    onOpen={onLoadSession}
                    onDelete={onRequestDeleteSession}
                    runAction={runMobileSafeAction}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {unassignedSessions.length > 0 && (
          <div className="flex flex-col gap-1 mt-3 sm:mt-4">
            <h4 className="text-slate-600 text-[10px] sm:text-[11px] font-bold px-2 mb-2 tracking-[0.12em] sm:tracking-[0.14em]">
              محادثات عامة
            </h4>

            {unassignedSessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isActive={sessionId === session.id}
                titleLimit={25}
                onOpen={onLoadSession}
                onDelete={onRequestDeleteSession}
                runAction={runMobileSafeAction}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}