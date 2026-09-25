// Image uploads to Supabase Storage. Server-only: uses the service-role key,
// which must never be sent to the browser.
import { createClient } from '@supabase/supabase-js'

export const BUCKET = 'images'
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export function storageConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Add SUPABASE_SERVICE_ROLE_KEY to .env to enable image uploads.')
  return createClient(url, key, { auth: { persistSession: false } })
}

let bucketReady = false

// Creates the public "images" bucket the first time it's needed
async function ensureBucket(supabase: ReturnType<typeof client>) {
  if (bucketReady) return
  const { data } = await supabase.storage.getBucket(BUCKET)
  if (!data) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_UPLOAD_BYTES,
      allowedMimeTypes: Object.keys(ALLOWED_TYPES),
    })
    if (error && !/already exists/i.test(error.message)) throw error
  }
  bucketReady = true
}

export async function uploadImage(file: File, folder = 'posts'): Promise<string> {
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) throw new Error('Use a JPEG, PNG, WebP, GIF or AVIF image.')
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Images must be 10 MB or smaller.')

  const supabase = client()
  await ensureBucket(supabase)
  const path = `${folder}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
