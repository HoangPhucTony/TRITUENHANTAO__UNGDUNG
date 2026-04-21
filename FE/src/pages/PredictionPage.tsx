import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PredictionPanel } from "@/features/prediction/components/PredictionPanel";

export function PredictionPage() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Predictive AI"
        title="Dự đoán giá phòng trọ"
        description="Nhập thông tin phòng để nhận giá hợp lý và hiểu yếu tố nào ảnh hưởng nhất."
      />
      <PredictionPanel />
    </DashboardLayout>
  );
}
