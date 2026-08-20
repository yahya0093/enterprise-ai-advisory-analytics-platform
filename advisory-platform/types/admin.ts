export type ProfileRow = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  is_approved: boolean;
  created_at: string;
};

export type ConfirmDeactivateUser = {
  id: string;
  username: string;
} | null;