import { request, ApiError } from './client';
import { isMock } from './mode';
import { LIMITS } from './types';

export const photoUrl = (key: string | null | undefined) => (key ? (key.startsWith('data:') ? key : `/storage/${key}`) : null);

export async function uploadPhoto(file: File): Promise<{ photo_key: string; url: string }> {
  if (!(LIMITS.photoTypes as readonly string[]).includes(file.type)) throw new ApiError(415, 'UNSUPPORTED_TYPE');
  if (file.size > LIMITS.photoMaxBytes) throw new ApiError(413, 'FILE_TOO_LARGE');

  if (isMock()) {
    const url = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file); });
    return { photo_key: url, url };
  }
  const { upload_url, object_key } = await request<{ upload_url: string; object_key: string }>(
    '/uploads/presign', { method: 'POST', body: { content_type: file.type, size: file.size } });

  const put = await fetch(upload_url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!put.ok) throw new ApiError(put.status, 'UPLOAD_FAILED');

  return request('/uploads/confirm', { method: 'POST', body: { object_key } });
}
