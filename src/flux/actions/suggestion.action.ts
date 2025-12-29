import { insertRow } from "../../../app/supabase";

export async function submitSuggestion(data: {
  name: string;
  clientEmail: string;
  description: string;
  createdAt: string;
}) {
  return insertRow("suggestions", data);
}
