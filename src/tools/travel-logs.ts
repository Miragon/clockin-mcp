import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { paginationParams, buildQuery } from "../types.js";

export function registerTravelLogTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_list_travel_logs",
    "List all travel logs",
    {
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const result = await client.request("GET", "/v3/travel_logs", {
        query: buildQuery(params),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
