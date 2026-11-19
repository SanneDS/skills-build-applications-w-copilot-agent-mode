import { CapabilityCard } from './CapabilityCard.js';

type Entry = { _id?: string; teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      listKey="leaderboard"
      emptyText="No rankings are available yet."
      renderItem={({ teamName, totalPoints, rank }: Entry) => (
        <><strong>{rank}. {teamName}</strong>: {totalPoints} points</>
      )}
    />
  );
}
