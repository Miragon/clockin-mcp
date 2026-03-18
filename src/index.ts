#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ClockInClient } from "./client.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerProjectEmployeeTools } from "./tools/project-employees.js";
import { registerProjectFileTools } from "./tools/project-files.js";
import { registerEmployeeTools } from "./tools/employees.js";
import { registerEmployeeProjectTools } from "./tools/employee-projects.js";
import { registerEmployeeFileTools } from "./tools/employee-files.js";
import { registerCustomerTools } from "./tools/customers.js";
import { registerAbsenceTools } from "./tools/absences.js";
import { registerWorkdayTools } from "./tools/workdays.js";
import { registerActivityTools } from "./tools/activities.js";
import { registerEventTools } from "./tools/events.js";
import { registerTravelLogTools } from "./tools/travel-logs.js";
import { registerSapTools } from "./tools/sap.js";
import { registerDeviceTools } from "./tools/devices.js";

const server = new McpServer({
  name: "clockin-mcp-server",
  version: "1.0.0",
});

const client = new ClockInClient();

registerProjectTools(server, client);
registerProjectEmployeeTools(server, client);
registerProjectFileTools(server, client);
registerEmployeeTools(server, client);
registerEmployeeProjectTools(server, client);
registerEmployeeFileTools(server, client);
registerCustomerTools(server, client);
registerAbsenceTools(server, client);
registerWorkdayTools(server, client);
registerActivityTools(server, client);
registerEventTools(server, client);
registerTravelLogTools(server, client);
registerSapTools(server, client);
registerDeviceTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
