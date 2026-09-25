import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-session'
import { uploadImage } from '@/lib/storage'

// POST /api/admin/upload — multipart form with a "file" field; returns { url }.
// A route handler rather than a server action so large photos aren't cut off
// by the server-action body limit.
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No image was attached.' }, { status: 400 })
  }

  try {
    const url = await uploadImage(file)
    return NextResponse.json({ url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
