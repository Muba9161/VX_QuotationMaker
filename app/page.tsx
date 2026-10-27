"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Opening Acme Technologies Workspace...</span>
      </div>
    </div>
  );
}
