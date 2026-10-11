"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdvancedCreateForm } from "../../components/AdvancedCreateForm";
import { isLoggedIn } from "@/lib/auth-client";

export default function CreatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login?next=/create");
      return;
    }

    setReady(true);
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