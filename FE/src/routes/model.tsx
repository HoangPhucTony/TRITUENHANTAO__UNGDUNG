import { createFileRoute } from "@tanstack/react-router";
import { ModelPage } from "@/pages/ModelPage";

export const Route = createFileRoute("/model")({
  head: () => ({
    meta: [
      { title: "Mô hình AI — SmartStay AI" },
      { name: "description", content: "So sánh các mô hình ML và Siêu Mô hình cho định giá phòng trọ." },
      { property: "og:title", content: "Mô hình AI — SmartStay AI" },
      { property: "og:description", content: "Linear Regression, Random Forest, XGBoost và Ensemble." },
    ],
  }),
  component: () => <ModelPage />,
});
