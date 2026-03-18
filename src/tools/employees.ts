import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClockInClient } from "../client.js";
import { SortSchema, trashedParams, paginationParams, buildQuery } from "../types.js";

const employeeIncludes = z
  .enum(["department", "files", "superior", "onboardingSecret", "customFields"])
  .optional()
  .describe("Related resource to include");

export function registerEmployeeTools(server: McpServer, client: ClockInClient) {
  server.tool(
    "clockin_list_employees",
    "List all employees with optional pagination and trashed filters",
    {
      ...trashedParams,
      ...paginationParams,
      include: employeeIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const result = await client.request("GET", "/v3/employees", {
        query: buildQuery(params),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_get_employee",
    "Get a single employee by ID",
    {
      employee: z.number().describe("Employee ID"),
      ...trashedParams,
      include: employeeIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { employee, ...rest } = params;
      const result = await client.request("GET", `/v3/employees/${employee}`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_create_employee",
    "Create a new employee",
    {
      first_name: z.string().describe("First name"),
      last_name: z.string().describe("Last name"),
      personnel_number: z.string().optional().describe("Personnel number"),
      pin: z.string().optional().describe("PIN (defaults to 1234)"),
      pin_change_required: z.string().optional(),
      email: z.string().optional(),
      app_language: z.string().optional(),
      color: z.string().optional().describe("Hex color e.g. 60A5FA"),
      costcenter: z.string().optional(),
      department_name: z.string().optional(),
      device_ids: z.array(z.number()).optional(),
      hourly_wage: z.number().optional(),
      gender: z.enum(["MR", "MRS", "DIVERS"]).optional(),
      position: z.string().optional(),
      mobile_work: z.string().optional(),
      phone_work: z.string().optional(),
      source: z.enum(["sap"]).optional(),
      nationality: z.array(z.string().describe("ISO 3166-1 alpha-2 country code")).optional(),
      birthday: z.string().optional().describe("Date YYYY-MM-DD"),
      birthplace: z.string().optional(),
      street: z.string().optional(),
      house_number: z.string().optional(),
      zip: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional().describe("ISO 3166-1 alpha-2 country code"),
      region: z.string().optional().describe("Region/state name"),
      entry_date: z.string().optional().describe("Date YYYY-MM-DD"),
      contract_ending: z.string().optional().describe("Date YYYY-MM-DD"),
      school_education: z
        .enum(["NO_EDUCATION", "SECONDARY_SCHOOL", "SECONDARY_SCHOOL_CERTIFICATE", "VOCATIONAL_BACCALAUREATE", "UNIVERSITY_ENTRANCE_QUALIFICATION"])
        .optional(),
      work_education: z
        .enum(["VOCATIONAL_TRAINING", "VOCATIONAL_TRAINING_FURTHER_EDUCATION", "MASTER_CRAFTSMAN", "DIPLOMA", "BACHELOR", "MASTER", "STATE_EXAMINATION", "DOCTOR", "PROFESSOR", "OTHER"])
        .optional(),
      employment_type: z
        .enum(["INTERNSHIP", "TEMPORARY_EMPLOYEE", "STUDENT_ASSISTANT", "EDUCATION", "PART_TIME", "FULL_TIME", "FREELANCER", "SELF_EMPLOYED", "OTHER"])
        .optional(),
      marital_status: z
        .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "REGISTERED_PARTNERSHIP", "PARTNER_DIED", "SEPARATED"])
        .optional(),
      type_of_healthcare: z.enum(["PRIVATE", "STATUTORY", "AID", "OTHER"]).optional(),
      income_tax_class: z.enum(["1", "2", "3", "4", "5", "6"]).optional(),
      custom_fields: z
        .array(z.object({ custom_field_id: z.number(), value: z.string() }))
        .optional(),
      include: employeeIncludes,
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    async (params) => {
      const { include, ...body } = params;
      const result = await client.request("POST", "/v3/employees", {
        body,
        query: buildQuery({ include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_update_employee",
    "Update an existing employee",
    {
      employee: z.number().describe("Employee ID"),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      personnel_number: z.string().optional(),
      pin: z.string().optional(),
      pin_change_required: z.string().optional(),
      email: z.string().optional(),
      app_language: z.string().optional(),
      color: z.string().optional(),
      costcenter: z.string().optional(),
      department_name: z.string().optional(),
      device_ids: z.array(z.number()).optional(),
      hourly_wage: z.number().optional(),
      gender: z.enum(["MR", "MRS", "DIVERS"]).optional(),
      position: z.string().optional(),
      mobile_work: z.string().optional(),
      phone_work: z.string().optional(),
      source: z.enum(["sap"]).optional(),
      nationality: z.array(z.string().describe("ISO 3166-1 alpha-2")).optional(),
      birthday: z.string().optional(),
      birthplace: z.string().optional(),
      street: z.string().optional(),
      house_number: z.string().optional(),
      zip: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional().describe("ISO 3166-1 alpha-2"),
      region: z.string().optional(),
      entry_date: z.string().optional(),
      contract_ending: z.string().optional(),
      school_education: z
        .enum(["NO_EDUCATION", "SECONDARY_SCHOOL", "SECONDARY_SCHOOL_CERTIFICATE", "VOCATIONAL_BACCALAUREATE", "UNIVERSITY_ENTRANCE_QUALIFICATION"])
        .optional(),
      work_education: z
        .enum(["VOCATIONAL_TRAINING", "VOCATIONAL_TRAINING_FURTHER_EDUCATION", "MASTER_CRAFTSMAN", "DIPLOMA", "BACHELOR", "MASTER", "STATE_EXAMINATION", "DOCTOR", "PROFESSOR", "OTHER"])
        .optional(),
      employment_type: z
        .enum(["INTERNSHIP", "TEMPORARY_EMPLOYEE", "STUDENT_ASSISTANT", "EDUCATION", "PART_TIME", "FULL_TIME", "FREELANCER", "SELF_EMPLOYED", "OTHER"])
        .optional(),
      marital_status: z
        .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "REGISTERED_PARTNERSHIP", "PARTNER_DIED", "SEPARATED"])
        .optional(),
      type_of_healthcare: z.enum(["PRIVATE", "STATUTORY", "AID", "OTHER"]).optional(),
      income_tax_class: z.enum(["1", "2", "3", "4", "5", "6"]).optional(),
      custom_fields: z
        .array(z.object({ custom_field_id: z.number(), value: z.string() }))
        .optional(),
      include: employeeIncludes,
    },
    { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { employee, include, ...body } = params;
      const result = await client.request("PATCH", `/v3/employees/${employee}`, {
        body,
        query: buildQuery({ include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_delete_employee",
    "Delete an employee (soft-delete by default, use force=true for permanent deletion)",
    {
      employee: z.number().describe("Employee ID"),
      force: z.boolean().optional().describe("Permanently delete"),
      include: employeeIncludes,
    },
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    async (params) => {
      const { employee, ...rest } = params;
      const result = await client.request("DELETE", `/v3/employees/${employee}`, {
        query: buildQuery(rest),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_search_employees",
    "Search for employees. Scopes: byLastName (value), byPersonnelNumber (value, supports wildcard *), byEmail (value), bySource (value). Sort fields: created_at, updated_at.",
    {
      scopes: z
        .array(
          z.object({
            name: z.enum(["byLastName", "byPersonnelNumber", "byEmail", "bySource"]).describe("Scope name"),
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
      includes: z
        .array(
          z.object({
            relation: z.enum(["files", "superior", "onboardingSecret", "customFields"]),
          })
        )
        .optional(),
      ...trashedParams,
      ...paginationParams,
      include: employeeIncludes,
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async (params) => {
      const { with_trashed, only_trashed, page, include, ...body } = params;
      const result = await client.request("POST", "/v3/employees/search", {
        body,
        query: buildQuery({ with_trashed, only_trashed, page, include }),
      });
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );

  server.tool(
    "clockin_get_employee_custom_fields",
    "Get all available custom field configurations for employees",
    {},
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
    async () => {
      const result = await client.request("GET", "/v3/employees/custom-fields");
      return { content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }], isError: result.isError };
    }
  );
}
