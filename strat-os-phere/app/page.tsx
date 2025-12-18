import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-2xl font-semibold">StratOSphere</h1>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </main>
    </div>
  );
}
