import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoExperience } from "@/features/demo/components/DemoExperience";

export function DemoPage() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Live Demo"
        title="Trải nghiệm hệ thống thông minh"
        description="Lọc theo nhu cầu, gợi ý phòng phù hợp và phát hiện tin lừa đảo trong thời gian thực."
      />
      <DemoExperience />
    </DashboardLayout>
  );
}
