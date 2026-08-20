type UsersStatsCardsProps = {
  total: number;
  pending: number;
  approved: number;
};

export default function UsersStatsCards({
  total,
  pending,
  approved,
}: UsersStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-5">
        <p className="text-sm text-gray-400 mb-2">إجمالي الحسابات</p>
        <p className="text-3xl font-bold">{total}</p>
      </div>

      <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-5">
        <p className="text-sm text-gray-400 mb-2">الحسابات بانتظار التفعيل</p>
        <p className="text-3xl font-bold text-yellow-400">{pending}</p>
      </div>

      <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-5">
        <p className="text-sm text-gray-400 mb-2">الحسابات المفعلة</p>
        <p className="text-3xl font-bold text-green-400">{approved}</p>
      </div>
    </div>
  );
}