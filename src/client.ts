const BASE_URL = "https://customerapi.clockin.de";

export class ClockInClient {
  private token: string;

  constructor() {
    const token = process.env.CLOCKIN_API_TOKEN;
    if (!token) {
      throw new Error(
        "CLOCKIN_API_TOKEN environment variable is required. " +
          "Generate one in the clockin Admin Panel: https://office.clockin.de/port?clockinApi"
      );
    }
    this.token = token;
  }

  async request(
    method: string,
    path: string,
    options: { body?: unknown; query?: Record<string, string | undefined> } = {}
  ): Promise<{ data: unknown; isError: boolean }> {
    const url = new URL(path, BASE_URL);
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };

    const init: RequestInit = { method, headers };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }

    try {
      const res = await fetch(url.toString(), init);
      const text = await res.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }

      if (!res.ok) {
        const msg = typeof json === "object" && json !== null && "message" in json
          ? (json as { message: string }).message
          : text;

        const hints: Record<number, string> = {
          401: "Check your CLOCKIN_API_TOKEN — it may be expired or invalid.",
          403: "Your token lacks the required permissions for this endpoint.",
          404: "The requested resource was not found.",
          422: "Validation error — check the request parameters.",
          429: "Rate limited — wait a moment and try again.",
        };

        return {
          data: {
            error: true,
            status: res.status,
            message: msg,
            hint: hints[res.status] ?? `HTTP ${res.status}`,
          },
          isError: true,
        };
      }

      return { data: json, isError: false };
    } catch (err) {
      return {
        data: {
          error: true,
          message: err instanceof Error ? err.message : String(err),
        },
        isError: true,
      };
    }
  }
}
