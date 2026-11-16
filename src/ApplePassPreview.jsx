import React, { useEffect, useRef, useState } from "react";

const DESIGN_W = 480;
const DESIGN_H = 700;

/** Defaults match the coffee-shop reference until the user picks colors */
const DEFAULT_BG = "rgb(93,31,35)";
const DEFAULT_FG = "rgb(255,255,255)";
const DEFAULT_LABEL = "rgb(179,134,102)";

function isValidRgb(value) {
  return /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(
    String(value || "").trim()
  );
}

function resolveColor(value, fallback) {
  const trimmed = String(value || "").trim();
  return isValidRgb(trimmed) ? trimmed : fallback;
}

function useImageSrc(value) {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
  }, [value]);

  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof File) return objectUrl;
  return null;
}

function useFitScale(designWidth) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(Math.min(1, width / designWidth));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  return { ref, scale };
}

/** Decorative QR matching Apple Wallet barcode area (not a real code). */
function AppleQr() {
  const n = 21;
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const inFinder =
        (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      if (inFinder) {
        const lx = x < 7 ? x : x >= n - 7 ? x - (n - 7) : x;
        const ly = y < 7 ? y : y >= n - 7 ? y - (n - 7) : y;
        const onBorder = lx === 0 || lx === 6 || ly === 0 || ly === 6;
        const inCenter = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
        cells.push(onBorder || inCenter ? 1 : 0);
      } else {
        cells.push((x * 3 + y * 5 + x * y) % 3 === 0 ? 1 : 0);
      }
    }
  }

  return (
    <div
      className="flex items-center justify-center rounded-[6px] bg-white"
      style={{ width: 180, height: 180, padding: 10 }}
    >
      <div
        className="h-full w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gridTemplateRows: `repeat(${n}, 1fr)`,
        }}
        aria-hidden
      >
        {cells.map((on, i) => (
          <div key={i} style={{ backgroundColor: on ? "#000" : "#fff" }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Apple Wallet storeCard-style preview.
 * Designed at 480×700, then scaled to fit the preview column.
 */
export default function ApplePassPreview({
  foregroundColor = "",
  backgroundColor = "",
  labelColor = "",
  logoText = "",
  strip = null,
}) {
  const bg = resolveColor(backgroundColor, DEFAULT_BG);
  const fg = resolveColor(foregroundColor, DEFAULT_FG);
  const label = resolveColor(labelColor, DEFAULT_LABEL);
  const stripSrc = useImageSrc(strip);
  const displayLogoText = String(logoText || "").trim() || "Logo text";
  const { ref, scale } = useFitScale(DESIGN_W);

  return (
    <div className="mx-auto w-full max-w-[320px] pt-2" ref={ref}>
      <div
        className="relative mx-auto"
        style={{
          width: DESIGN_W * scale,
          height: DESIGN_H * scale,
        }}
      >
        <div
          className="absolute left-0 top-0 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            borderRadius: 28,
            backgroundColor: bg,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
          }}
          aria-label="Apple Wallet pass preview"
        >
          {/* Header */}
          <div
            className="flex items-center"
            style={{ height: 56, paddingLeft: 22, paddingRight: 22 }}
          >
            <p
              className="truncate"
              style={{
                color: fg,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1,
                margin: 0,
              }}
            >
              {displayLogoText}
            </p>
          </div>

          {/* Strip — object-contain like Google hero (no crop) */}
          <div
            className="relative w-full overflow-hidden"
            style={{ height: 180, backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            {stripSrc ? (
              <img
                src={stripSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-contain p-3"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                strip.png
              </div>
            )}
          </div>

          {/* NAME */}
          <div style={{ paddingLeft: 22, paddingRight: 22, paddingTop: 16 }}>
            <p
              style={{
                color: label,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Name
            </p>
            <p
              className="truncate"
              style={{
                color: fg,
                fontSize: 22,
                fontWeight: 500,
                margin: "4px 0 0",
                lineHeight: 1.2,
              }}
            >
              Rohit Kumar
            </p>
          </div>

          {/* QR */}
          <div
            className="absolute inset-x-0 flex items-center justify-center"
            style={{ top: 320, bottom: 32 }}
          >
            <AppleQr />
          </div>
        </div>
      </div>
    </div>
  );
}
