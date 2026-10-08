'use client'

import React, { useState, useEffect } from 'react'
import {
  XIcon,
  Sparkles,
  Activity,
  Layers,
  Sliders,
  ShieldAlert,
  Flame,
  CheckCircle2,
  RefreshCw,
  Waves,
  Mountain,
  FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRetrievalParams } from '@/contexts/retrieval-params-context'
import NDRFDisasterSitrepModal from '@/components/shared/NDRFDisasterSitrepModal'

export interface DeltaDamageInfo {
  delta_mask_b64: string
  changed_pixels: number
  total_pixels: number
  change_percentage: number
  inundated_area_km2: number
  safe_ground_pct: number
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  hazard_type: string
  ndrf_advisory: string
  confidence: number
}

export interface InspectorQueryInfo {
  name: string
  source_modality: string
  active_classes: string[]
  thumbnail: string
}

export interface InspectorCandidateInfo {
  name: string
  rank: number
  similarity_score: number
  jaccard_overlap: number
  active_classes: string[]
  thumbnail: string
  delta_damage?: DeltaDamageInfo
}

interface MultiSensorInspectorProps {
  open: boolean
  onClose: () => void
  query?: InspectorQueryInfo | null
  candidate?: InspectorCandidateInfo | null
}

export default function MultiSensorInspector({ open, onClose, query, candidate }: MultiSensorInspectorProps) {
  const { telemetry, params } = useRetrievalParams()
  const [showDeltaMask, setShowDeltaMask] = useState<boolean>(true)
  const [maskOpacity, setMaskOpacity] = useState<number>(80)
  const [hazardType, setHazardType] = useState<'flood' | 'landslide'>('flood')
  const [sensitivity, setSensitivity] = useState<number>(0.5)
  const [liveDelta, setLiveDelta] = useState<DeltaDamageInfo | null>(null)
  const [loadingDelta, setLoadingDelta] = useState<boolean>(false)
  const [sitrepOpen, setSitrepOpen] = useState<boolean>(false)

  // Use candidate's pre-computed delta damage or initialize
  useEffect(() => {
    if (candidate?.delta_damage) {
      setLiveDelta(candidate.delta_damage)
      if (candidate.delta_damage.hazard_type) {
        setHazardType(candidate.delta_damage.hazard_type as 'flood' | 'landslide')
      }
    } else {
      setLiveDelta(null)
    }
  }, [candidate])

  // Dynamically recompute delta mask if hazard type or sensitivity changes
  const fetchLiveDeltaMask = async (hz: 'flood' | 'landslide', sens: number) => {
    if (!query?.thumbnail || !candidate?.thumbnail) return
    setLoadingDelta(true)
    try {
      const res = await fetch('/api/retrieval/delta-mask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_b64: query.thumbnail,
          target_b64: candidate.thumbnail,
          query_name: query.name,
          target_name: candidate.name,
          dataset_name: params.dataset || 'ben14k',
          source_modality: query.source_modality,
          target_modality: 's2',
          hazard_type: hz,
          sensitivity: sens,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setLiveDelta(data)
      }
    } catch (e) {
      console.error('Failed to fetch dynamic delta mask:', e)
    } finally {
      setLoadingDelta(false)
    }
  }

  const handleHazardChange = (hz: 'flood' | 'landslide') => {
    setHazardType(hz)
    fetchLiveDeltaMask(hz, sensitivity)
  }

  const handleSensitivityChange = (sens: number) => {
    setSensitivity(sens)
    fetchLiveDeltaMask(hazardType, sens)
  }

  if (!open || !query || !candidate) return null

  const gallerySize = telemetry.gallery_size ? telemetry.gallery_size.toLocaleString() : '11,866'
  const activeDelta = liveDelta || candidate.delta_damage

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-hidden animate-in fade-in-0 duration-150'
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className='relative w-full max-w-4xl max-h-[96vh] flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xl gap-3 sm:gap-4 text-foreground font-sans overflow-y-auto no-scrollbar'>

        {/* Modal Header */}
        <div className='flex items-start justify-between border-b border-border/40 pb-3 shrink-0'>
          <div className='flex flex-col gap-0.5'>
            <div className='flex items-center gap-2'>
              <h2 className='text-sm sm:text-base font-bold uppercase tracking-wider text-foreground font-sans leading-none'>
                MULTI-SENSOR DISASTER INSPECTOR
              </h2>
              <Badge className='bg-[#FBBA72]/20 text-[#FBBA72] border-[#FBBA72]/40 text-[10px] font-mono font-bold py-0'>
                CORE DELTA ENGINE
              </Badge>
            </div>
            <p className='text-[11px] text-muted-foreground font-sans'>
              Cross-Modal Latent Alignment & Pixel-Wise Physical Damage Assessment
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={() => setSitrepOpen(true)}
              className='h-7 sm:h-8 px-2.5 text-xs font-mono font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer flex items-center gap-1.5 shadow-sm'
            >
              <FileText className='size-3.5' />
              <span>1-Click NDRF SITREP</span>
            </Button>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={onClose}
              className='rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer shrink-0'
            >
              <XIcon className='size-4' />
              <span className='sr-only'>Close</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Delta Mask Control Toolbar */}
        <div className='flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs shrink-0'>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-muted-foreground uppercase text-[10px] tracking-wide'>
              Delta Mask:
            </span>
            <Button
              size='sm'
              variant={showDeltaMask ? 'default' : 'outline'}
              onClick={() => setShowDeltaMask(!showDeltaMask)}
              className={cn(
                'h-7 text-xs font-mono font-bold px-2.5 cursor-pointer',
                showDeltaMask ? 'bg-[#FBBA72] text-slate-950 hover:bg-[#FBBA72]/90' : 'border-border/60'
              )}
            >
              <Sparkles className='size-3 mr-1' />
              {showDeltaMask ? 'Mask Visible' : 'Mask Hidden'}
            </Button>
          </div>

          {/* Hazard mode picker */}
          <div className='flex items-center gap-1.5'>
            <span className='font-semibold text-muted-foreground uppercase text-[10px] tracking-wide'>Hazard:</span>
            <button
              onClick={() => handleHazardChange('flood')}
              className={cn(
                'px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer',
                hazardType === 'flood'
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400 font-bold'
                  : 'border-border/40 text-muted-foreground hover:text-foreground'
              )}
            >
              <Waves className='size-3 text-cyan-400' /> Flood Inundation
            </button>
            <button
              onClick={() => handleHazardChange('landslide')}
              className={cn(
                'px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer',
                hazardType === 'landslide'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold'
                  : 'border-border/40 text-muted-foreground hover:text-foreground'
              )}
            >
              <Mountain className='size-3 text-amber-400' /> Landslide / Debris
            </button>
          </div>

          {/* Opacity & Sensitivity sliders */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1.5'>
              <span className='text-[10px] text-muted-foreground font-mono'>Opacity:</span>
              <input
                type='range'
                min='10'
                max='100'
                value={maskOpacity}
                onChange={e => setMaskOpacity(Number(e.target.value))}
                className='w-16 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-[#FBBA72]'
              />
              <span className='text-[10px] font-mono text-[#FBBA72]'>{maskOpacity}%</span>
            </div>

            {loadingDelta && (
              <RefreshCw className='size-3.5 text-[#FBBA72] animate-spin' />
            )}
          </div>
        </div>

        {/* Image Pair Comparison Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 flex-1 min-h-0'>

          {/* Left Panel: Query Image */}
          <div className='flex flex-col rounded-xl border border-[#FBBA72]/30 bg-muted/10 overflow-hidden flex-1 justify-between min-h-0'>
            <div className='flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-muted/20 shrink-0'>
              <Badge
                variant='outline'
                className='bg-[#FBBA72]/15 text-[#FBBA72] border-[#FBBA72]/40 text-[10px] font-bold px-2 py-0.5 rounded font-sans uppercase'
              >
                {query.source_modality.toUpperCase()} SENSOR
              </Badge>
              <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-sans'>
                POST-DISASTER QUERY
              </span>
            </div>
            <div className='relative w-full h-[28vh] max-h-[250px] bg-black/40 overflow-hidden flex items-center justify-center shrink-0'>
              <img
                src={query.thumbnail}
                alt={query.name}
                className='w-full h-full object-contain bg-black/30'
              />
            </div>
            <div className='p-2.5 flex flex-col gap-1.5 bg-muted/10 border-t border-border/30 shrink-0'>
              <span className='text-xs font-semibold text-foreground truncate font-sans' title={query.name}>
                {query.name}
              </span>
              <div className='flex flex-wrap gap-1 max-h-12 overflow-y-auto no-scrollbar'>
                {query.active_classes.map((cl, i) => (
                  <Badge
                    key={i}
                    variant='secondary'
                    className='bg-muted/80 text-muted-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-md'
                  >
                    {cl}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Retrieved Match with REAL Delta Mask */}
          <div className='flex flex-col rounded-xl border border-emerald-500/30 bg-muted/10 overflow-hidden flex-1 justify-between min-h-0'>
            <div className='flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-muted/20 shrink-0'>
              <div className='flex items-center gap-1.5'>
                <Badge
                  variant='outline'
                  className='bg-emerald-500/15 text-emerald-500 border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded font-sans uppercase'
                >
                  RANK #{candidate.rank} MATCH
                </Badge>
              </div>
              <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-sans'>
                RETRIEVED PRE-DISASTER OPTICAL
              </span>
            </div>
            <div className='relative w-full h-[28vh] max-h-[250px] bg-black/40 overflow-hidden flex items-center justify-center shrink-0'>
              {/* Pre-event Optical Baseline Scene */}
              <img
                src={candidate.thumbnail}
                alt={candidate.name}
                className='w-full h-full object-contain bg-black/30'
              />

              {/* Real Backend-Computed Pixel-Wise Delta Mask Overlay */}
              {showDeltaMask && activeDelta?.delta_mask_b64 && (
                <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
                  <img
                    src={activeDelta.delta_mask_b64}
                    alt='Pixel Delta Mask'
                    style={{ opacity: maskOpacity / 100 }}
                    className='w-full h-full object-contain transition-opacity duration-200'
                  />
                  <div className='absolute bottom-2 left-2 bg-black/90 px-2 py-0.5 rounded text-[9px] font-mono text-[#FBBA72] border border-[#FBBA72]/40 flex items-center gap-1 shadow-sm'>
                    <Activity className='size-3 text-cyan-400 animate-pulse' />
                    <span>Real 10m GSD Delta Mask Active</span>
                  </div>
                </div>
              )}
            </div>
            <div className='p-2.5 flex flex-col gap-1.5 bg-muted/10 border-t border-border/30 shrink-0'>
              <span className='text-xs font-semibold text-foreground truncate font-sans' title={candidate.name}>
                {candidate.name}
              </span>
              <div className='flex flex-wrap gap-1 max-h-12 overflow-y-auto no-scrollbar'>
                {candidate.active_classes.map((cl, i) => (
                  <Badge
                    key={i}
                    variant='secondary'
                    className='bg-muted/80 text-muted-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-md'
                  >
                    {cl}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Real Physical Remote-Sensing Disaster Delta Metrics */}
        {activeDelta && (
          <div className='rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2 shrink-0'>
            <div className='flex items-center justify-between border-b border-border/40 pb-1.5'>
              <span className='text-xs font-bold text-foreground font-mono flex items-center gap-1.5'>
                <ShieldAlert className='size-3.5 text-[#FBBA72]' />
                QUANTITATIVE PHYSICAL DAMAGE ASSESSMENT (BEN-14K / 10M GSD)
              </span>
              <Badge
                className={cn(
                  'text-[10px] font-mono font-bold px-2 py-0.5',
                  activeDelta.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : activeDelta.severity === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                )}
              >
                {activeDelta.severity} SEVERITY
              </Badge>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
              <div className='bg-background/60 p-2 rounded-lg border border-border/40'>
                <span className='text-[10px] text-muted-foreground uppercase font-mono block'>Impact Extent</span>
                <span className='text-sm font-bold font-mono text-cyan-400'>
                  {activeDelta.inundated_area_km2} km²
                </span>
                <span className='text-[10px] text-muted-foreground block'>{activeDelta.change_percentage}% of scene</span>
              </div>

              <div className='bg-background/60 p-2 rounded-lg border border-border/40'>
                <span className='text-[10px] text-muted-foreground uppercase font-mono block'>Changed Pixels</span>
                <span className='text-sm font-bold font-mono text-foreground'>
                  {activeDelta.changed_pixels.toLocaleString()}
                </span>
                <span className='text-[10px] text-muted-foreground block'>of {activeDelta.total_pixels.toLocaleString()}</span>
              </div>

              <div className='bg-background/60 p-2 rounded-lg border border-border/40'>
                <span className='text-[10px] text-muted-foreground uppercase font-mono block'>Safe Evacuation Ground</span>
                <span className='text-sm font-bold font-mono text-emerald-400'>
                  {activeDelta.safe_ground_pct}%
                </span>
                <span className='text-[10px] text-muted-foreground block'>High stable terrain</span>
              </div>

              <div className='bg-background/60 p-2 rounded-lg border border-border/40'>
                <span className='text-[10px] text-muted-foreground uppercase font-mono block'>Algorithm Confidence</span>
                <span className='text-sm font-bold font-mono text-[#FBBA72]'>
                  {activeDelta.confidence}%
                </span>
                <span className='text-[10px] text-muted-foreground block'>Otsu adaptive quantile</span>
              </div>
            </div>

            {/* NDRF Advisory Banner */}
            <div className='text-[11px] font-mono text-muted-foreground bg-black/40 p-2.5 rounded-md border border-border/30 flex items-center justify-between gap-2'>
              <div className='flex items-start gap-1.5'>
                <span className='text-[#FBBA72] font-bold shrink-0'>NDRF ADVISORY:</span>
                <span>{activeDelta.ndrf_advisory}</span>
              </div>
              <Button
                size='sm'
                onClick={() => setSitrepOpen(true)}
                className='h-6 px-2 text-[10px] font-mono font-bold bg-rose-500 hover:bg-rose-600 text-white shrink-0 cursor-pointer flex items-center gap-1 shadow-xs'
              >
                <FileText className='size-3' />
                <span>Export SITREP PDF</span>
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Metrics Bar (3 Columns) */}
        <div className='grid grid-cols-3 divide-x divide-border/40 border border-border/60 rounded-xl bg-muted/20 p-2.5 sm:p-3 shrink-0'>

          {/* Jaccard Overlap */}
          <div className='flex flex-col gap-0.5 px-2 sm:px-4 first:pl-1'>
            <span className='text-[9px] sm:text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-sans truncate'>
              JACCARD OVERLAP
            </span>
            <span className='text-lg sm:text-xl font-mono font-bold text-[#00F0FF] dark:text-[#00F0FF] leading-tight'>
              {candidate.jaccard_overlap}%
            </span>
            <span className='text-[9px] sm:text-[10px] text-muted-foreground font-sans truncate'>
              semantic class similarity
            </span>
          </div>

          {/* Cosine Similarity */}
          <div className='flex flex-col gap-0.5 px-2 sm:px-4'>
            <span className='text-[9px] sm:text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-sans truncate'>
              COSINE SIMILARITY
            </span>
            <span className='text-lg sm:text-xl font-mono font-bold text-[#FBBA72] dark:text-[#FBBA72] leading-tight'>
              {candidate.similarity_score}%
            </span>
            <span className='text-[9px] sm:text-[10px] text-muted-foreground font-sans truncate'>
              embedding space distance
            </span>
          </div>

          {/* Rank Position */}
          <div className='flex flex-col gap-0.5 px-2 sm:px-4 last:pr-1'>
            <span className='text-[9px] sm:text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-sans truncate'>
              RANK POSITION
            </span>
            <span className='text-lg sm:text-xl font-mono font-bold text-emerald-500 dark:text-emerald-400 leading-tight'>
              #{candidate.rank}
            </span>
            <span className='text-[9px] sm:text-[10px] text-muted-foreground font-sans truncate'>
              in gallery of {gallerySize}
            </span>
          </div>

        </div>

      </div>

      {/* NDRF Disaster Situation Report (SITREP) Modal */}
      <NDRFDisasterSitrepModal
        open={sitrepOpen}
        onClose={() => setSitrepOpen(false)}
        query={query}
        candidate={{
          ...candidate,
          delta_damage: activeDelta
        }}
        hazardType={hazardType}
        constellationId={params.constellation || 'isro_eos04'}
      />
    </div>
  )
}
