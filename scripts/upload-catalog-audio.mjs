import nextEnv from '@next/env'
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

nextEnv.loadEnvConfig(process.cwd())
const [slug, filename] = process.argv.slice(2)
if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug) || !filename?.toLowerCase().endsWith('.mp3')) {
  throw new Error('Usage: node scripts/upload-catalog-audio.mjs RELEASE-SLUG /absolute/path/track.mp3')
}
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment.')
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const bucket = 'catalog-audio'
const existing = await client.storage.getBucket(bucket)
if (existing.error && !/not found/i.test(existing.error.message) && existing.error.statusCode !== '404') throw existing.error
if (!existing.data) {
  const created = await client.storage.createBucket(bucket, { public: true, fileSizeLimit: 20 * 1024 * 1024, allowedMimeTypes: ['audio/mpeg'] })
  if (created.error) throw created.error
} else if (!existing.data.public) throw new Error('catalog-audio is private. Its access will not be changed by this script.')
const file = await readFile(filename)
if (!file.length || file.length > 20 * 1024 * 1024) throw new Error('Use an MP3 smaller than 20 MB.')
const hash = createHash('sha256').update(file).digest('hex').slice(0, 12)
const path = `${slug}/preview-${hash}.mp3`
const uploaded = await client.storage.from(bucket).upload(path, file, { contentType: 'audio/mpeg', cacheControl: '31536000', upsert: false })
if (uploaded.error && !/already exists|duplicate/i.test(uploaded.error.message)) throw uploaded.error
console.log(client.storage.from(bucket).getPublicUrl(path).data.publicUrl)
