"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="rounded-3xl border border-border/50 bg-card p-8 sm:p-12 shadow-soft max-w-md w-full">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We hit a small snag loading this page. This is usually temporary — please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
