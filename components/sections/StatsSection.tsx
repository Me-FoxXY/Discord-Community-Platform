import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { MemberStats } from '@/components/community/LiveMemberCount';
export function StatsSection() {
 return <section className="py-20"><Container><SectionHeading title="Our community on Discord" subtitle="Member counts from the connected server."/><div className="mx-auto mt-10 max-w-lg rounded-3xl bg-white/80 p-8"><MemberStats/></div></Container></section>;
}
