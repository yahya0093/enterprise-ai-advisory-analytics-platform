type ChatInputProps = {
  question: string;
  setQuestion: (value: string) => void;
  selected: number | null;
  advisors: { name: string }[];
  isLoading: boolean;
  onSend: () => void;
};

export default function ChatInput({
  question,
  setQuestion,
  selected,
  advisors,
  isLoading,
  onSend,
}: ChatInputProps) {
  return (
    <div className="absolute bottom-0 left-0 w-full px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 pt-6 flex justify-center bg-gradient-to-t from-[#05070A] via-[#05070A]/95 to-transparent flex-shrink-0 z-20">
      <div className="w-full max-w-3xl bg-[#0D131B]/95 border border-slate-800 rounded-[22px] sm:rounded-[26px] p-2 flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.35)] focus-within:border-slate-700 focus-within:shadow-[0_10px_40px_rgba(37,99,235,0.08)] transition-all">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
          placeholder={
            selected !== null
              ? `اسأل المستشار ${advisors[selected].name}...`
              : "اختر مستشاراً أو اكتب رسالتك هنا..."
          }
          className="flex-1 min-w-0 bg-transparent outline-none text-white px-3 sm:px-4 py-3 text-sm sm:text-base placeholder:text-slate-500 disabled:opacity-50"
        />

        <button
          onClick={onSend}
          disabled={isLoading || !question.trim()}
          className={`shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all font-bold text-sm sm:text-base ${
            isLoading || !question.trim()
              ? "bg-slate-800/70 text-slate-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer"
          }`}
        >
          إرسال
        </button>
      </div>
    </div>
  );
}