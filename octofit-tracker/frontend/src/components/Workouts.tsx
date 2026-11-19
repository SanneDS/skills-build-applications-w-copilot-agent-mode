import { useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { _id?: string; title: string; reason: string };
const demoEmail = 'mona@example.com';

export default function Workouts() {
  const [email, setEmail] = useState(demoEmail);

  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Find workouts based on your fitness goal or recent activity."
      path={`/api/workouts/suggestions/${encodeURIComponent(email)}`}
      listKey="suggestions"
      emptyText="No workout suggestions found."
      renderItem={({ title, reason }: Suggestion) => <><strong>{title}</strong>: {reason}</>}
    >
      <form className="mb-3" onSubmit={event => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get('email');
        if (typeof value === 'string') setEmail(value.trim());
      }}>
        <label className="form-label" htmlFor="workout-email">User email</label>
        <div className="input-group">
          <input className="form-control" id="workout-email" name="email" type="email" defaultValue={demoEmail} required />
          <button className="btn btn-primary" type="submit">Find workouts</button>
        </div>
      </form>
    </CapabilityCard>
  );
}
