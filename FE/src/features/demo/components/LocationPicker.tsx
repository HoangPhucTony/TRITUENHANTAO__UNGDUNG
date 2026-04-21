import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPinned, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type DesiredLocation,
  filterLocations,
  mergeLocationOptions,
} from "@/features/demo/data/locationOptions";

interface LocationPickerProps {
  options: DesiredLocation[];
  selectedLocation: DesiredLocation | null;
  onSelectLocation: (location: DesiredLocation) => void;
  onClearLocation: () => void;
  onEnableMapSelection: () => void;
  isMapSelectionEnabled: boolean;
  onSearchAddress: (query: string) => Promise<DesiredLocation[]>;
}

export function LocationPicker({
  options,
  selectedLocation,
  onSelectLocation,
  onClearLocation,
  onEnableMapSelection,
  isMapSelectionEnabled,
  onSearchAddress,
}: LocationPickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(selectedLocation?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [remoteResults, setRemoteResults] = useState<DesiredLocation[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setQuery(selectedLocation?.name ?? "");
  }, [selectedLocation]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const filteredLocations = useMemo(
    () => filterLocations(options, deferredQuery),
    [deferredQuery, options],
  );

  const combinedResults = useMemo(
    () => mergeLocationOptions(filteredLocations, remoteResults),
    [filteredLocations, remoteResults],
  );

  async function handleSearchAddress() {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) {
      setRemoteError("Hãy nhập ít nhất 3 ký tự để tìm địa chỉ.");
      setRemoteResults([]);
      return;
    }

    setIsSearchingRemote(true);
    setRemoteError(null);

    try {
      const results = await onSearchAddress(trimmedQuery);
      setRemoteResults(results);
      setIsOpen(true);
      if (results.length === 0) {
        setRemoteError("Không tìm thấy địa chỉ phù hợp trong khu vực TP.HCM.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tra địa chỉ lúc này.";
      setRemoteError(message);
      setRemoteResults([]);
    } finally {
      setIsSearchingRemote(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <LabelLine
            title="Địa điểm mong muốn"
            description="Chọn quận, landmark, hoặc nhập địa chỉ thật rồi bấm tìm."
          />
        </div>
        <Button
          type="button"
          variant={isMapSelectionEnabled ? "default" : "outline"}
          size="sm"
          className={cn("shrink-0", isMapSelectionEnabled && "bg-primary text-primary-foreground")}
          onClick={onEnableMapSelection}
        >
          <MapPinned className="size-3.5" />
          {isMapSelectionEnabled ? "Đang chọn" : "Trên bản đồ"}
        </Button>
      </div>

      <div ref={wrapperRef} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setRemoteError(null);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSearchAddress();
            }
          }}
          placeholder="Ví dụ: Bình Thạnh, 268 Lý Thường Kiệt, Chợ Bến Thành..."
          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
        />

        {(query || selectedLocation) && (
          <button
            type="button"
            className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setRemoteResults([]);
              setRemoteError(null);
              onClearLocation();
            }}
            aria-label="Xóa địa điểm đã chọn"
          >
            <X className="size-4" />
          </button>
        )}

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
            {combinedResults.length > 0 ? (
              <div className="max-h-72 overflow-y-auto p-2">
                {combinedResults.map((location) => (
                  <button
                    key={`${location.id}-${location.lat}-${location.lng}`}
                    type="button"
                    className={cn(
                      "flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent",
                      selectedLocation?.id === location.id && "bg-accent",
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSelectLocation(location);
                      setQuery(location.name);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">{location.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {location.category}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {location.address} · {location.district}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Không có gợi ý phù hợp. Hãy chọn quận, một mốc có sẵn, hoặc bấm "Tìm địa chỉ thật".
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => void handleSearchAddress()}
          disabled={isSearchingRemote}
        >
          {isSearchingRemote ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
          Tìm địa chỉ thật
        </Button>
        <div className="text-[11px] text-muted-foreground">
          Chỉ gọi API khi bạn bấm nút.
        </div>
      </div>

      {remoteError && <div className="text-[11px] text-warning">{remoteError}</div>}

      {selectedLocation ? (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2">
          <div className="text-xs font-medium text-foreground">{selectedLocation.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {selectedLocation.address} · {selectedLocation.district}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-foreground/5 px-3 py-2 text-[11px] text-muted-foreground">
          Chưa chọn địa điểm. Khi chọn xong, hệ thống sẽ ưu tiên các phòng gần vị trí đó.
        </div>
      )}
    </div>
  );
}

function LabelLine({ title, description }: { title: string; description: string }) {
  return (
    <>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </>
  );
}
