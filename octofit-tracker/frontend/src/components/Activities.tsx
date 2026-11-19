import { CapabilityCard } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      listKey="activities"
      emptyText="No activities recorded yet."
      renderItem={({ type, minutes, points }: Activity) => <>{type}: {minutes} min, {points} points</>}
    />
  );
}
