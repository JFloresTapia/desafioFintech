export function ErrorMessage({ message }: { message: string | null }) {
  if (message === null) return null;
  return (
    <p className="alert alert-error" role="alert">
      {message}
    </p>
  );
}