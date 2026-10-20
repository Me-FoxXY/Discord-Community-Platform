import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="pt-32 sm:pt-40">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <Skeleton className="h-8 w-48 rounded-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-3/4" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-5xl" />
        </div>
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-4xl" />
          ))}
        </div>
      </Container>
    </div>
  );
}
