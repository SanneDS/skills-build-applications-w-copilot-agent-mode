import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot: string; members: string[] };

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="View teams and their membership counts."
      path="/api/teams"
      listKey="teams"
      emptyText="No teams have been created yet."
      renderItem={({ name, mascot, members }: Team) => (
        <><strong>{name}</strong>{mascot && <> ({mascot})</>}: {members.length} {members.length === 1 ? 'member' : 'members'}</>
      )}
    />
  );
}
