export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiRequest<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const cachedUser = localStorage.getItem("cainta_current_user");
  const user = cachedUser ? JSON.parse(cachedUser) : null;
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (user?.authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${user.authToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem("cainta_current_user");
    window.dispatchEvent(new CustomEvent("cainta:session-expired"));
  }
  if (!response.ok || data.success === false) {
    throw new ApiError(data.message || "The request could not be completed.", response.status);
  }
  return data as T;
}