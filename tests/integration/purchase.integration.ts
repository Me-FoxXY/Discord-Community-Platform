import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';

const discord = vi.hoisted(() => ({ grantRole: vi.fn() }));
vi.mock('@/lib/discord/roles', async (original) => ({
  ...await original<typeof import('@/lib/discord/roles')>(), grantRole: discord.grantRole,
}));
vi.mock('@/lib/auth', () => ({ auth: async () => ({ user: { discordId: '323456789012345678', name: 'Integration Buyer', isAdmin: true } }) }));
import { prisma } from '@/lib/prisma';
import { createOrder, reviewOrder, submitProof } from '@/lib/orders/store';
import { deliverOrder } from '@/lib/orders/delivery';
import { POST as checkout } from '@/app/api/orders/route';
import { POST as proof } from '@/app/api/orders/[id]/proof/route';
import { POST as verify } from '@/app/api/admin/orders/[id]/verify/route';
import { GET as readOrder } from '@/app/api/orders/[id]/route';
import { buildUpiIntent } from '@/lib/payments/provider';

const ids: string[] = [];
let isolated = false;
const couponCode = `TEST_${randomUUID().slice(0, 8).toUpperCase()}`;
beforeAll(async () => {
  const url = new URL(process.env.DATABASE_URL!);
  if (url.hostname !== '127.0.0.1' || url.port !== '55432' || url.pathname !== '/discord_community_test') {
    throw new Error('Integration tests require the isolated local test database.');
  }
  isolated = true;
  vi.stubEnv('DISCORD_GUILD_ID', '123456789012345678');
  vi.stubEnv('DISCORD_ROLE_PREMIUM_PRO', '223456789012345678');
  discord.grantRole.mockResolvedValue(undefined);
  await prisma.coupon.create({ data: { code: couponCode, kind: 'percent', value: 10 } });
});
afterAll(async () => {
  if (!isolated) return;
  await prisma.order.deleteMany({ where: { id: { in: ids } } });
  await prisma.coupon.deleteMany({ where: { code: couponCode } });
  await prisma.$disconnect();
  vi.unstubAllEnvs();
});

async function pendingOrder() {
  const order = await createOrder({
    planSlug: 'premium-pro', planName: 'Premium Pro', amount: 49, subtotal: 49,
    discountAmount: 0, couponCode: null, discordUserId: '323456789012345678', discordUsername: 'Integration Buyer',
  });
  ids.push(order.id);
  await submitProof({ orderId: order.id, utr: randomUUID(), screenshotPath: 'test-proof', screenshotHash: randomUUID() });
  return order;
}

it('persists a discounted purchase, accepts proof, approves it, and records role delivery', async () => {
  const response = await checkout(new Request('http://localhost/api/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planSlug: 'premium-pro', couponCode, amount: 1 }),
  }));
  expect(response.status).toBe(200);
  const data = await response.json();
  ids.push(data.orderId);
  expect(data.amount).toBe(45);
  expect(new URL(data.upiIntent).searchParams.get('am')).toBe('45');
  const form = new FormData();
  const utr = String(Date.now()).slice(-12);
  form.set('utr', utr);
  form.set('screenshot', new File([Uint8Array.from([137,80,78,71,13,10,26,10])], 'proof.png', { type: 'image/png' }));
  const params = { params: Promise.resolve({ id: data.orderId }) };
  expect((await proof(new Request('http://localhost/proof', { method: 'POST', body: form }), params)).status).toBe(200);
  const result = await verify(new Request('http://localhost/verify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve' }),
  }), params);
  expect(await result.json()).toMatchObject({ status: 'approved', deliveryStatus: 'delivered' });
  const stored = await prisma.order.findUniqueOrThrow({ where: { id: data.orderId } });
  expect(stored).toMatchObject({ amount: 45, subtotal: 49, discountAmount: 4, couponCode });
  await prisma.coupon.update({ where: { code: couponCode }, data: { active: false } });
  const status = await readOrder(new Request('http://localhost/order'), params);
  expect(await status.json()).toMatchObject({ amount: 45, discountAmount: 4, deliveryStatus: 'delivered' });
  expect(buildUpiIntent({ amount: stored.amount, note: stored.note })).toContain('am=45');
});

it('allows only one of two simultaneous review decisions', async () => {
  const order = await pendingOrder();
  const results = await Promise.allSettled([
    reviewOrder(order.id, 'approve', 'admin-a'), reviewOrder(order.id, 'reject', 'admin-b'),
  ]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
});

it('allows only one simultaneous delivery and recovers an expired lease', async () => {
  const order = await pendingOrder();
  await reviewOrder(order.id, 'approve', 'admin');
  discord.grantRole.mockClear();
  const results = await Promise.allSettled([deliverOrder(order.id), deliverOrder(order.id)]);
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(discord.grantRole).toHaveBeenCalledTimes(1);
  const interrupted = await pendingOrder();
  await reviewOrder(interrupted.id, 'approve', 'admin');
  await prisma.order.update({ where: { id: interrupted.id }, data: {
    deliveryStatus: 'delivering', deliveryToken: 'expired-attempt', deliveryLeaseUntil: new Date(0),
  } });
  expect((await deliverOrder(interrupted.id)).deliveryStatus).toBe('delivered');
});

it('enforces UTR uniqueness under simultaneous proof submission', async () => {
  const a = await pendingOrder();
  const b = await pendingOrder();
  await prisma.order.updateMany({ where: { id: { in: [a.id, b.id] } }, data: { status: 'awaiting_payment', utr: null } });
  const utr = randomUUID();
  const results = await Promise.allSettled([a, b].map((order) => submitProof({
    orderId: order.id, utr, screenshotPath: 'test-proof', screenshotHash: randomUUID(),
  })));
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(await prisma.order.count({ where: { utr } })).toBe(1);
});
