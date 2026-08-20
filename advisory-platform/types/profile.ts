export type Profile = {
  username: string;
  email: string;
  role: "admin" | "user";
  is_approved: boolean;
};