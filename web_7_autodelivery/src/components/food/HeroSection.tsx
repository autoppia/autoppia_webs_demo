import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-5 md:py-5 bg-white rounded-xl shadow-md mb-12 flex flex-col items-center text-center">
      <h1 className="text-2xl md:text-4xl font-extrabold mb-4 tracking-tight text-zinc-900">
        Delicious food,
        <br /> delivered to your door
      </h1>
      <p className="text-lg mb-8 max-w-xl text-zinc-600">
        Discover the best restaurants and cuisines. Order fresh, fast, and easy
        — anytime, anywhere.
      </p>
      <Button
        asChild
        size="lg"
        className="text-lg px-8 py-2 rounded-full shadow-lg"
      >
        <Link href="/restaurants">Order Now</Link>
      </Button>
    </section>
  );
}
