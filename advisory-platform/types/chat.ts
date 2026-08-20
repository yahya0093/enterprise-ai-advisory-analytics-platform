export type Message = {
  type: "user" | "bot";
  text: string;
};

export type Advisor = {
  id: string;
  name: string;
  role: string;
  icon: string;
};

export type ChatSession = {
  id: string;
  title: string;
  advisorId: string | null;
};