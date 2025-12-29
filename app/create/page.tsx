"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdvancedCreateForm } from "../../components/AdvancedCreateForm";
import { getAccountEmail } from "@/lib/auth-client";

export default function CreatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const email = await getAccountEmail();
      if (cancelled) return;
      if (!email) {
        router.replace("/login?next=/create");
        return;
      }
      setReady(true);
    };
    void check();
    return () => { cancelled = true; };
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="surface px-6 py-4 text-sm font-semibold text-slate-700">
          Checking your account...
        </div>
      </main>
    );
  }

  return <AdvancedCreateForm />;
}