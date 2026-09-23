export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="space-y-6 w-full max-w-6xl">
        {/* Hero skeleton */}
        <div className="h-64 rounded-3xl bg-muted animate-pulse" />
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-muted animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </div>
    </div>
  );
}
