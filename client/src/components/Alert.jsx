export default function Alert({ type = 'error', message, errors = [] }) {
  if (!message) return null;

  const color =
    type === 'error'
      ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
      : 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200';

  return (
    <div role="alert" className={`rounded-lg border p-3 text-sm ${color}`}>
      <p>{message}</p>
      {errors.length > 0 && (
        <ul className="mt-1 list-disc pl-5">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}