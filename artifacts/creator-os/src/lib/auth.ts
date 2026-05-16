export interface ReplitUser {
  id: string;
  name: string;
  profileImage: string | null;
  bio: string | null;
  url: string | null;
  roles: string[];
  teams: string[];
}

export async function getReplitUser(): Promise<ReplitUser | null> {
  try {
    const res = await fetch("/__replauthuser");
    if (!res.ok) return null;
    const data = await res.json() as ReplitUser;
    if (!data?.id) return null;
    return data;
  } catch {
    return null;
  }
}
