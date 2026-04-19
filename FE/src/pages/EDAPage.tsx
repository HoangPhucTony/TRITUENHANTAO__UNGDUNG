import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EDAStory } from "@/features/eda/components/EDAStory";

export function EDAPage() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Exploratory Data Analysis"
        title="Câu chuyện dữ liệu phòng trọ"
        description="Hành trình khám phá dữ liệu — từ tiền xử lý đến những hiểu biết quan trọng."
      />
      <EDAStory />
    </DashboardLayout>
  );
}
