"use client";

import { useState } from "react";
import { Section } from "../../ui/section";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { cn } from "@/lib/utils";
import {
  CloudOff,
  Layers,
  Search,
  ShieldCheck,
  Sprout,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const USE_CASES = [
  {
    id: "flood",
    icon: <CloudOff className="size-4" />,
    tag: "Monsoon Flood Response",
    title: "Assam & Bihar Flash Flood Inundation Mapping",
    description:
      "During annual monsoon floods across the Brahmaputra and Kosi basins, cloud cover exceeds 70% for months, leaving optical satellites completely blind. Sentinel-1 and RISAT active C-band radar cut through heavy monsoon storm clouds. SABER takes post-disaster SAR feeds and translates microwave backscatter directly into the clean pre-disaster optical archive in 28.48ms, providing NDRF and SDMA with instantaneous before/after damage assessments.",
    sarLabel: "Sentinel-1 / RISAT · Assam Flood Inundation Radar",
    opticalLabel: "Sentinel-2 Optical · Pre-Flood Baseline Reference",
    sarImg: "/images/satellite/real_ben14k_sar_1.png",
    opticalImg: "/images/satellite/real_ben14k_opt_1.png",
    result: "Matched pre-disaster optical scene in 28.48ms (93.80% mAP)",
  },
  {
    id: "landslide",
    icon: <ShieldCheck className="size-4" />,
    tag: "Geological Disaster",
    title: "Wayanad & Western Ghats Landslide Debris Tracking",
    description:
      "Severe rainfall triggers catastrophic slope failures and debris flows in Wayanad and the Western Ghats under dense cloud and mist. Optical satellites cannot view the terrain for days. SABER bridges SAR backscatter measurements of ground roughness directly into high-resolution optical terrain representations, empowering rescue teams to detect cut-off roads and buried settlements in real-time.",
    sarLabel: "Sentinel-1 SAR · Wayanad Roughness & Slope Radar",
    opticalLabel: "Sentinel-2 Optical · Pre-Disaster Terrain Reference",
    sarImg: "/images/satellite/real_ben14k_sar_2.png",
    opticalImg: "/images/satellite/real_ben14k_opt_2.png",
    result: "Cross-Modal F1@5 = 76.71% (Beats World SOTA CR-JEPA)",
  },
  {
    id: "cyclone",
    icon: <MapPin className="size-4" />,
    tag: "Coastal Defense",
    title: "Bay of Bengal Cyclone Storm Surge Defense",
    description:
      "During major cyclonic storms striking Odisha and Andhra Pradesh, hurricane-force cloud bands obstruct visual reconnaissance. SABER processes all-weather microwave radar to retrieve matching optical coastal baselines, allowing disaster commanders to map inundated coastal embankments and plan evacuation corridors at night or during peak gale winds.",
    sarLabel: "Sentinel-1 SAR · Cyclone Coastal Surge Backscatter",
    opticalLabel: "Sentinel-2 Optical · Historical Coastal Inundation Pair",
    sarImg: "/images/satellite/real_ben14k_sar_3.png",
    opticalImg: "/images/satellite/real_ben14k_opt_3.png",
    result: "Sub-28.5ms retrieval from 14,832-scene gallery",
  },
  {
    id: "isro",
    icon: <Sprout className="size-4" />,
    tag: "Sovereign Space Tech",
    title: "ISRO NRSC Bhuvan & Desi-Tech Constellation Onboarding",
    description:
      "Built with a dynamic wavelength hypernetwork (λc ∈ R^C), SABER is natively compatible with current and upcoming Indian satellite constellations—including RISAT, EOS-04, and the NASA-ISRO NISAR dual-frequency radar—without retraining the core Vision Transformer backbone.",
    sarLabel: "ISRO Radar Sensor · Multi-Frequency Microwave Feed",
    opticalLabel: "ISRO Resourcesat / Cartosat · Optical Reference Match",
    sarImg: "/images/satellite/real_ben14k_sar_4.png",
    opticalImg: "/images/satellite/real_ben14k_opt_4.png",
    result: "Operating at 918.7 MB VRAM (Sub-1GB Edge & Microsat Ready)",
  },
  {
    id: "archive",
    icon: <Search className="size-4" />,
    tag: "Archive Search",
    title: "Cross-Sensor Archive Retrieval",
    description:
      "Space agencies hold petabyte-scale archives spanning decades and multiple sensors. SABER lets researchers search millions of scenes in real-time using any sensor as query — semantic image search across the entire Earth observation archive.",
    sarLabel: "Sentinel-1 SAR · Archive Query Radar Scene",
    opticalLabel: "Sentinel-2 Optical · Matched Archive Optical Scene",
    sarImg: "/images/satellite/real_ben14k_sar_5.png",
    opticalImg: "/images/satellite/real_ben14k_opt_5.png",
    result: "14,832-scene gallery · 768-dim embeddings",
  },
  {
    id: "forest",
    icon: <Layers className="size-4" />,
    tag: "Environmental Monitoring",
    title: "Deforestation & Fire Scar Detection",
    description:
      "Forest fire scars and deforestation appear as strong SAR texture anomalies. SABER retrieves the matching optical reference scene for each detected change, letting forest departments confirm, document and measure affected area with visual clarity.",
    sarLabel: "Sentinel-1 SAR · Forest Anomaly Radar Scene",
    opticalLabel: "Sentinel-2 Optical · Forest Vegetation Canopy Match",
    sarImg: "/images/satellite/real_ben14k_sar_1.png",
    opticalImg: "/images/satellite/real_ben14k_opt_1.png",
    result: "0.26% Trainable Params (294.9K / 111.6M)",
  },
];

function ImagePair({
  sarImg,
  opticalImg,
  sarLabel,
  opticalLabel,
}: {
  sarImg: string;
  opticalImg: string;
  sarLabel: string;
  opticalLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl overflow-hidden p-1.5 bg-card/60 border border-border/60">
      {/* SAR Image Container */}
      <div className="relative flex flex-col gap-2">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-border/60 group">
          <img
            src={sarImg}
            alt={sarLabel}
            className="w-full h-full object-cover grayscale contrast-125 brightness-90 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <Badge
            variant="outline"
            className="absolute bottom-2 left-2 text-[9px] font-bold font-mono uppercase tracking-wider text-sky-400 bg-background/80 border-sky-500/40 backdrop-blur-md px-2 py-0.5"
          >
            SAR · Sees Through Clouds
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground font-sans leading-snug px-1 truncate" title={sarLabel}>
          {sarLabel}
        </p>
      </div>

      {/* Optical Image Container */}
      <div className="relative flex flex-col gap-2">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-[#FBBA72]/40 group">
          <img
            src={opticalImg}
            alt={opticalLabel}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <Badge
            variant="outline"
            className="absolute bottom-2 left-2 text-[9px] font-bold font-mono uppercase tracking-wider text-[#FBBA72] bg-background/80 border-[#FBBA72]/50 backdrop-blur-md px-2 py-0.5"
          >
            OPTICAL · Retrieved Match
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground font-sans leading-snug px-1 truncate" title={opticalLabel}>
          {opticalLabel}
        </p>
      </div>
    </div>
  );
}

export default function UseCases() {
  const [activeId, setActiveId] = useState("flood");
  const active = USE_CASES.find((u) => u.id === activeId) ?? USE_CASES[0];

  return (
    <Section>
      <div className="max-w-container mx-auto flex flex-col gap-10 sm:gap-14 font-sans">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge
            variant="outline"
            className="border-[#FBBA72]/40 text-[#FBBA72] bg-[#FBBA72]/10 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
          >
            <Sparkles className="size-3 mr-1 text-[#FBBA72]" />
            Real-World Applications
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl leading-tight max-w-[640px] text-foreground font-sans">
            Where SABER changes the game
          </h2>
          <p className="text-muted-foreground max-w-[600px] text-sm sm:text-base leading-relaxed font-sans">
            SAR radar sees through clouds, smoke, and darkness. Optical imagery is visually interpretable. SABER bridges both — enabling cross-sensor retrieval in under 30ms.
          </p>
        </div>

        {/* Tab Selector Chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {USE_CASES.map((uc) => {
            const isActive = activeId === uc.id;
            return (
              <button
                key={uc.id}
                onClick={() => setActiveId(uc.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer font-sans",
                  isActive
                    ? "border-[#FBBA72]/60 bg-[#FBBA72]/15 text-[#FBBA72] shadow-sm"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:border-border/80 hover:text-foreground hover:bg-card/70",
                )}
              >
                {uc.icon}
                <span>{uc.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden p-6 sm:p-8">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column: Text Info */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-[#FBBA72]/40 text-[#FBBA72] bg-[#FBBA72]/10 text-xs font-semibold px-3 py-0.5 rounded-full"
                  >
                    {active.tag}
                  </Badge>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans leading-snug">
                  {active.title}
                </h3>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-sans">
                  {active.description}
                </p>

                {/* How SABER Solves This Box */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-5 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-[#FBBA72]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FBBA72]">
                      How SABER Solves This
                    </span>
                  </div>
                  <ol className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FBBA72]/20 border border-[#FBBA72]/40 text-[11px] font-bold text-[#FBBA72] font-mono">
                        1
                      </span>
                      <span>SAR image encoded by wavelength-conditioned DOFA ViT backbone</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FBBA72]/20 border border-[#FBBA72]/40 text-[11px] font-bold text-[#FBBA72] font-mono">
                        2
                      </span>
                      <span>CFM latent bridge transports SAR embedding → optical hypersphere</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FBBA72]/20 border border-[#FBBA72]/40 text-[11px] font-bold text-[#FBBA72] font-mono">
                        3
                      </span>
                      <span>FAISS cosine search retrieves Top-K optical matches in &lt;1ms</span>
                    </li>
                  </ol>
                </div>

                {/* Result Pill */}
                <div className="flex items-center gap-2 pt-1">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold font-mono text-[#FBBA72]">
                    {active.result}
                  </span>
                </div>
              </div>

              {/* Right Column: Image Pair & Transfer Path */}
              <div className="flex flex-col gap-4">
                <ImagePair
                  sarImg={active.sarImg}
                  opticalImg={active.opticalImg}
                  sarLabel={active.sarLabel}
                  opticalLabel={active.opticalLabel}
                />
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground p-2 rounded-xl bg-muted/20 border border-border/40 font-mono">
                  <span className="text-foreground/80 font-semibold">SAR Query</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-px w-6 bg-[#FBBA72]/60" />
                    <Badge
                      variant="outline"
                      className="border-[#FBBA72]/50 text-[#FBBA72] bg-[#FBBA72]/10 text-[10px] font-bold px-2 py-0.5"
                    >
                      CFM Bridge
                    </Badge>
                    <div className="h-px w-6 bg-[#FBBA72]/60" />
                  </div>
                  <span className="text-[#FBBA72] font-semibold">Retrieved Optical</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {[
            { val: "<28.5ms", label: "retrieval latency" },
            { val: "73.51%", label: "cross-modal F1@5" },
            { val: "91.49%", label: "cross-modal mAP" },
            { val: "0.26%", label: "trainable params (LoRA)" },
          ].map((s) => (
            <Card key={s.label} className="border-border/60 bg-card/40 backdrop-blur-md shadow-sm p-4 text-center rounded-2xl">
              <CardContent className="p-0 flex flex-col gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#FBBA72] tracking-tight font-sans">
                  {s.val}
                </span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold font-sans">
                  {s.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
