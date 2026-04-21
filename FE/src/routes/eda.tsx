import { createFileRoute } from "@tanstack/react-router";
import { EDAPage } from "@/pages/EDAPage";

export const Route = createFileRoute("/eda")({
  head: () => ({
    meta: [
      { title: "Phân tích dữ liệu — SmartStay AI" },
      {
        name: "description",
        content: "Câu chuyện dữ liệu phòng trọ: tiền xử lý, phân bố giá, ảnh hưởng tiện ích.",
      },
      { property: "og:title", content: "Phân tích dữ liệu — SmartStay AI" },
      { property: "og:description", content: "EDA storytelling cho thị trường phòng trọ TP.HCM." },
    ],
  }),
  component: () => <EDAPage />,
});
