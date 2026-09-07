import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Polyfill WebSocket for Node runtime if not present
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class DummyWebSocket {};
}

const prisma = new PrismaClient();

async function runHealthCheck() {
  console.log('==============================================');
  console.log(' SYSTEM INFRASTRUCTURE HEALTH CHECK');
  console.log('==============================================');

  // 1. Prisma & Supabase PostgreSQL Check
  try {
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const profile = await prisma.profile.findFirst();
    console.log(' [DB] PostgreSQL Connection : CONNECTED (OK)');
    console.log(' [DB] User Records          :', userCount);
    console.log(' [DB] Project Records       :', projectCount);
    console.log(' [DB] Profile Singleton     :', profile ? 'EXISTS (id: ' + profile.id + ')' : 'EMPTY (Needs Seed)');
  } catch (err) {
    console.error(' [DB] PostgreSQL Error      :', err.message);
  } finally {
    await prisma.$disconnect();
  }

  // 2. Supabase Storage Check
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !serviceKey) {
      console.log(' [STORAGE] Supabase Storage  : SKIPPED (Missing SUPABASE_SERVICE_ROLE_KEY or URL)');
      return;
    }
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error(' [STORAGE] Supabase Error   :', error.message);
    } else {
      console.log(' [STORAGE] Supabase Storage  : CONNECTED (OK)');
      console.log(' [STORAGE] Available Buckets :', buckets.map(b => `${b.name} (public: ${b.public})`).join(', '));
    }
  } catch (err) {
    console.error(' [STORAGE] Error            :', err.message);
  }

  // 3. NextAuth Configuration Check
  console.log(' [AUTH] NextAuth Secret     :', process.env.NEXTAUTH_SECRET ? 'CONFIGURED (OK)' : 'MISSING');
  console.log(' [AUTH] Google Client ID    :', process.env.GOOGLE_CLIENT_ID ? 'CONFIGURED (OK)' : 'MISSING');
  console.log(' [AUTH] Admin Email Target  :', process.env.ADMIN_EMAIL || 'MISSING');
  console.log('==============================================');
}

runHealthCheck();
