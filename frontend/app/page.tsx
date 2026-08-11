import Image from "next/image";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <Image
        src="/mini-mystiq-logo.png"
        alt="Mini Mystiq"
        width={280}
        height={127}
        priority
        className="max-w-[280px]"
        style={{ width: "auto", height: "auto" }}
      />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Mini Mystiq
      </h1>
      <p className="text-base text-neutral-600 sm:text-lg">Baby Clothes & Toys</p>
    </main>
  );
}
