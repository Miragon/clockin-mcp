import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { paginationParams, buildQuery } from "../types.js";

export function registerWorkdayTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_search_workdays",
    "Search for workdays including activities and events for given employees in a date range",
    {
      employee_ids: z.array(z.number()).describe("List of Employee IDs"),
      start_date: z.string().describe("Start date (YYYY-MM-DD)"),
      end_date: z.string().describe("End date (YYYY-MM-DD)"),
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { page, ...body } = params;
      const result = await client.request("POST", "/v3/workdays/search", {
        body,
        query: buildQuery({ page }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
