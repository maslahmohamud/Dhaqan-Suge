export interface Artifact {
  id: string;
  name: string;
  description: string;
  long_description: string;
  category: string;
  image_url: string;
  favorites_count: number;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  artifact_id: string | null;
  title: string;
  body: string;
  created_at: string;
  isRead?: boolean;
  artifact?: Artifact | null;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  is_admin: boolean;
}

export type ScreenType = 'home' | 'favorites' | 'profile';
