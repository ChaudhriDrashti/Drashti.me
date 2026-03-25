const API_BASE = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "portfolio_admin_token";
const USER_KEY = "portfolio_admin_user";
const PUBLIC_TABLES = new Set([
  "projects",
  "experience",
  "education",
  "skills",
  "certifications",
  "blog_posts",
  "site_settings",
]);

type ApiError = { message: string };
type ApiResult<T> = { data: T | null; error: ApiError | null; count?: number | null };
type AuthUser = { id: string; email: string; role: string };
type AuthSession = { user: AuthUser; access_token: string };

const getToken = () => localStorage.getItem(TOKEN_KEY);
const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const setSession = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const normalizeError = (error: unknown): ApiError => {
  if (error && typeof error === "object" && "message" in error) {
    return { message: String((error as { message: unknown }).message) };
  }
  return { message: "Request failed" };
};

const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  authRequired = true,
): Promise<{ ok: boolean; status: number; data: T | null; error: ApiError | null }> => {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (authRequired) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await response.text();
    const payload = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error: unknown }).error)
          : `HTTP ${response.status}`;
      return { ok: false, status: response.status, data: null, error: { message } };
    }

    return { ok: true, status: response.status, data: payload as T, error: null };
  } catch (error) {
    return { ok: false, status: 0, data: null, error: normalizeError(error) };
  }
};

class SelectBuilder implements PromiseLike<ApiResult<Record<string, unknown>[]>> {
  private orders: Array<{ column: string; ascending: boolean }> = [];

  constructor(
    private table: string,
    private isCountOnly: boolean,
  ) {}

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  private async run(): Promise<ApiResult<Record<string, unknown>[]>> {
    const query = new URLSearchParams();

    if (this.isCountOnly) {
      query.set("count", "true");
    }

    if (this.orders.length) {
      const sort = this.orders.map((o) => `${o.column}:${o.ascending ? "asc" : "desc"}`).join(",");
      query.set("sort", sort);
    }

    const qs = query.toString();
    const hasToken = Boolean(getToken());
    const usePublic = !hasToken && PUBLIC_TABLES.has(this.table) && !this.isCountOnly;
    const path = usePublic ? `/api/public/content/${this.table}` : `/api/admin/${this.table}`;
    const result = await apiFetch<{ rows?: Record<string, unknown>[]; count?: number }>(
      `${path}${qs ? `?${qs}` : ""}`,
      { method: "GET" },
      !usePublic,
    );

    if (!result.ok || result.error) {
      return { data: null, error: result.error ?? { message: "Failed to fetch" } };
    }

    if (this.isCountOnly) {
      return { data: null, error: null, count: result.data?.count ?? 0 };
    }

    return { data: result.data?.rows ?? [], error: null };
  }

