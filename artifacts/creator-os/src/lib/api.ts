const API_BASE = '/api';

export async function saveProject(userId: string, project: {
  title: string;
  type: string;
  content: Record<string, unknown>;
  platform?: string;
  niche?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/user/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ...project }),
  });
  if (!res.ok) throw new Error('Failed to save project');
}

export async function fetchProjects(userId: string) {
  const res = await fetch(`${API_BASE}/user/projects/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  const json = await res.json() as { status: boolean; data: unknown[] };
  return json.data ?? [];
}

export async function deleteProject(id: string | number, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/user/projects/${id}?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function upsertProfile(profile: {
  id: string;
  email: string;
  niche?: string;
  platforms?: string[];
  goals?: string[];
  content_style?: string;
  onboarding_completed?: boolean;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Failed to update profile');
}
