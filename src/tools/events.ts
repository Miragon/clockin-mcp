import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { paginationParams, buildQuery } from "../types.js";

export function registerEventTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_create_event",
    "Create a time tracking event. Task IDs: 2=LOADING_TIME, 3=DRIVING_TIME, 4=PROJECT, 5=PAUSE, 6=SPECIAL_1, 7=SPECIAL_2, 8=LOGOUT, 9=BUSINESS_TRIP, 10=WORKING_TIME",
    {
      occured_at: z.string().describe("Event time (ISO 8601)"),
      task_id: z.number().describe("Task type ID (2-10)"),
      employee_id: z.number().describe("Employee ID"),
      task_label: z.string().optional().describe("Custom label for the task"),
      project_id: z.number().optional().describe("Project reference"),
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    async (params) => {
      const result = await client.request("POST", "/v3/events", { body: params });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_search_events",
    "Search for events. Scopes: byOccuredAt (operator + value), byEmployeeId (value as array of IDs), byTaskId (value as array of IDs). Sort fields: occured_at.",
    {
      scopes: z
        .array(
          z.object({
            name: z.enum(["byOccuredAt", "byEmployeeId", "byTaskId"]).describe("Scope name"),
            parameters: z.array(z.union([z.string(), z.number()]).transform(String)).optional(),
          })
        )
        .optional(),
      sort: z
        .array(
          z.object({
            field: z.enum(["occured_at"]),
            direction: z.enum(["asc", "desc"]).optional(),
          })
        )
        .optional(),
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { page, ...body } = params;
      const result = await client.request("POST", "/v3/events/search", {
        body,
        query: buildQuery({ page }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_delete_event",
    "Delete an event",
    {
      event: z.number().describe("Event ID"),
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const result = await client.request("DELETE", `/v3/events/${params.event}`);
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
