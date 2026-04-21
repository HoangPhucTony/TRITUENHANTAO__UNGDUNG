import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OverviewHero } from "@/features/overview/components/OverviewHero";
import { OverviewFeatures } from "@/features/overview/components/OverviewFeatures";
import { OverviewTable } from "@/features/overview/components/OverviewTable";

export function OverviewPage() {
  return (
    <DashboardLayout>
      <OverviewHero />
      <OverviewFeatures />
      <OverviewTable />
    </DashboardLayout>
  );
}
