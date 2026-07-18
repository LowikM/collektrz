import { redirect } from "next/navigation";

import { FastAddExperience } from "@/components/fast-add/FastAddExperience";
import { createClient } from "@/lib/supabase/server";

type FastAddPageProps = {
  searchParams: Promise<{ method?: string }>;
};

function parseInitialMethod(method: string | undefined) {
  if (method === "search" || method === "upload" || method === "camera") {
    return method;
  }

  return undefined;
}

export default async function FastAddPage({ searchParams }: FastAddPageProps) {
  const { method } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-3xl">
        <FastAddExperience initialMethod={parseInitialMethod(method)} />
      </div>
    </div>
  );
}