  then<TResult1 = ApiResult<Record<string, unknown>[]>, TResult2 = never>(
    onfulfilled?: ((value: ApiResult<Record<string, unknown>[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.run().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }
}

const from = (table: string) => ({
  select: (_columns = "*", options?: { count?: "exact"; head?: boolean }) => {
    return new SelectBuilder(table, Boolean(options?.count === "exact" && options?.head));
  },

  insert: async (payload: Record<string, unknown> | Record<string, unknown>[]) => {
    const publicInsert = table === "contact_messages" && !getToken();
    const path = publicInsert ? "/api/public/contact" : `/api/admin/${table}`;
    const data = Array.isArray(payload) ? payload[0] : payload;
    const result = await apiFetch(path, { method: "POST", body: JSON.stringify(data) }, !publicInsert);

    if (!result.ok || result.error) {
      return { data: null, error: result.error ?? { message: "Insert failed" } };
    }

    return { data: result.data, error: null };
  },

  update: (payload: Record<string, unknown>) => ({
    eq: async (_column: string, value: string) => {
      const result = await apiFetch(`/api/admin/${table}/${value}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!result.ok || result.error) {
        return { data: null, error: result.error ?? { message: "Update failed" } };
      }

      return { data: result.data, error: null };
    },
  }),

  delete: () => ({
    eq: async (_column: string, value: string) => {
      const result = await apiFetch(`/api/admin/${table}/${value}`, {
        method: "DELETE",
      });

      if (!result.ok || result.error) {
        return { data: null, error: result.error ?? { message: "Delete failed" } };
      }

      return { data: result.data, error: null };
    },
  }),

  upsert: async (payload: Record<string, unknown>, _options?: { onConflict?: string }) => {
    const result = await apiFetch(`/api/admin/${table}/upsert`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!result.ok || result.error) {
      return { data: null, error: result.error ?? { message: "Upsert failed" } };
    }

    return { data: result.data, error: null };
  },
});

type AuthCallback = (_event: string, session: AuthSession | null) => void;
const authSubscribers = new Set<AuthCallback>();

const notifyAuth = (event: string, session: AuthSession | null) => {
  authSubscribers.forEach((cb) => cb(event, session));
};

export const supabase = {
  from,

  auth: {
    onAuthStateChange: (callback: AuthCallback) => {
      authSubscribers.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => authSubscribers.delete(callback),
          },
        },
      };
    },

    getSession: async () => {
      const token = getToken();
      if (!token) return { data: { session: null } };

      const result = await apiFetch<{ user: AuthUser }>("/api/auth/session", { method: "GET" });
      if (!result.ok || result.error || !result.data?.user) {
        clearSession();
        return { data: { session: null } };
      }

      const session: AuthSession = {
        user: result.data.user,
        access_token: token,
      };

      return { data: { session } };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const result = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }, false);

      if (!result.ok || result.error || !result.data?.token || !result.data?.user) {
        return { error: { message: result.error?.message ?? "Invalid credentials" } };
      }

      setSession(result.data.token, result.data.user);
      notifyAuth("SIGNED_IN", { user: result.data.user, access_token: result.data.token });
      return { error: null };
    },

    signOut: async () => {
      await apiFetch("/api/auth/logout", { method: "POST" });
      clearSession();
      notifyAuth("SIGNED_OUT", null);
      return { error: null };
    },
  },

  rpc: async (name: string, args: { _role?: string }) => {
    if (name !== "has_role") {
      return { data: null, error: { message: "Unsupported RPC" } };
    }

    const role = args._role;
    const result = await apiFetch<{ hasRole: boolean }>(`/api/auth/has-role/${role}`, { method: "GET" });

    if (!result.ok || result.error) {
      return { data: null, error: result.error ?? { message: "Role check failed" } };
    }

    return { data: !!result.data?.hasRole, error: null };
  },

  storage: {
    from: (bucket: string) => ({
      list: async () => {
        const result = await apiFetch<{ files: Array<Record<string, unknown>> }>(`/api/storage/${bucket}`, {
          method: "GET",
        });

        if (!result.ok || result.error) {
          return { data: null, error: result.error ?? { message: "List failed" } };
        }

        return { data: result.data?.files ?? [], error: null };
      },

      upload: async (name: string, file: File) => {
        const form = new FormData();
        form.append("file", file, name);

        const result = await apiFetch(`/api/storage/${bucket}/upload?filename=${encodeURIComponent(name)}`, {
          method: "POST",
          body: form,
        });

        if (!result.ok || result.error) {
          return { data: null, error: result.error ?? { message: "Upload failed" } };
        }

        return { data: result.data, error: null };
      },

      remove: async (names: string[]) => {
        const result = await apiFetch(`/api/storage/${bucket}/remove`, {
          method: "POST",
          body: JSON.stringify({ names }),
        });

        if (!result.ok || result.error) {
          return { data: null, error: result.error ?? { message: "Delete failed" } };
        }

        return { data: result.data, error: null };
      },

      getPublicUrl: (name: string) => ({
        data: {
          publicUrl: `${API_BASE}/uploads/${bucket}/${encodeURIComponent(name)}`,
        },
      }),
    }),
  },
};