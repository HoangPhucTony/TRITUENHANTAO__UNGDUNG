import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "@/pages/OverviewPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartStay AI — Nền tảng định giá & gợi ý trọ thông minh" },
      { name: "description", content: "SmartStay AI ứng dụng Machine Learning để định giá, gợi ý phòng trọ và phát hiện lừa đảo." },
      { property: "og:title", content: "SmartStay AI — Nền tảng định giá & gợi ý trọ thông minh" },
      { property: "og:description", content: "Định giá thông minh, gợi ý cá nhân hoá, phát hiện lừa đảo cho thị trường phòng trọ." },
    ],
  }),
  component: () => <OverviewPage />,
});
