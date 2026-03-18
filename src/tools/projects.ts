import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { ScopeSchema, SortSchema, IncludeSchema, trashedParams, paginationParams, buildQuery } from "../types.js";

const projectIncludes = z
  .enum(["signed_url", "employees", "subProjects", "customer", "projectTags", "signedUrl", "customFields"])
  .optional()
  .describe("Related resource to include");

export function registerProjectTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_list_projects",
    "List all projects with optional pagination and trashed filters",
    {
      ...trashedParams,
      ...paginationParams,
      include: projectIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const result = await client.request("GET", "/v3/projects", {
        query: buildQuery(params),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_get_project",
    "Get a single project by ID",
    {
      project: z.number().describe("Project ID"),
      ...trashedParams,
      include: projectIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { project, ...rest } = params;
      const result = await client.request("GET", `/v3/projects/${project}`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_create_project",
    "Create a new project",
    {
      name: z.string().describe("Project name (required)"),
      number: z.string().optional().describe("Project number"),
      customer_id: z.number().optional().describe("Customer ID"),
      destination_name: z.string().optional(),
      destination_zip: z.string().optional(),
      destination_city: z.string().optional(),
      destination_street: z.string().optional(),
      contact_name: z.string().optional(),
      contact_phone: z.string().optional(),
      archived: z.boolean().optional(),
      source: z.enum(["sap"]).optional().describe("Source system identifier"),
      department: z.string().optional(),
      cost_center: z.string().optional(),
      description: z.string().optional(),
      start_date: z.string().optional().describe("ISO 8601 datetime"),
      end_date: z.string().optional().describe("ISO 8601 datetime"),
      max_personnel_cost: z.number().optional(),
      project_wage: z.number().optional(),
      max_hours: z.number().optional(),
      color: z.string().optional().describe("Hex color e.g. #A1A1AA"),
      parent_id: z.number().optional().describe("Parent project ID for sub-projects"),
      projectTags: z.array(z.string()).optional().describe("List of tag names"),
      custom_fields: z
        .array(z.object({ custom_field_id: z.number(), value: z.string() }))
        .optional()
        .describe("Custom field values"),
      include: projectIncludes,
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    async (params) => {
      const { include, ...body } = params;
      const result = await client.request("POST", "/v3/projects", {
        body,
        query: buildQuery({ include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_update_project",
    "Update an existing project",
    {
      project: z.number().describe("Project ID"),
      name: z.string().optional().describe("Project name"),
      number: z.string().optional(),
      customer_id: z.number().optional(),
      destination_name: z.string().optional(),
      destination_zip: z.string().optional(),
      destination_city: z.string().optional(),
      destination_street: z.string().optional(),
      contact_name: z.string().optional(),
      contact_phone: z.string().optional(),
      archived: z.boolean().optional(),
      source: z.enum(["sap"]).optional(),
      department: z.string().optional(),
      cost_center: z.string().optional(),
      description: z.string().optional(),
      start_date: z.string().optional().describe("ISO 8601 datetime"),
      end_date: z.string().optional().describe("ISO 8601 datetime"),
      max_personnel_cost: z.number().optional(),
      project_wage: z.number().optional(),
      max_hours: z.number().optional(),
      color: z.string().optional(),
      parent_id: z.number().optional(),
      projectTags: z.array(z.string()).optional(),
      custom_fields: z
        .array(z.object({ custom_field_id: z.number(), value: z.string() }))
        .optional(),
      include: projectIncludes,
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { project, include, ...body } = params;
      const result = await client.request("PATCH", `/v3/projects/${project}`, {
        body,
        query: buildQuery({ include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_delete_project",
    "Delete a project (soft-delete by default, use force=true for permanent deletion)",
    {
      project: z.number().describe("Project ID"),
      force: z.boolean().optional().describe("Permanently delete"),
      include: projectIncludes,
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const { project, ...rest } = params;
      const result = await client.request("DELETE", `/v3/projects/${project}`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_search_projects",
    "Search for projects using scopes, sorting, and includes. Scopes: archived, unarchived, completed, uncompleted, byStates (values: active/completed/archived), byCreatedAt, byUpdatedAt, byStartDate, byEndDate (operator + value), byName, byNumber, byCustomer, bySource (value). Sort fields: created_at, updated_at, start_date, end_date.",
    {
      scopes: z
        .array(
          z.object({
            name: z
              .enum([
                "archived", "unarchived", "completed", "uncompleted",
                "byStates", "byCreatedAt", "byUpdatedAt", "byStartDate",
                "byEndDate", "byName", "byNumber", "byCustomer", "bySource",
              ])
              .describe("Scope name"),
            parameters: z.array(z.string()).optional().describe("Scope parameters"),
          })
        )
        .optional(),
      sort: z.array(SortSchema).optional(),
      includes: z
        .array(
          z.object({
            relation: z
              .enum(["employees", "subProjects", "customer", "projectTags", "signedUrl", "customFields"])
              .describe("Relation to include"),
          })
        )
        .optional(),
      ...trashedParams,
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { with_trashed, only_trashed, page, ...body } = params;
      const result = await client.request("POST", "/v3/projects/search", {
        body,
        query: buildQuery({ with_trashed, only_trashed, page }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_get_project_custom_fields",
    "Get all available custom field configurations for projects",
    {},
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async () => {
      const result = await client.request("GET", "/v3/projects/custom-fields");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
