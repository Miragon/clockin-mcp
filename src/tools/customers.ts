import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { trashedParams, paginationParams, buildQuery } from "../types.js";

const customerIncludes = z.enum(["customFields"]).optional().describe("Related resource to include");

export function registerCustomerTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_list_customers",
    "List all customers",
    {
      ...trashedParams,
      ...paginationParams,
      include: customerIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const result = await client.request("GET", "/v3/customers", {
        query: buildQuery(params),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_get_customer",
    "Get a single customer by ID",
    {
      customer: z.number().describe("Customer ID"),
      ...trashedParams,
      include: customerIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { customer, ...rest } = params;
      const result = await client.request("GET", `/v3/customers/${customer}`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_create_customer",
    "Create a new customer",
    {
      company: z.string().describe("Company name (required)"),
      identifier: z.string().optional().describe("Customer identifier/number"),
      street: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional().describe("ISO 3166-1 alpha-2"),
      contact_name: z.string().optional(),
      contact_phone: z.string().optional(),
      contact_email: z.string().optional(),
      website: z.string().optional(),
      description: z.string().optional(),
      custom_fields: z
        .array(z.object({ custom_field_id: z.number(), value: z.string() }))
        .optional(),
      include: customerIncludes,
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    async (params) => {
      const { include, ...body } = params;
      const result = await client.request("POST", "/v3/customers", {
        body,
        query: buildQuery({ include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_update_customer",
    "Update an existing customer",
    {
      customer: z.number().describe("Customer ID"),
      company: z.string().optional(),
      identifier: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional().describe("ISO 3166-1 alpha-2"),
      contact_name: z.string().optional(),
      contact_phone: z.string().optional(),
      contact_email: z.string().optional(),
      website: z.string().optional(),
      description: z.string().optional(),
      custom_fields: z
        .array(z.object({ custom_field_id: z.number(), value: z.string() }))
        .optional(),
      include: customerIncludes,
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { customer, include, ...body } = params;
      const result = await client.request("PATCH", `/v3/customers/${customer}`, {
        body,
        query: buildQuery({ include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_delete_customer",
    "Delete a customer (soft-delete by default, use force=true for permanent deletion)",
    {
      customer: z.number().describe("Customer ID"),
      force: z.boolean().optional().describe("Permanently delete"),
      include: customerIncludes,
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const { customer, ...rest } = params;
      const result = await client.request("DELETE", `/v3/customers/${customer}`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_search_customers",
    "Search for customers. Scopes: byNameOrNumber (value), byIdentifier (value, supports wildcard *). Sort fields: created_at, updated_at.",
    {
      scopes: z
        .array(
          z.object({
            name: z.enum(["byNameOrNumber", "byIdentifier"]).describe("Scope name"),
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
      include: customerIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { with_trashed, only_trashed, page, include, ...body } = params;
      const result = await client.request("POST", "/v3/customers/search", {
        body,
        query: buildQuery({ with_trashed, only_trashed, page, include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_get_customer_custom_fields",
    "Get all available custom field configurations for customers",
    {},
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async () => {
      const result = await client.request("GET", "/v3/customers/custom-fields");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
