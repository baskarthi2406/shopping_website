import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <Container className="flex flex-col items-center py-8 text-center sm:py-12">
      <h1 className="text-h1 font-semibold tracking-tight text-foreground">
        Mini Mystiq
      </h1>
      <p className="mt-2 text-body text-foreground-secondary">
        Baby Clothes & Toys
      </p>
    </Container>
  );
}
