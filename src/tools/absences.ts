import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { trashedParams, paginationParams, buildQuery } from "../types.js";

const absenceCategories = z.enum([
  "sick", "vacation", "workshop", "special_vacation", "school",
  "working_time_account", "holiday", "other", "parental_leave",
  "excused_absent", "not_excused_absent", "sick_industrial_accident",
  "short_time_work", "maternity_pay", "sick_child",
  "sick_child_no_payment", "vacation_no_payment", "sick_before_short_time_work",
]);

export function registerAbsenceTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_list_absences",
    "List all absences",
    {
      ...trashedParams,
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const result = await client.request("GET", "/v3/absences", {
        query: buildQuery(params),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_get_absence",
    "Get a single absence by ID",
    {
      absence: z.number().describe("Absence ID"),
      ...trashedParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { absence, ...rest } = params;
      const result = await client.request("GET", `/v3/absences/${absence}`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_create_absence",
    "Create a new absence",
    {
      employee_id: z.number().describe("Employee ID"),
      absencecategory_name: absenceCategories.describe("Absence category"),
      starts_at: z.string().describe("Start date (ISO 8601)"),
      ends_at: z.string().describe("End date (ISO 8601)"),
      half_day: z.boolean().optional(),
      approved: z.enum(["granted", "pending", "denied"]).optional(),
      comment: z.string().optional(),
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    async (params) => {
      const result = await client.request("POST", "/v3/absences", { body: params });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_update_absence",
    "Update an existing absence",
    {
      absence: z.number().describe("Absence ID"),
      employee_id: z.number().optional(),
      absencecategory_name: absenceCategories.optional(),
      starts_at: z.string().optional(),
      ends_at: z.string().optional(),
      half_day: z.boolean().optional(),
      approved: z.enum(["granted", "pending", "denied"]).optional(),
      comment: z.string().optional(),
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { absence, ...body } = params;
      const result = await client.request("PATCH", `/v3/absences/${absence}`, { body });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_delete_absence",
    "Delete an absence",
    {
      absence: z.number().describe("Absence ID"),
      force: z.boolean().optional().describe("Permanently delete"),
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const { absence, force } = params;
      const result = await client.request("DELETE", `/v3/absences/${absence}`, {
        query: buildQuery({ force }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_search_absences",
    "Search for absences. Scopes: byStartsAt (operator + value), byEndsAt (operator + value), byApprovals (values: granted/pending/denied). Sort fields: created_at, updated_at.",
    {
      scopes: z
        .array(
          z.object({
            name: z.enum(["byStartsAt", "byEndsAt", "byApprovals"]).describe("Scope name"),
            parameters: z.array(z.string()).optional(),
          })
        )
        .optional(),
      sort: z
        .array(
          z.object({
            field: z.enum(["created_at", "updated_at"]),
            direction: z.enum(["asc", "desc"]).optional(),
          })
        )
        .optional(),
      ...trashedParams,
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { with_trashed, only_trashed, page, ...body } = params;
      const result = await client.request("POST", "/v3/absences/search", {
        body,
        query: buildQuery({ with_trashed, only_trashed, page }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
