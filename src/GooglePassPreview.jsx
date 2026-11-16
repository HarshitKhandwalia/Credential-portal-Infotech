import React, { useEffect, useRef, useState } from "react";

const DESIGN_W = 480;
const DESIGN_H = 700;
const DEFAULT_BG = "#C52828";

function normalizeHex(value) {
  let v = String(value || "").trim();
  if (!v) return "";
  if (!v.startsWith("#")) v = `#${v}`;
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [, a, b, c] = v;
    return `#${a}${a}${b}${b}${c}${c}`.toUpperCase();
  }
  return v;
}

function isValidHex(value) {
  return /^#[0-9a-fA-F]{6}$/.test(normalizeHex(value));
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

/** Decorative QR (not a real code) — matches BNI-style Google pass. */
function GoogleQr() {
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
      className="flex items-center justify-center rounded-2xl bg-white shadow-sm"
      style={{ width: 200, height: 200, padding: 12 }}
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
 * Google Wallet-style preview (BNI ref layout):
 * - Top colored body: logo + card title, name, QR
 * - Bottom: hero image (unlike Apple strip, which sits under the header)
 */
export default function GooglePassPreview({
  backgroundColor = "",
  heroImage = null,
  logo = null,
  cardTitle = "",
}) {
  const bg = isValidHex(backgroundColor)
    ? normalizeHex(backgroundColor)
    : DEFAULT_BG;
  const heroSrc = useImageSrc(heroImage);
  const logoSrc = useImageSrc(logo);
  const title = String(cardTitle || "").trim() || "Card title";
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
          className="absolute left-0 top-0 flex flex-col overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            borderRadius: 28,
            backgroundColor: bg,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
          aria-label="Google Wallet pass preview"
        >
          {/* Colored top: logo + title, name, QR */}
          <div className="flex min-h-0 flex-1 flex-col px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <p className="truncate text-[16px] font-medium leading-tight text-white">
                {title}
              </p>
            </div>

            <p className="mt-5 truncate text-[26px] font-semibold leading-tight text-white">
              Sai Kiran Karituri
            </p>

            <div className="flex flex-1 items-center justify-center py-6">
              <GoogleQr />
            </div>
          </div>

          {/* Hero image at bottom (Google layout) */}
          <div
            className="relative w-full shrink-0 bg-white"
            style={{ height: 210 }}
          >
            {heroSrc ? (
              <img
                src={heroSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-contain p-4"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">
                Hero image
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
