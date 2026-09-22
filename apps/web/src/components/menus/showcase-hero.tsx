import { OrnamentalPattern } from "./ornamental-pattern";

export function ShowcaseHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2c1a10] via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_-10%,rgba(232,152,94,0.22),transparent)]" />
      <OrnamentalPattern id="hero-ornament" className="text-accent opacity-[0.05]" />
      <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground shadow-lg shadow-primary/30">
          S
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
    </div>
  );
}
