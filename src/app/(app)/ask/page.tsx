import { requireSession } from "@/lib/auth";
import { AskClient } from "@/components/ask-client";

export default async function AskPage() {
  await requireSession();
  return <AskClient />;
}
