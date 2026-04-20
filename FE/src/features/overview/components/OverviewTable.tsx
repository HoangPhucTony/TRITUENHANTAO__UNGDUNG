import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewTable() {
  const { data: properties = [], isLoading } = useQuery<any[]>({
    queryKey: ['properties', 'overview'],
    queryFn: () => api.getProperties({ limit: 12 }),
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Database className="size-4 text-primary" />
            <h3 className="font-semibold">Dataset: phongtro_cleaned.csv</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dữ liệu được crawl từ <span className="text-foreground font-medium inline-flex items-center gap-1">phongtro123.com <ExternalLink className="size-3" /></span> trong giai đoạn 2024-2025,
            bao gồm <span className="text-foreground font-medium">10,500+ tin đăng</span> phòng trọ tại TP.HCM. Sau quá trình tiền xử lý còn lại 10,213 dòng dữ liệu sạch.
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Vai trò:</span> nguồn dữ liệu chính để huấn luyện mô hình định giá,
            xây dựng hệ thống gợi ý và tham chiếu cho module phát hiện lừa đảo.
          </div>
        </Card>
        <Card className="glass-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Dataset gồm những gì</div>
          <ul className="space-y-2 text-sm">
            {[
              "8 cột gốc + 16 cột feature engineering",
              "Tất cả 24 quận huyện TP.HCM",
              "Giá: 2tr - 80tr/tháng",
              "Diện tích: 12m² - 125m²",
              "Tiện ích: nội thất, thang máy, ban công…",
            ].map(t => (
              <li key={t} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary mt-1.5" />
                <span className="text-foreground/90">{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mẫu dữ liệu thực tế</h2>
          <p className="text-sm text-muted-foreground">Hiển thị mẫu ngẫu nhiên từ cơ sở dữ liệu</p>
        </div>
        {!isLoading && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            {properties.length} bản ghi mẫu
          </Badge>
        )}
      </div>
      <Card className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Diện tích</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Tiện ích</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                </TableRow>
              ))
            ) : (
              properties.map(p => (
                <TableRow key={p.id} className="border-border hover:bg-foreground/5">
                  <TableCell className="font-medium max-w-[300px] truncate">{p.title}</TableCell>
                  <TableCell>{p.area} m²</TableCell>
                  <TableCell className="font-semibold text-primary">{(p.price / 1_000_000).toFixed(1)} triệu</TableCell>
                  <TableCell>{p.district}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.amenities?.slice(0, 3).map((a: string) => (
                        <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </motion.section>
  );
}
