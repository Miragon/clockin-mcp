import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { trashedParams, paginationParams, buildQuery } from "../types.js";

export function registerProjectEmployeeTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_list_project_employees",
    "List employees assigned to a project",
    {
      project: z.number().describe("Project ID"),
      ...trashedParams,
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { project, ...rest } = params;
      const result = await client.request("GET", `/v3/projects/${project}/employees`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_attach_project_employees",
    "Attach employees to a project",
    {
      project: z.number().describe("Project ID"),
      resources: z.array(z.number()).describe("Employee IDs to attach"),
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { project, resources } = params;
      const result = await client.request("POST", `/v3/projects/${project}/employees/attach`, {
        body: { resources },
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_detach_project_employees",
    "Detach employees from a project",
    {
      project: z.number().describe("Project ID"),
      resources: z.array(z.number()).describe("Employee IDs to detach"),
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const { project, resources } = params;
      const result = await client.request("DELETE", `/v3/projects/${project}/employees/detach`, {
        body: { resources },
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
