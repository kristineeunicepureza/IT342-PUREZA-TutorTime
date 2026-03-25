import { api } from './apiService';

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL    || '';
const SUPABASE_ANON   = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const STORAGE_BUCKET  = 'profile-photos';

// ─── Types ────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  profilePhotoUrl?: string;
  // tutor-only
  bio?: string;
  expertise?: string;
  subjects?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  profilePhotoUrl?: string;
  // tutor
  bio?: string;
  expertise?: string;
  subjects?: string;
  location?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ─── API calls ────────────────────────────────────────────────────────────

/** Fetch the current user's full profile. */
export async function getMyProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/api/users/me');
}

/** Update basic info + optional tutor fields. */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return api.put<UserProfile>('/api/users/me', payload);
}

/** Change password. */
export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  return api.put<string>('/api/users/me/password', payload);
}

// ─── Supabase Storage upload ──────────────────────────────────────────────

/**
 * Upload a file directly to Supabase Storage and return the public URL.
 *
 * Requirements:
 *  - Bucket `profile-photos` must exist and be set to PUBLIC in Supabase dashboard.
 *  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set in .env
 *
 * If Supabase keys are not configured, falls back to a data URL (preview only).
 */
export async function uploadProfilePhoto(
  file: File,
  userId: number
): Promise<string> {
  // ── Fallback: if Supabase not configured, return object URL ──
  if (!SUPABASE_URL || !SUPABASE_ANON || SUPABASE_ANON === 'YOUR_SUPABASE_ANON_KEY') {
    // Return base64 data URL as temporary fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  const ext      = file.name.split('.').pop() ?? 'jpg';
  const filename = `user-${userId}-${Date.now()}.${ext}`;
  const path     = `${STORAGE_BUCKET}/${filename}`;

  // Upload to Supabase Storage REST API
  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${path}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: file,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to upload photo to Supabase Storage');
  }

  // Public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
}