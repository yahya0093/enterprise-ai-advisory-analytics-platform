import AdvisorCard from "@/components/chat/AdvisorCard";

type Advisor = {
  id: string;
  name: string;
  role: string;
  icon: string;
};

type AdvisorsGridProps = {
  advisors: Advisor[];
  selected: number | null;
  onSelect: (index: number) => void;
};

export default function AdvisorsGrid({
  advisors,
  selected,
  onSelect,
}: AdvisorsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 w-full">
      {advisors.map((advisor, index) => (
        <AdvisorCard
          key={advisor.id}
          icon={advisor.icon}
          name={advisor.name}
          role={advisor.role}
          isSelected={selected === index}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}