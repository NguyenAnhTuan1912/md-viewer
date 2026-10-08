import { apiClient } from "@/lib/api/client";
import type { TSource } from "@/lib/api/types";

export type TAddSourceInput = {
  path: string;
  name?: string;
};

export function addSource(input: TAddSourceInput) {
  return apiClient.post<TSource>("/sources", input);
}
