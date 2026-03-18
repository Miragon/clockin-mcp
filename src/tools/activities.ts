import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { paginationParams, buildQuery } from "../types.js";

export function registerActivityTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_search_activities",
    "Search for activities. Without scopes returns all activities for all company employees. Scopes: byStartsAt, byEndsAt (operator + value), byEmployeeId, byProjectId, byDeviceId (value as array of IDs), byEmployeePersonnelNumber, byCustomerIdentifier, byProjectNumber (value, supports wildcard *), byEmployeeSource (value).",
    {
      scopes: z
        .array(
          z.object({
            name: z
              .enum([
                "byStartsAt", "byEndsAt", "byEmployeeId", "byProjectId",
                "byDeviceId", "byEmployeePersonnelNumber", "byCustomerIdentifier",
                "byProjectNumber", "byEmployeeSource",
              ])
              .describe("Scope name"),
            parameters: z.array(z.union([z.string(), z.number()]).transform(String)).optional(),
          })
        )
        .optional(),
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { page, ...body } = params;
      const result = await client.request("POST", "/v3/activities/search", {
        body,
        query: buildQuery({ page }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
