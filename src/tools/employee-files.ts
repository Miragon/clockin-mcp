import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { trashedParams, paginationParams, buildQuery } from "../types.js";

export function registerEmployeeFileTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_create_employee_file",
    "Create a file attachment for an employee",
    {
      employee: z.number().describe("Employee ID"),
      base64_encoded_string: z.string().describe("Base64 encoded file content"),
      uuid: z.string().describe("Unique identifier for the file"),
      category: z
        .enum([
          "jobreferences", "warnings", "correspondence", "officialdocuments",
          "application", "socialsecurity", "taxes", "others", "contract",
          "certificates", "targets",
        ])
        .optional()
        .describe("File category"),
      name: z.string().optional().describe("File name"),
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    async (params) => {
      const { employee, ...body } = params;
      const result = await client.request("POST", `/v3/employees/${employee}/files`, { body });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_list_employee_files",
    "List files for an employee",
    {
      employee: z.number().describe("Employee ID"),
      ...trashedParams,
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { employee, ...rest } = params;
      const result = await client.request("GET", `/v3/employees/${employee}/files`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_delete_employee_file",
    "Delete an employee file",
    {
      employee: z.number().describe("Employee ID"),
      file: z.number().describe("File ID"),
      force: z.boolean().optional().describe("Permanently delete"),
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const { employee, file, force } = params;
      const result = await client.request("DELETE", `/v3/employees/${employee}/files/${file}`, {
        query: buildQuery({ force }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
