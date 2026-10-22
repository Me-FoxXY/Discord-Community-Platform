"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="mx-auto min-h-[60vh] max-w-lg px-6 pb-20 pt-36 text-center" role="alert">
    <h1 className="text-3xl">We couldn't load this page</h1>
    <p className="my-5 text-ink-soft">Please try again. If it keeps happening, contact the server staff.</p>
    <button onClick={reset} className="rounded-full bg-forest-grad px-6 py-3 text-white">Try again</button>
  </div>;
}
