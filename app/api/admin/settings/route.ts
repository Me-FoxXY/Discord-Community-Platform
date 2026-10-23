import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
const schema = z.object({ primaryColor: z.string().regex(/^#[0-9a-f]{6}$/i), accentColor: z.string().regex(/^#[0-9a-f]{6}$/i) });
export async function PATCH(req: Request) {
  if (!(await auth())?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter valid six-digit hex colors.' }, { status: 400 });
  await prisma.storeSettings.upsert({ where: { id: 'default' }, create: parsed.data, update: parsed.data });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
