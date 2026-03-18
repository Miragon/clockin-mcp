import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";

export function registerSapTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_search_sap_events",
    "Search for events in SAP format within a date range. Max period varies by endpoint.",
    {
      start_date: z.string().describe("Start date (YYYY-MM-DD)"),
      end_date: z.string().describe("End date (YYYY-MM-DD)"),
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const result = await client.request("POST", "/v3/sap_events/search", { body: params });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_search_sap_event_logs",
    "Search for event change logs in SAP format. Rate limited to 180 requests/minute, max 48-hour period.",
    {
      start_date: z.string().describe("Start datetime (ISO 8601)"),
      end_date: z.string().describe("End datetime (ISO 8601)"),
      employee_id: z.number().optional().describe("Employee ID"),
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const result = await client.request("POST", "/v3/sap_event_logs/search", { body: params });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
