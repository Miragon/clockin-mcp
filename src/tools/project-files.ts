import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { SortSchema, trashedParams, paginationParams, buildQuery } from "../types.js";

export function registerProjectFileTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_create_project_file",
    "Create a file attachment for a project",
    {
      project: z.number().describe("Project ID"),
      title: z.string().describe("File title"),
      base64_encoded_string: z.string().describe("Base64 encoded file content"),
      user_defined_created_at: z.string().optional().describe("Custom creation date (ISO 8601)"),
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    async (params) => {
      const { project, ...body } = params;
      const result = await client.request("POST", `/v3/projects/${project}/files`, { body });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_search_project_files",
    "Search for project files. Scopes: byCreatedAt (operator + value), byUpdatedAt (operator + value), byTypes (value: attachment/note/checklist/confirmation). Sort fields: created_at, updated_at.",
    {
      project: z.number().describe("Project ID"),
      scopes: z
        .array(
          z.object({
            name: z.enum(["byCreatedAt", "byUpdatedAt", "byTypes"]).describe("Scope name"),
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
      const { project, with_trashed, only_trashed, page, ...body } = params;
      const result = await client.request("POST", `/v3/projects/${project}/files/search`, {
        body,
        query: buildQuery({ with_trashed, only_trashed, page }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
