import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type ResultsProps<T, K extends string> = {
  title: string;
  path: string;
  listKey: K;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: T[] };

function CapabilityResults<T extends { _id?: string }, K extends string>({
  title, path, listKey, emptyText, renderItem,
}: ResultsProps<T, K>) {
  const [state, setState] = useState<RequestState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<Record<K, T[]>>(path).then(
      data => {
        if (!active) return;
        const items = data?.[listKey];
        setState(Array.isArray(items) ? { status: 'ready', items } : { status: 'error' });
      },
      () => { if (active) setState({ status: 'error' }); },
    );
    return () => { active = false; };
  }, [path, listKey]);

  if (state.status === 'loading') return <p role="status">Loading {title.toLowerCase()}...</p>;
  if (state.status === 'error') return <p role="alert">Unable to load {title.toLowerCase()}.</p>;
  if (state.items.length === 0) return <p>{emptyText}</p>;

  return (
    <ul className="list-group">
      {state.items.map((item, index) => (
        <li className="list-group-item" key={item._id ?? index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

export function CapabilityCard<T extends { _id?: string }, K extends string>({
  title, description, children, ...results
}: ResultsProps<T, K> & { description: string; children?: ReactNode }) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {children}
        <CapabilityResults key={results.path} title={title} {...results} />
      </div>
    </section>
  );
}
