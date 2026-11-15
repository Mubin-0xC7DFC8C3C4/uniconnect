export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-line-strong px-4 py-8 r-md">
      <p className="type-sm font-medium text-fg">{title}</p>
      <p className="mt-2 max-w-prose type-sm text-muted">{body}</p>
    </div>
  );
}
