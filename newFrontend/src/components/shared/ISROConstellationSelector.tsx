'use client'

import React from 'react'
import {
  Satellite,
  Radio,
  Zap,
  ShieldCheck,
  Layers,
  Sparkles,
  Waves,
  Eye,
  CheckCircle2,
  Globe
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRetrievalParams } from '@/contexts/retrieval-params-context'

export interface ConstellationInfo {
  id: string
  name: string
  shortName: string
  agency: string
  band: string
  frequency: string
  wavelength: string
  wavelengthList: number[]
  resolution: string
  penetration: string
  cloudPiercing: string
  mission: string
  isSovereign: boolean
  dataset: string
  srcMod: string
  tgtMod: string
  groundStation: string
}

export const CONSTELLATION_REGISTRY: ConstellationInfo[] = [
  {
    id: 'isro_eos04',
    name: 'ISRO EOS-04 / RISAT-1A',
    shortName: 'RISAT-1A',
    agency: 'ISRO (India)',
    band: 'C-band SAR',
    frequency: '5.35 GHz',
    wavelength: '5.35 cm',
    wavelengthList: [5.35, 5.35],
    resolution: '3.0m - 1.0m Spotlight',
    penetration: 'Medium Canopy (10-15cm)',
    cloudPiercing: '100% All-Weather Cloud Piercing',
    mission: 'Assam/Bihar Monsoon Flood Mapping',
    isSovereign: true,
    dataset: 'ben14k',
    srcMod: 's1',
    tgtMod: 's2',
    groundStation: 'NRSC Shadnagar (Hyderabad)'
  },
  {
    id: 'isro_nisar',
    name: 'ISRO-NASA NISAR',
    shortName: 'NISAR L+S',
    agency: 'ISRO / NASA Joint',
    band: 'Dual L+S Band SAR',
    frequency: '1.25 / 3.20 GHz',
    wavelength: '24.0 / 9.3 cm',
    wavelengthList: [24.0, 9.3],
    resolution: '3.0m - 10.0m SweepSAR',
    penetration: 'Deep Foliage & 1.5m Soil Subsurface',
    cloudPiercing: '100% Day/Night Atmospheric Penetration',
    mission: 'Wayanad Landslides & Glacial Monitoring',
    isSovereign: true,
    dataset: 'ben14k',
    srcMod: 's1',
    tgtMod: 's2',
    groundStation: 'NRSC Shadnagar / NASA DSN'
  },
  {
    id: 'isro_resourcesat',
    name: 'ISRO Resourcesat-2A (LISS-IV)',
    shortName: 'Resourcesat-2A',
    agency: 'ISRO NRSC',
    band: 'VNIR Multispectral',
    frequency: '0.555 - 0.815 µm',
    wavelength: '0.65 µm VNIR',
    wavelengthList: [0.555, 0.650, 0.815, 1.625],
    resolution: '5.8m High-Res Optical',
    penetration: 'Surface Optical Reflectance',
    cloudPiercing: 'Cloud-Sensitive (Requires SABER CFM Bridge)',
    mission: 'Agricultural Damage & Bhuvan Cadastral',
    isSovereign: true,
    dataset: 'dsrsid',
    srcMod: 'ms',
    tgtMod: 'pan',
    groundStation: 'NRSC Shadnagar (Hyderabad)'
  },
  {
    id: 'isro_cartosat',
    name: 'ISRO Cartosat-3',
    shortName: 'Cartosat-3',
    agency: 'ISRO National Space Agency',
    band: 'High-Res PAN',
    frequency: '0.650 µm PAN',
    wavelength: '0.65 µm Visible',
    wavelengthList: [0.650],
    resolution: '0.28m Sub-Meter Tactical',
    penetration: 'Surface Infrastructure Level',
    cloudPiercing: 'Requires SAR Cross-Sensor Ingestion',
    mission: 'Tactical Urban Habitat Reconnaissance',
    isSovereign: true,
    dataset: 'dsrsid',
    srcMod: 'pan',
    tgtMod: 'ms',
    groundStation: 'NRSC Shadnagar / Antarctica Bharati'
  },
  {
    id: 'sentinel1',
    name: 'Sentinel-1A/B (ESA)',
    shortName: 'Sentinel-1 SAR',
    agency: 'ESA Copernicus',
    band: 'C-band SAR',
    frequency: '5.405 GHz',
    wavelength: '5.405 cm',
    wavelengthList: [5.405, 5.405],
    resolution: '10.0m GSD (BEN-14K Standard)',
    penetration: 'Standard Surface Roughness',
    cloudPiercing: '100% Microwave Penetration',
    mission: 'Global Cross-Modal Baseline Benchmark',
    isSovereign: false,
    dataset: 'ben14k',
    srcMod: 's1',
    tgtMod: 's2',
    groundStation: 'Kiruna / Svalbard Station'
  },
  {
    id: 'sentinel2',
    name: 'Sentinel-2A/B (ESA)',
    shortName: 'Sentinel-2 MSI',
    agency: 'ESA Copernicus',
    band: '12-Band Multispectral',
    frequency: '0.443 - 2.190 µm',
    wavelength: '12-Band Optical',
    wavelengthList: [0.443, 0.490, 0.560, 0.665, 0.705, 0.740, 0.783, 0.842, 0.865, 0.945, 1.610, 2.190],
    resolution: '10m - 20m GSD',
    penetration: 'Surface Land Cover',
    cloudPiercing: 'Cloud-Blind (Requires Radar Retrieval)',
    mission: 'Pre-Disaster Historical Reference Target',
    isSovereign: false,
    dataset: 'ben14k',
    srcMod: 's2',
    tgtMod: 's1',
    groundStation: 'Kiruna / Matera Station'
  }
]

