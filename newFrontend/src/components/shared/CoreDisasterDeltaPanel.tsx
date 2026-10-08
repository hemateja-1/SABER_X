'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Sparkles,
  Layers,
  Waves,
  Mountain,
  Sliders,
  Activity,
  Maximize2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

interface CoreDisasterDeltaPanelProps {
  query?: {
    name: string
    source_modality: string
    thumbnail: string
    active_classes?: string[]
  } | null
  candidate?: {
    name: string
    rank: number
    thumbnail: string
    similarity_score: number
    jaccard_overlap: number
    delta_damage?: DeltaDamageInfo
  } | null
  onOpenInspector?: () => void
}

export default function CoreDisasterDeltaPanel({
  query,
  candidate,
  onOpenInspector
}: CoreDisasterDeltaPanelProps) {
  const [viewMode, setViewMode] = useState<'triview' | 'overlay' | 'mask_only' | 'optical'>('overlay')
  const [hazardType, setHazardType] = useState<'flood' | 'landslide'>('flood')
  const [maskOpacity, setMaskOpacity] = useState<number>(85)
  const [sensitivity, setSensitivity] = useState<number>(0.5)
  const [liveDelta, setLiveDelta] = useState<DeltaDamageInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [sitrepModalOpen, setSitrepModalOpen] = useState<boolean>(false)

  // Initialize with candidate's backend-computed delta damage
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

  // Dynamically recompute via core backend if user changes hazard or sensitivity
  const triggerRecompute = async (hz: 'flood' | 'landslide', sens: number) => {
    if (!query?.thumbnail || !candidate?.thumbnail) return
    setLoading(true)
    try {
      const res = await fetch('/api/retrieval/delta-mask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_b64: query.thumbnail,
          target_b64: candidate.thumbnail,
          query_name: query.name,
          target_name: candidate.name,
          dataset_name: 'ben14k',
          source_modality: query.source_modality || 's1',
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
      console.error('Error recomputing delta mask:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleHazardChange = (hz: 'flood' | 'landslide') => {
    setHazardType(hz)
    triggerRecompute(hz, sensitivity)
  }

  const handleSensitivityChange = (sens: number) => {
    setSensitivity(sens)
    triggerRecompute(hazardType, sens)
  }

  const delta = liveDelta || candidate?.delta_damage
  if (!query || !candidate || !delta) return null

  return (
    <Card className='border border-[#FBBA72]/40 bg-card shadow-lg overflow-hidden border-t-2 border-t-[#FBBA72] font-sans'>
      {/* Header bar */}
      <CardContent className='p-4 sm:p-5 border-b border-border/40 bg-muted/20'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2 flex-wrap'>
              <Badge className='bg-[#FBBA72]/20 text-[#FBBA72] border-[#FBBA72]/40 text-xs font-mono font-bold flex items-center gap-1'>
                <Sparkles className='size-3' /> FEATURE 1 CORE INTEGRATION
              </Badge>
              <Badge variant='outline' className='border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs font-mono'>
                BEN-14K · 10m GSD
              </Badge>
              <Badge variant='outline' className='border-cyan-500/40 text-cyan-400 bg-cyan-500/10 text-xs font-mono'>
                Match #{candidate.rank} ({candidate.similarity_score}% Sim)
              </Badge>
            </div>
            <h3 className='text-base sm:text-lg font-bold text-foreground font-sans flex items-center gap-2'>
              <ShieldAlert className='size-5 text-[#FBBA72]' />
              Pixel-Wise Disaster Damage Delta Mask & Inundation Analysis
            </h3>
            <p className='text-xs text-muted-foreground'>
              Automated differential reflectance & specular radar change extraction over retrieved cloud-free baseline scene
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={() => setSitrepModalOpen(true)}
              className='h-8 text-xs font-mono font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer flex items-center gap-1.5 shadow-sm'
            >
              <FileText className='size-3.5' />
              <span>1-Click NDRF SITREP</span>
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={onOpenInspector}
              className='h-8 text-xs font-mono font-semibold border-[#FBBA72]/40 hover:bg-[#FBBA72]/10 text-foreground cursor-pointer flex items-center gap-1.5'
            >
              <Maximize2 className='size-3.5 text-[#FBBA72]' />
              Inspect In Modal
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Interactive Controls Bar */}
      <div className='p-3 sm:p-4 border-b border-border/40 bg-muted/10 flex flex-wrap items-center justify-between gap-3 text-xs'>
        {/* View mode toggle */}
        <div className='flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50'>
          <button
            onClick={() => setViewMode('overlay')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer',
              viewMode === 'overlay' ? 'bg-[#FBBA72] text-slate-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Composite Overlay
          </button>
          <button
            onClick={() => setViewMode('triview')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer',
              viewMode === 'triview' ? 'bg-[#FBBA72] text-slate-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Tri-View (SAR / Opt / Delta)
          </button>
          <button
            onClick={() => setViewMode('mask_only')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer',
              viewMode === 'mask_only' ? 'bg-[#FBBA72] text-slate-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Delta Mask Only
          </button>
          <button
            onClick={() => setViewMode('optical')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer',
              viewMode === 'optical' ? 'bg-[#FBBA72] text-slate-950 font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Pre-Event Optical
          </button>
        </div>

        {/* Hazard type selection */}
        <div className='flex items-center gap-2'>
          <span className='font-semibold text-muted-foreground uppercase text-[10px] tracking-wide'>Hazard Mode:</span>
          <button
            onClick={() => handleHazardChange('flood')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer',
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
              'px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer',
              hazardType === 'landslide'
                ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold'
                : 'border-border/40 text-muted-foreground hover:text-foreground'
            )}
          >
            <Mountain className='size-3 text-amber-400' /> Landslide Debris
          </button>
        </div>

        {/* Opacity slider */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1.5'>
            <Sliders className='size-3.5 text-muted-foreground' />
            <span className='text-[10px] text-muted-foreground font-mono'>Mask Opacity:</span>
            <input
              type='range'
              min='10'
              max='100'
              value={maskOpacity}
              onChange={e => setMaskOpacity(Number(e.target.value))}
              className='w-20 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-[#FBBA72]'
            />
            <span className='text-[10px] font-mono font-bold text-[#FBBA72] w-7'>{maskOpacity}%</span>
          </div>

          {loading && <RefreshCw className='size-3.5 text-[#FBBA72] animate-spin' />}
        </div>
      </div>

      <CardContent className='p-4 sm:p-5 space-y-5'>
        {/* Visual Panels Section */}
        {viewMode === 'triview' ? (
          /* Tri-view side by side */
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            {/* 1. SAR Query */}
            <div className='rounded-xl border border-sky-500/30 bg-muted/10 overflow-hidden flex flex-col justify-between'>
              <div className='p-2 border-b border-border/40 bg-muted/20 flex items-center justify-between text-xs'>
                <span className='font-mono font-bold text-sky-400'>1. POST-DISASTER QUERY</span>
                <Badge variant='outline' className='text-[10px] uppercase font-mono py-0'>
                  {query.source_modality.toUpperCase()} Radar
                </Badge>
              </div>
              <div className='relative aspect-square w-full bg-black/60 flex items-center justify-center overflow-hidden'>
                <img src={query.thumbnail} alt={query.name} className='w-full h-full object-contain' />
              </div>
              <div className='p-2 bg-muted/10 text-[11px] text-muted-foreground border-t border-border/30 truncate'>
                {query.name}
              </div>
            </div>

            {/* 2. Retrieved Optical */}
            <div className='rounded-xl border border-emerald-500/30 bg-muted/10 overflow-hidden flex flex-col justify-between'>
              <div className='p-2 border-b border-border/40 bg-muted/20 flex items-center justify-between text-xs'>
                <span className='font-mono font-bold text-emerald-400'>2. RETRIEVED BASELINE</span>
                <Badge variant='outline' className='text-[10px] uppercase font-mono py-0'>
                  Sentinel-2 MS (Cloud-Free)
                </Badge>
              </div>
              <div className='relative aspect-square w-full bg-black/60 flex items-center justify-center overflow-hidden'>
                <img src={candidate.thumbnail} alt={candidate.name} className='w-full h-full object-contain' />
              </div>
              <div className='p-2 bg-muted/10 text-[11px] text-muted-foreground border-t border-border/30 truncate'>
                {candidate.name}
              </div>
            </div>

            {/* 3. Pixel Delta Composite */}
            <div className='rounded-xl border border-[#FBBA72]/40 bg-muted/10 overflow-hidden flex flex-col justify-between'>
              <div className='p-2 border-b border-border/40 bg-muted/20 flex items-center justify-between text-xs'>
                <span className='font-mono font-bold text-[#FBBA72]'>3. PIXEL DELTA OVERLAY</span>
                <Badge className='text-[10px] uppercase font-mono py-0 bg-[#FBBA72]/20 text-[#FBBA72] border-[#FBBA72]/40'>
                  10m Inundation Mask
                </Badge>
              </div>
              <div className='relative aspect-square w-full bg-black/60 flex items-center justify-center overflow-hidden'>
                <img src={candidate.thumbnail} alt={candidate.name} className='w-full h-full object-contain' />
                {delta.delta_mask_b64 && (
                  <img
                    src={delta.delta_mask_b64}
                    alt='Delta Mask'
                    style={{ opacity: maskOpacity / 100 }}
                    className='absolute inset-0 w-full h-full object-contain pointer-events-none'
                  />
                )}
              </div>
              <div className='p-2 bg-muted/10 text-[11px] text-[#FBBA72] font-mono border-t border-border/30 truncate'>
                Inundated: {delta.inundated_area_km2} km² ({delta.change_percentage}%)
              </div>
            </div>
          </div>
        ) : (
          /* Single Main Display */
          <div className='relative rounded-xl border border-border/60 bg-black/50 overflow-hidden flex items-center justify-center h-[340px] sm:h-[400px]'>
            {/* Pre-event Optical */}
            {viewMode !== 'mask_only' && (
              <img
                src={candidate.thumbnail}
                alt={candidate.name}
                className='w-full h-full object-contain'
              />
            )}

            {/* Transparent Pixel Delta Mask */}
            {(viewMode === 'overlay' || viewMode === 'mask_only') && delta.delta_mask_b64 && (
              <img
                src={delta.delta_mask_b64}
                alt='Delta Damage Mask'
                style={{ opacity: viewMode === 'mask_only' ? 1.0 : maskOpacity / 100 }}
                className='absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150'
              />
            )}

            {/* Dynamic Water & Damage Label Pill */}
            <div className='absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#FBBA72]/40 text-xs font-mono text-foreground flex items-center gap-2 shadow-lg'>
              <Activity className='size-3.5 text-cyan-400 animate-pulse' />
              <span>
                {hazardType === 'flood' ? 'Water Ingress & Inundation' : 'Landslide & Soil Liquefaction'}:{' '}
                <strong className='text-cyan-400'>{delta.inundated_area_km2} km²</strong> ({delta.change_percentage}%)
              </span>
            </div>

            <div className='absolute top-3 right-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-border/50 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 shadow-md'>
              <span>Otsu Cutoff: {delta.confidence}% Conf.</span>
            </div>
          </div>
        )}

        {/* Quantitative Physical Remote-Sensing KPI Cards */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          <div className='rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-1'>
            <span className='text-[11px] font-semibold text-muted-foreground uppercase font-mono block'>
              Inundated / Damaged Area
            </span>
            <div className='text-xl sm:text-2xl font-bold font-mono text-cyan-400'>
              {delta.inundated_area_km2} km²
            </div>
            <span className='text-[11px] text-muted-foreground block font-mono'>
              {delta.change_percentage}% of 2.24 km² patch
            </span>
          </div>

          <div className='rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 space-y-1'>
            <span className='text-[11px] font-semibold text-muted-foreground uppercase font-mono block'>
              Changed Satellite Pixels
            </span>
            <div className='text-xl sm:text-2xl font-bold font-mono text-foreground'>
              {delta.changed_pixels.toLocaleString()}
            </div>
            <span className='text-[11px] text-muted-foreground block font-mono'>
              Total 50,176 pixels (10m GSD)
            </span>
          </div>

          <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1'>
            <span className='text-[11px] font-semibold text-muted-foreground uppercase font-mono block'>
              Safe Evacuation Corridor
            </span>
            <div className='text-xl sm:text-2xl font-bold font-mono text-emerald-400'>
              {delta.safe_ground_pct}%
            </div>
            <span className='text-[11px] text-muted-foreground block font-mono'>
              Dry stable elevation zones
            </span>
          </div>

          <div className='rounded-xl border border-[#FBBA72]/30 bg-[#FBBA72]/5 p-3 space-y-1'>
            <span className='text-[11px] font-semibold text-muted-foreground uppercase font-mono block'>
              Disaster Severity Index
            </span>
            <div className={cn(
              'text-xl sm:text-2xl font-bold font-mono',
              delta.severity === 'CRITICAL' ? 'text-rose-400' : delta.severity === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'
            )}>
              {delta.severity}
            </div>
            <span className='text-[11px] text-muted-foreground block font-mono'>
              Confidence: {delta.confidence}%
            </span>
          </div>
        </div>

        {/* Actionable NDRF Emergency Directive Banner */}
        <div className='rounded-xl border border-border/60 bg-muted/30 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs'>
          <div className='space-y-1'>
            <span className='font-bold text-[#FBBA72] flex items-center gap-1.5'>
              <AlertTriangle className='size-3.5 text-[#FBBA72]' />
              NDRF DISASTER MOBILIZATION DIRECTIVE
            </span>
            <p className='text-muted-foreground leading-relaxed text-[11px]'>
              {delta.ndrf_advisory}
            </p>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <Button
              size='sm'
              onClick={() => setSitrepModalOpen(true)}
              className='bg-rose-500 hover:bg-rose-600 text-white font-bold font-mono cursor-pointer text-xs flex items-center gap-1.5 shadow-sm'
            >
              <FileText className='size-3.5' />
              1-Click SITREP PDF
            </Button>
            <Button
              size='sm'
              onClick={onOpenInspector}
              className='bg-[#FBBA72] text-slate-950 font-bold hover:bg-[#FBBA72]/90 cursor-pointer text-xs'
            >
              Launch Detailed Inspector
            </Button>
          </div>
        </div>
      </CardContent>

      {/* NDRF Disaster SITREP Modal */}
      <NDRFDisasterSitrepModal
        open={sitrepModalOpen}
        onClose={() => setSitrepModalOpen(false)}
        query={query}
        candidate={{
          ...candidate,
          delta_damage: delta
        }}
        hazardType={hazardType}
      />
    </Card>
  )
}
