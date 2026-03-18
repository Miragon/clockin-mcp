import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { trashedParams, paginationParams, buildQuery } from "../types.js";

const employeeProjectIncludes = z
  .enum(["employees", "subProjects"])
  .optional()
  .describe("Related resource to include");

export function registerEmployeeProjectTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_list_employee_projects",
    "List projects assigned to an employee",
    {
      employee: z.number().describe("Employee ID"),
      ...trashedParams,
      ...paginationParams,
      include: employeeProjectIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { employee, ...rest } = params;
      const result = await client.request("GET", `/v3/employees/${employee}/projects`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_attach_employee_projects",
    "Attach projects to an employee",
    {
      employee: z.number().describe("Employee ID"),
      resources: z.array(z.number()).describe("Project IDs to attach"),
      include: employeeProjectIncludes,
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { employee, resources, include } = params;
      const result = await client.request("POST", `/v3/employees/${employee}/projects/attach`, {
        body: { resources },
        query: buildQuery({ include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_detach_employee_projects",
    "Detach projects from an employee",
    {
      employee: z.number().describe("Employee ID"),
      resources: z.array(z.number()).describe("Project IDs to detach"),
      include: employeeProjectIncludes,
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const { employee, resources, include } = params;
      const result = await client.request("DELETE", `/v3/employees/${employee}/projects/detach`, {
        body: { resources },
        query: buildQuery({ include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
