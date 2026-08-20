"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { advisors } from "@/data/advisors";
import type { Message, ChatSession } from "@/types/chat";
import type { Profile } from "@/types/profile";

function createSessionId() {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // fallback تحت لو crypto.randomUUID ما اشتغلت بالموبايل
  }

  return `session_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}_${Math.random().toString(36).slice(2)}`;
}

type DashboardContext = {
  enabled: boolean;
  dateFrom: string;
  dateTo: string;
  branch: string;
  source: string;
  branchType: string;
  kpis?: {
    customers?: number;
    orders?: number;
    grossRevenue?: number;
    revenueWithoutVat?: number;
    oneTimeCustomers?: number;
    repeatCustomers?: number;
    otherCustomers?: number;
    aov?: number;
  };
  createdAt?: string;
};


export default function useChatPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [selected, setSelected] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [dashboardContext, setDashboardContext] =
    useState<DashboardContext | null>(null);

  const [useDashboardContext, setUseDashboardContext] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionsList, setSessionsList] = useState<ChatSession[]>([]);
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeLoadTokenRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const fromDashboard = params.get("fromDashboard");
    const ctx = params.get("ctx");

    if (fromDashboard === "1" && ctx) {
      try {
        const parsedContext = JSON.parse(ctx) as DashboardContext;

        setDashboardContext(parsedContext);
        setUseDashboardContext(true);

        console.log("Dashboard context loaded:", parsedContext);
      } catch (error) {
        console.error("Failed to parse dashboard context:", error);
        setDashboardContext(null);
        setUseDashboardContext(false);
      }
    }
  }, []);

  const goTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          goTo("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, email, role, is_approved")
          .eq("id", session.user.id)
          .single<Profile>();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          goTo("/login");
          return;
        }

        if (!profile.is_approved) {
          await supabase.auth.signOut();
          goTo("/login");
          return;
        }

        setIsAdmin(profile.role === "admin");
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        await supabase.auth.signOut();
        goTo("/login");
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startNewChat = () => {
    activeLoadTokenRef.current += 1;

    const newSessionId = createSessionId();

    setSessionId(newSessionId);
    setMessages([]);
    setQuestion("");
    setSelected(null);
    setOpenFolder(null);
    setIsLoading(false);
    setIsSwitching(false);
  };

  useEffect(() => {
    const fetchSidebarHistory = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user) {
        const { data, error } = await supabase
          .from("chats")
          .select("session_id, question, advisor, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (!error && data) {
          const uniqueSessions: ChatSession[] = [];
          const map = new Set<string>();

          data.forEach((chat) => {
            if (chat.session_id && !map.has(chat.session_id)) {
              map.add(chat.session_id);

              uniqueSessions.push({
                id: chat.session_id,
                title: chat.question || "محادثة جديدة",
                advisorId: chat.advisor || null,
              });
            }
          });

          setSessionsList(uniqueSessions);
        }
      }

      setSessionId((current) => current || createSessionId());
    };

    fetchSidebarHistory();
  }, []);

  const loadSession = async (targetSessionId: string) => {
    if (sessionId === targetSessionId) return;

    const currentLoadToken = ++activeLoadTokenRef.current;

    setIsSwitching(true);
    setSessionId(targetSessionId);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (user) {
      const { data, error } = await supabase
        .from("chats")
        .select("question, answer, advisor")
        .eq("user_id", user.id)
        .eq("session_id", targetSessionId)
        .order("created_at", { ascending: true });

      if (currentLoadToken !== activeLoadTokenRef.current) {
        return;
      }

      if (!error && data) {
        const loadedMessages: Message[] = [];

        data.forEach((chat) => {
          if (chat.question) {
            loadedMessages.push({ type: "user", text: chat.question });
          }

          if (chat.answer) {
            loadedMessages.push({ type: "bot", text: chat.answer });
          }
        });

        setMessages(loadedMessages);

        if (data.length > 0 && data[0].advisor) {
          const advIndex = advisors.findIndex((a) => a.id === data[0].advisor);

          if (advIndex !== -1) {
            setSelected(advIndex);
            setOpenFolder(data[0].advisor);
          } else {
            setSelected(null);
            setOpenFolder(null);
          }
        } else {
          setSelected(null);
          setOpenFolder(null);
        }
      }
    }

    if (currentLoadToken === activeLoadTokenRef.current) {
      setIsSwitching(false);
    }
  };

  const deleteSession = async (targetSession: string | any) => {
    // هذه الخطوة تضمن أخذ الـ ID كنص سواء تم تمريره بشكل مباشر أو ككائن
    const actualSessionId = typeof targetSession === "object" && targetSession !== null
      ? targetSession.id
      : targetSession;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        throw new Error("User not found");
      }

      // نحذف من الداتابيز أولاً وبنعمل select عشان نتأكد إنه مسح بيانات فعلاً
      const { data, error } = await supabase
        .from("chats")
        .delete()
        .eq("user_id", user.id)
        .eq("session_id", actualSessionId)
        .select();

      if (error) {
        console.error("فشل الحذف من قاعدة البيانات:", error);
        return; // بنوقف هون وما بنحدث الواجهة عشان ما نخدع المستخدم
      }

      if (!data || data.length === 0) {
        console.warn("⚠️ تحذير: لم يتم حذف أي سجل من الداتابيز! تأكد من صلاحيات RLS في Supabase.");
      }

      // بنحدث الواجهة فقط بعد التأكد من العملية
      setSessionsList((prev) =>
        prev.filter((session) => session.id !== actualSessionId)
      );

      if (sessionId === actualSessionId) {
        activeLoadTokenRef.current += 1;

        setSessionId(createSessionId());
        setMessages([]);
        setQuestion("");
        setSelected(null);
        setOpenFolder(null);
        setIsLoading(false);
        setIsSwitching(false);
      }
    } catch (err) {
      console.error("حدث خطأ أثناء الحذف:", err);
    }
  };

  const updateLastBotMessage = (text: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;

      if (lastIndex >= 0 && updated[lastIndex].type === "bot") {
        updated[lastIndex] = { type: "bot", text };
      }

      return updated;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    goTo("/login");
  };

  const openLogoutModal = () => {
    setShowLogoutConfirm(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutConfirm(false);
  };

  const confirmLogout = async () => {
    await handleLogout();
  };

  const goToAdminPage = () => {
    goTo("/admin/users");
  };

  const handleSend = async () => {
    if (!question.trim() || isLoading) return;

    const currentQuestion = question.trim();
    const selectedAdvisor = selected !== null ? advisors[selected].id : null;
    const currentSessionId = sessionId || createSessionId();

    if (!sessionId) {
      setSessionId(currentSessionId);
    }

    setMessages((prev) => [
      ...prev,
      { type: "user", text: currentQuestion },
      { type: "bot", text: "" },
    ]);

    setQuestion("");
    setIsLoading(true);

    let botText = "";

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_MARKETING_ADVISOR_WEBHOOK_URL || "",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
          body: JSON.stringify({
            question: currentQuestion,
            selectedAdvisor,
            sessionId: currentSessionId,

            useDashboardContext,
            dashboardContext: useDashboardContext ? dashboardContext : null,
          }),
        }
      );

      const fullText = await response.text();

      setIsLoading(false);

      for (let i = 0; i < fullText.length; i++) {
        botText += fullText[i];
        updateLastBotMessage(botText);

        await new Promise((resolve) => setTimeout(resolve, 12));
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user) {
        await supabase.from("chats").insert([
          {
            user_id: user.id,
            session_id: currentSessionId,
            advisor: selectedAdvisor,
            question: currentQuestion,
            answer: botText,
          },
        ]);

        if (messages.length === 0) {
          setSessionsList((prev) => [
            ...prev,
            {
              id: currentSessionId,
              title: currentQuestion,
              advisorId: selectedAdvisor,
            },
          ]);

          setOpenFolder(selectedAdvisor);
        }
      }
    } catch (err) {
      console.error("Send error:", err);
      setIsLoading(false);
      updateLastBotMessage("حدث خطأ في الاتصال بالمستشار.");
    }
  };

  const groupedSessions = advisors
    .map((adv) => ({
      ...adv,
      sessions: sessionsList.filter((s) => s.advisorId === adv.id),
    }))
    .filter((g) => g.sessions.length > 0);

  const unassignedSessions = sessionsList
    .filter((s) => !s.advisorId)
    .slice()
    .reverse();

  return {
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
  };
}