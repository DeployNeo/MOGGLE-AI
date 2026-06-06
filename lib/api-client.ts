import type {
  AnalysisResult,
  AppNotification,
  CoachSuggestions,
  FacialMetrics,
  ProgressDataPoint,
  SavedAnalysisRecord,
  UserProfile,
  UserSettings,
} from "@/types";

async function authFetch(
  url: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export async function saveAnalysisToApi(
  result: AnalysisResult,
  source: "live" | "photo",
  token: string | null
): Promise<{ id: string; imageUrl?: string } | null> {
  try {
    const response = await authFetch("/api/analyses", token, {
      method: "POST",
      body: JSON.stringify({ source: source === "live" ? "LIVE" : "PHOTO", result }),
    });
    if (!response.ok) return null;
    return (await response.json()) as { id: string; imageUrl?: string };
  } catch {
    return null;
  }
}

export async function fetchAnalysisHistory(
  token: string | null
): Promise<SavedAnalysisRecord[]> {
  try {
    const response = await authFetch("/api/analyses", token);
    if (!response.ok) return [];
    const data = (await response.json()) as { analyses: SavedAnalysisRecord[] };
    return data.analyses;
  } catch {
    return [];
  }
}

export async function deleteAnalysisApi(
  id: string,
  token: string | null
): Promise<boolean> {
  try {
    const response = await authFetch(`/api/analyses/${id}`, token, {
      method: "DELETE",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchProgressHistory(
  token: string | null
): Promise<ProgressDataPoint[]> {
  try {
    const response = await authFetch("/api/progress", token);
    if (!response.ok) return [];
    const data = (await response.json()) as { progress: ProgressDataPoint[] };
    return data.progress;
  } catch {
    return [];
  }
}

export async function fetchCoachSuggestions(
  metrics: FacialMetrics,
  token: string | null
): Promise<CoachSuggestions | null> {
  try {
    const response = await authFetch("/api/coach", token, {
      method: "POST",
      body: JSON.stringify({ metrics }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { coach: CoachSuggestions };
    return data.coach;
  } catch {
    return null;
  }
}

export async function fetchNotifications(
  token: string | null
): Promise<AppNotification[]> {
  try {
    const response = await authFetch("/api/notifications", token);
    if (!response.ok) return [];
    const data = (await response.json()) as { notifications: AppNotification[] };
    return data.notifications;
  } catch {
    return [];
  }
}

export async function fetchProfile(
  token: string | null
): Promise<UserProfile | null> {
  try {
    const response = await authFetch("/api/profile", token);
    if (!response.ok) return null;
    const data = (await response.json()) as { profile: UserProfile };
    return data.profile;
  } catch {
    return null;
  }
}

export async function updateProfileApi(
  token: string | null,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const response = await authFetch("/api/profile", token, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchSettings(
  token: string | null
): Promise<UserSettings | null> {
  try {
    const response = await authFetch("/api/settings", token);
    if (!response.ok) return null;
    const data = (await response.json()) as { settings: UserSettings };
    return data.settings;
  } catch {
    return null;
  }
}

export async function updateSettingsApi(
  token: string | null,
  settings: {
    privacy?: Partial<UserSettings["privacy"]>;
    notifications?: Partial<UserSettings["notifications"]>;
    appearance?: Partial<UserSettings["appearance"]>;
  }
): Promise<boolean> {
  try {
    const response = await authFetch("/api/settings", token, {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
    return response.ok;
  } catch {
    return false;
  }
}
