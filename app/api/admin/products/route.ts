import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema, productPlan } from '@/lib/product-input';
import type { Plan } from '@/config/plans';

async function save(req: Request, editing: boolean) {
  if (!(await auth())?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { slug, roleId, enabled } = parsed.data;
  const old = await prisma.product.findUnique({ where: { slug } });
  if (editing && !old) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  const data = JSON.parse(JSON.stringify(productPlan(parsed.data, old?.data as unknown as Plan | undefined)));
  try {
    if (editing) await prisma.product.update({ where: { slug }, data: { data, roleId, enabled } });
    else await prisma.product.create({ data: { slug, data, roleId, enabled } });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'That product URL already exists. Choose another slug.' }, { status: 409 });
    }
    throw error;
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
export const POST = (req: Request) => save(req, false);
export const PATCH = (req: Request) => save(req, true);