export default function ISROConstellationSelector() {
  const { params, setParams } = useRetrievalParams()
  const currentId = params.constellation || 'isro_eos04'
  const active = CONSTELLATION_REGISTRY.find(c => c.id === currentId) || CONSTELLATION_REGISTRY[0]

  const handleSelect = (constellation: ConstellationInfo) => {
    setParams({
      constellation: constellation.id,
      dataset: constellation.dataset,
      srcMod: constellation.srcMod,
      tgtMod: constellation.tgtMod,
    })
  }

  return (
    <Card className='border border-sky-500/30 bg-card/90 shadow-md overflow-hidden font-sans'>
      {/* Header Bar */}
      <CardContent className='p-3.5 sm:p-4 border-b border-border/40 bg-muted/20 flex flex-wrap items-center justify-between gap-2.5'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge className='bg-[#FBBA72]/20 text-[#FBBA72] border-[#FBBA72]/40 text-xs font-mono font-bold flex items-center gap-1'>
            <Sparkles className='size-3' /> FEATURE 2 CORE INTEGRATION
          </Badge>
          <span className='text-xs font-bold uppercase tracking-wider text-foreground font-sans flex items-center gap-1.5'>
            <Satellite className='size-4 text-[#FBBA72]' />
            ISRO Sovereign Constellation & Wavelength Hypernetwork Selector
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <Badge variant='outline' className='border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[11px] font-mono'>
            🇮🇳 4 ISRO Satellites Active
          </Badge>
          <Badge variant='outline' className='border-sky-500/40 text-sky-400 bg-sky-500/10 text-[11px] font-mono'>
            Continuous λ Embedding
          </Badge>
        </div>
      </CardContent>

      <CardContent className='p-3.5 sm:p-4 space-y-3.5'>
        {/* Constellation Selector Buttons (Grid of 6) */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2'>
          {CONSTELLATION_REGISTRY.map((sat) => {
            const isSelected = sat.id === currentId
            return (
              <button
                key={sat.id}
                onClick={() => handleSelect(sat)}
                className={cn(
                  'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer font-sans relative overflow-hidden',
                  isSelected
                    ? 'border-[#FBBA72] bg-[#FBBA72]/15 shadow-sm ring-1 ring-[#FBBA72]/50'
                    : 'border-border/60 bg-muted/15 hover:border-border hover:bg-muted/30'
                )}
              >
                {sat.isSovereign && (
                  <span className='absolute top-1.5 right-1.5 text-xs' title='Sovereign Indian Space Asset'>
                    🇮🇳
                  </span>
                )}
                {!sat.isSovereign && (
                  <span className='absolute top-1.5 right-1.5 text-xs' title='ESA Copernicus International Partner'>
                    🇪🇺
                  </span>
                )}
                <span className={cn('text-xs font-bold truncate max-w-[85%]', isSelected ? 'text-[#FBBA72]' : 'text-foreground')}>
                  {sat.shortName}
                </span>
                <span className='text-[10px] text-muted-foreground font-mono truncate w-full mt-0.5'>
                  {sat.band}
                </span>
                <span className='text-[10px] font-mono text-cyan-400 font-semibold mt-1'>
                  {sat.frequency}
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected Constellation Physical & Orbital Telemetry Card */}
        <div className='rounded-xl border border-border/60 bg-muted/30 p-3 sm:p-3.5 space-y-2.5'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2 text-xs'>
            <div className='flex items-center gap-2'>
              <Radio className='size-3.5 text-[#FBBA72] animate-pulse' />
              <span className='font-bold text-foreground font-mono'>
                ACTIVE SENSOR PROFILE: {active.name}
              </span>
              <Badge
                className={cn(
                  'text-[10px] font-mono font-bold px-1.5 py-0',
                  active.isSovereign
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                )}
              >
                {active.isSovereign ? '🇮🇳 ISRO SOVEREIGN' : '🇪🇺 ESA PARTNER'}
              </Badge>
            </div>
            <span className='text-[11px] font-mono text-muted-foreground'>
              Ground Station: <strong className='text-foreground'>{active.groundStation}</strong>
            </span>
          </div>

          {/* Technical Telemetry 4-Column Grid */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono'>
            <div className='bg-background/60 p-2 rounded-lg border border-border/40'>
              <span className='text-[10px] text-muted-foreground uppercase block'>Carrier λ / Frequency</span>
              <span className='text-xs font-bold text-[#FBBA72] truncate block'>{active.frequency}</span>
              <span className='text-[10px] text-muted-foreground block'>λ = {active.wavelength}</span>
            </div>

            <div className='bg-background/60 p-2 rounded-lg border border-border/40'>
              <span className='text-[10px] text-muted-foreground uppercase block'>Spatial Resolution</span>
              <span className='text-xs font-bold text-foreground truncate block'>{active.resolution}</span>
              <span className='text-[10px] text-muted-foreground block'>GSD standard</span>
            </div>

            <div className='bg-background/60 p-2 rounded-lg border border-border/40'>
              <span className='text-[10px] text-muted-foreground uppercase block'>Soil / Canopy Penetration</span>
              <span className='text-xs font-bold text-emerald-400 truncate block'>{active.penetration}</span>
              <span className='text-[10px] text-muted-foreground block'>Dielectric constant ε</span>
            </div>

            <div className='bg-background/60 p-2 rounded-lg border border-border/40'>
              <span className='text-[10px] text-muted-foreground uppercase block'>Atmosphere / Clouds</span>
              <span className='text-xs font-bold text-cyan-400 truncate block'>{active.cloudPiercing}</span>
              <span className='text-[10px] text-muted-foreground block'>All-weather ready</span>
            </div>
          </div>

          {/* Operational Mission Mandate */}
          <div className='text-[11px] font-mono text-muted-foreground bg-black/40 p-2 rounded-md border border-border/30 flex items-center justify-between gap-2 flex-wrap'>
            <div className='flex items-center gap-1.5'>
              <span className='text-[#FBBA72] font-bold'>TARGET DISASTER CORRIDOR:</span>
              <span>{active.mission}</span>
            </div>
            <div className='text-[10px] text-muted-foreground'>
              DOFA ViT Wavelength Conditioning: <code className='text-emerald-400 font-bold'>[{active.wavelengthList.join(', ')}]</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
