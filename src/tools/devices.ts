import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { paginationParams, buildQuery } from "../types.js";

export function registerDeviceTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_list_devices",
    "List all devices",
    {
      ...paginationParams,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const result = await client.request("GET", "/v3/devices", {
        query: buildQuery(params),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_attach_device_employees",
    "Attach employees to a device",
    {
      device: z.number().describe("Device ID"),
      resources: z.array(z.number()).describe("Employee IDs to attach"),
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { device, resources } = params;
      const result = await client.request("POST", `/v3/devices/${device}/employees/attach`, {
        body: { resources },
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_detach_device_employees",
    "Detach employees from a device",
    {
      device: z.number().describe("Device ID"),
      resources: z.array(z.number()).describe("Employee IDs to detach"),
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const { device, resources } = params;
      const result = await client.request("DELETE", `/v3/devices/${device}/employees/detach`, {
        body: { resources },
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
