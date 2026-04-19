import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ModelStory } from "@/features/models/components/ModelStory";

export function ModelPage() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Machine Learning Pipeline"
        title="Huấn luyện mô hình AI"
        description="Hành trình xây dựng mô hình định giá — từ baseline đơn giản đến Ensemble tối ưu."
      />
      <ModelStory />
    </DashboardLayout>
  );
}
