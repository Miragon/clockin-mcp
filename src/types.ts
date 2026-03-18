import { z } from "zod";

export const ScopeSchema = z.object({
  name: z.string().describe("Scope name"),
  parameters: z.array(z.string()).optional().describe("Scope parameters"),
});

export const SortSchema = z.object({
  field: z.string().describe("Field to sort by"),
  direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
});

export const IncludeSchema = z.object({
  relation: z.string().describe("Relation to include"),
});

export const trashedParams = {
  with_trashed: z.boolean().optional().describe("Include soft-deleted records"),
  only_trashed: z.boolean().optional().describe("Return only soft-deleted records"),
};

export const paginationParams = {
  page: z.number().optional().describe("Page number for pagination"),
};

export function buildQuery(
  params: Record<string, unknown>
): Record<string, string | undefined> {
  const query: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "boolean") {
      query[key] = value ? "1" : "0";
    } else if (typeof value === "number") {
      query[key] = String(value);
    } else if (typeof value === "string") {
      query[key] = value;
    }
  }
  return query;
}
