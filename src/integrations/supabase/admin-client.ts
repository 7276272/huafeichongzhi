/**
 * 管理员级别的Supabase客户端
 * 此客户端使用service role token，拥有更高权限
 * 警告: 此客户端必须仅用于服务器端或安全的管理员操作
 */

import { createClient } from '@supabase/supabase-js'

// 使用硬编码的方式在开发环境中测试
// 注意：生产环境应该使用环境变量或后端服务

// 使用import.meta.env访问Vite环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eyfkefeyhsrmutvezwxa.supabase.co'

// 仅用于开发/测试，生产中应该放在后端
// 警告: 这是服务端的高权限密钥，绝对不要暴露在前端代码或公开环境中
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZmtlZmV5aHNybXV0dmV6d3hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTkwNDIwOSwiZXhwIjoyMDU1NDgwMjA5fQ.JWzSVG4ImBeF6K_OCekz7w9Kd9FQYPuRk1OAyGn9Uoc'

// 创建一个具有管理员权限的客户端
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
