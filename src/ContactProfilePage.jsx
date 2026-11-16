import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Globe, Mail, Phone, UserRound } from "lucide-react";
import { API_ROOT } from "./config";

function LinkedInIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function ensureUrl(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function escapeVcf(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildVCard(profile) {
  const name = String(profile.name || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0] || "";
  const last = parts.slice(1).join(" ") || "";
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcf(last)};${escapeVcf(first)};;;`,
    `FN:${escapeVcf(name)}`,
  ];
  if (profile.company_name) {
    lines.push(`ORG:${escapeVcf(profile.company_name)}`);
  }
  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVcf(profile.phone)}`);
  }
  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVcf(profile.email)}`);
  }
  if (profile.website_url) {
    lines.push(`URL:${escapeVcf(ensureUrl(profile.website_url))}`);
  }
  if (profile.linkedin_url) {
    lines.push(`URL;TYPE=LinkedIn:${escapeVcf(ensureUrl(profile.linkedin_url))}`);
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function downloadVCard(profile) {
  const vcf = buildVCard(profile);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = String(profile.name || "contact")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_");
  link.href = url;
  link.download = `${safeName || "contact"}.vcf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function ContactRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = (
    <div className="flex items-start gap-3.5 py-4">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2A3344] text-slate-200">
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-all text-[14px] font-medium leading-snug text-white">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block border-b border-white/10 transition hover:bg-white/[0.03]"
      >
        {content}
      </a>
    );
  }

  return <div className="border-b border-white/10">{content}</div>;
}

export default function ContactProfilePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setError("This link is invalid or incomplete.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_ROOT}/profile/${token}/`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.detail ||
            data.message ||
            data.error ||
            (res.status === 404
              ? "Profile not found. This link may be invalid or expired."
              : `Unable to load profile (${res.status}).`)
        );
        setProfile(null);
        return;
      }
      const data = await res.json();
      setProfile({
        ...data,
        phone: data.phone || data.mobile || data.phone_number || null,
        company_name: data.company_name || data.company || null,
        linkedin_url: data.linkedin_url || data.linkedin || null,
        website_url: data.website_url || data.website || null,
      });
    } catch {
      setError("Unable to load this profile. Please check your connection.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const firstName = useMemo(() => {
    const name = String(profile?.name || "").trim();
    return name.split(/\s+/)[0] || "their";
  }, [profile?.name]);

  const initials = initialsFromName(profile?.name);
  const phone = profile?.phone || "";
  const linkedinUrl = profile?.linkedin_url || "";
  const websiteUrl = profile?.website_url || "";


  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(ellipse at top, #1a2438 0%, #0b1220 55%, #070b14 100%)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="w-full max-w-[440px]">
        {loading && (
          <div className="rounded-3xl border border-white/10 bg-[#121a28]/90 px-6 py-16 text-center text-sm text-slate-400 shadow-2xl">
            Loading profile...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-500/20 bg-[#121a28]/90 px-6 py-10 text-center shadow-2xl">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121a28] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            {/* Avatar + name */}
            <div className="flex flex-col items-center px-6 pb-4 pt-10 text-center">
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#2A3344] text-2xl font-semibold tracking-wide text-white ring-1 ring-white/10">
                {initials || <UserRound size={36} className="text-slate-300" />}
              </div>
              <h1 className="mt-5 text-[26px] font-semibold leading-tight text-white">
                {profile.name || "Unknown"}
              </h1>
              {profile.company_name && (
                <p className="mt-1.5 text-[15px] text-slate-400">
                  {profile.company_name}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="mt-2 px-5">
              <ContactRow
                icon={Phone}
                label="Mobile"
                value={phone}
                href={phone ? `tel:${phone}` : undefined}
              />
              <ContactRow
                icon={Mail}
                label="Email"
                value={profile.email}
                href={profile.email ? `mailto:${profile.email}` : undefined}
              />
              <ContactRow
                icon={LinkedInIcon}
                label="LinkedIn"
                value={linkedinUrl}
                href={linkedinUrl ? ensureUrl(linkedinUrl) : undefined}
              />
              <ContactRow
                icon={Globe}
                label="Website"
                value={websiteUrl}
                href={websiteUrl ? ensureUrl(websiteUrl) : undefined}
              />
            </div>

            {/* CTA */}
            <div className="px-5 pb-8 pt-7 text-center">
              <button
                type="button"
                onClick={() => downloadVCard(profile)}
                className="w-full rounded-2xl bg-white px-4 py-3.5 text-[15px] font-semibold text-[#0b1220] transition hover:bg-slate-100"
              >
                + Add to Contacts
              </button>
              <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
                Save {firstName}&apos;s contact details directly to your phone.
              </p>
              {profile.company_name && (
                <p className="mt-5 text-[11px] font-medium tracking-wide text-slate-600">
                  {profile.company_name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
