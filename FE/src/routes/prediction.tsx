import { createFileRoute } from "@tanstack/react-router";
import { PredictionPage } from "@/pages/PredictionPage";

export const Route = createFileRoute("/prediction")({
  head: () => ({
    meta: [
      { title: "Dự đoán giá — SmartStay AI" },
      { name: "description", content: "Nhập thông tin phòng và nhận mức giá hợp lý do AI gợi ý." },
      { property: "og:title", content: "Dự đoán giá — SmartStay AI" },
      { property: "og:description", content: "Explainable AI cho định giá phòng trọ." },
    ],
  }),
  component: () => <PredictionPage />,
});
