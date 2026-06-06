export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm text-muted-foreground">
          Moggle AI — Personal Use Edition
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          All analysis is processed locally. No data is stored or transmitted
          except AI metrics for recommendations.
        </p>
      </div>
    </footer>
  );
}
