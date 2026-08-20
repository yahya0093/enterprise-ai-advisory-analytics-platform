"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ProfileRow, ConfirmDeactivateUser } from "@/types/admin";

export default function useAdminUsersPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDeactivateUser, setConfirmDeactivateUser] =
    useState<ConfirmDeactivateUser>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const goTo = (path: string) => {
    window.location.href = path;
  };

  const fetchProfiles = async () => {
    setIsLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, role, is_approved, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("تعذر تحميل الحسابات");
      setIsLoading(false);
      return;
    }

    setProfiles((data || []) as ProfileRow[]);
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          goTo("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, is_approved")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          goTo("/");
          return;
        }

        if (!profile.is_approved || profile.role !== "admin") {
          goTo("/");
          return;
        }

        setIsCheckingAuth(false);
        fetchProfiles();
      } catch (error) {
        console.error(error);
        goTo("/");
      }
    };

    checkAdmin();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      setMessage("فشل تفعيل الحساب");
      setProcessingId(null);
      return;
    }

    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === id ? { ...profile, is_approved: true } : profile
      )
    );

    setProcessingId(null);
    setMessage("تم تفعيل الحساب بنجاح");
  };

  const openDeactivateModal = (id: string, username: string) => {
    setConfirmDeactivateUser({ id, username });
  };

  const closeDeactivateModal = () => {
    if (processingId) return;
    setConfirmDeactivateUser(null);
  };

  const handleDeactivateConfirmed = async () => {
    if (!confirmDeactivateUser) return;

    const { id } = confirmDeactivateUser;

    setProcessingId(id);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: false })
      .eq("id", id);

    if (error) {
      setMessage("فشل إلغاء تفعيل الحساب");
      setProcessingId(null);
      setConfirmDeactivateUser(null);
      return;
    }

    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === id ? { ...profile, is_approved: false } : profile
      )
    );

    setProcessingId(null);
    setConfirmDeactivateUser(null);
    setMessage("تم إلغاء تفعيل الحساب بنجاح");
  };

  const handleBack = () => {
    goTo("/");
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

  const pendingUsers = profiles.filter(
    (profile) => !profile.is_approved && profile.role !== "admin"
  );

  const approvedUsers = profiles.filter(
    (profile) => profile.is_approved || profile.role === "admin"
  );

  return {
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
  };
}