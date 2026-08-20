export default function BotThinkingBubble() {
  return (
    <div className="self-start max-w-[85%] mt-2">
      <div className="flex items-end gap-3">
        <div className="h-11 w-11 rounded-2xl border border-slate-700/80 bg-[#121821] flex items-center justify-center shadow-lg shadow-black/30">
          🤖
        </div>

        <div className="rounded-2xl rounded-bl-md border border-slate-800 bg-[#111821] px-4 py-3 shadow-xl shadow-black/30">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">جاري التحليل</span>
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce bg-slate-400 rounded-full" />
              <span className="h-2 w-2 animate-bounce bg-slate-400 rounded-full [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce bg-slate-400 rounded-full [animation-delay:-0.3s]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}