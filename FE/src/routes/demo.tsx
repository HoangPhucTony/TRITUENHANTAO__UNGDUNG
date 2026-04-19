import { createFileRoute } from "@tanstack/react-router";
import { DemoPage } from "@/pages/DemoPage";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo hệ thống — SmartStay AI" },
      { name: "description", content: "Trải nghiệm hệ thống gợi ý phòng trọ và phát hiện lừa đảo." },
      { property: "og:title", content: "Demo hệ thống — SmartStay AI" },
      { property: "og:description", content: "Recommender System + Scam Detection." },
    ],
  }),
  component: () => <DemoPage />,
});
