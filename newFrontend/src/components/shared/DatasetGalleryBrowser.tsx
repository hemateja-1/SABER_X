'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Layers,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Eye,
  CheckCircle2,
  Filter,
  Radio,
  ImageIcon,
  Loader2,
  Database
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRetrievalParams } from '@/contexts/retrieval-params-context'

export interface DatasetSampleItem {
  index: number
  name: string
  label_indices: number[]
  active_classes: string[]
  thumbnail: string
}

const BIGEARTHNET_CLASSES = [
  'Urban fabric',
  'Industrial or commercial units',
  'Arable land',
  'Permanent crops',
  'Pastures',
  'Complex cultivation patterns',
  'Land principally occupied by agriculture, with significant areas of natural vegetation',
  'Agro-forestry areas',
  'Broad-leaved forest',
  'Coniferous forest',
  'Mixed forest',
  'Natural grassland',
  'Moors and heathland',
  'Transitional woodland/shrub',
  'Beaches, dunes, sands',
  'Inland wetlands',
  'Salt marshes',
  'Water bodies',
  'Coastal wetlands'
]

export default function DatasetGalleryBrowser() {
  const { params, setParams } = useRetrievalParams()
  const [samples, setSamples] = useState<DatasetSampleItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(14832)
  const [limit] = useState<number>(12)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [galleryModality, setGalleryModality] = useState<'s2' | 's1'>('s2')
  const [jumpIndex, setJumpIndex] = useState<string>('')

  const fetchSamples = useCallback(async (p: number, mod: string, cls: string) => {
    setLoading(true)
    setError(null)
    try {
      let url = `/api/dataset/samples?dataset_name=${params.dataset}&modality=${mod}&page=${p}&limit=${limit}`
      if (cls !== 'all') {
        const clsIdx = BIGEARTHNET_CLASSES.indexOf(cls)
        if (clsIdx >= 0) {
          url += `&class_index=${clsIdx}`
        }
      }
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Failed to load dataset samples (HTTP ${res.status})`)
      }
      const data = await res.json()
      setSamples(data.items || [])
      setTotal(data.total || 14832)
    } catch (err: any) {
      console.error('Error fetching dataset samples:', err)
      setError(err.message || 'Unable to load dataset scenes.')
    } finally {
      setLoading(false)
    }
  }, [params.dataset, limit])

  useEffect(() => {
    fetchSamples(page, galleryModality, selectedClass)
  }, [fetchSamples, page, galleryModality, selectedClass])

  const totalPages = Math.ceil(total / limit) || 1

  const handleSelectQuery = (idx: number) => {
    setParams({ qIdx: idx })
    // Smooth scroll to the retrieval results section
    const el = document.getElementById('retrieval-results-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleRandomPage = () => {
    const maxP = Math.max(1, Math.min(totalPages, 200))
    const r = Math.floor(Math.random() * maxP) + 1
    setPage(r)
  }

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault()
    const targetIdx = parseInt(jumpIndex, 10)
    if (!isNaN(targetIdx) && targetIdx >= 0) {
      const targetPage = Math.floor(targetIdx / limit) + 1
      setPage(targetPage)
      setParams({ qIdx: targetIdx })
    }
  }

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden bg-background">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[#FBBA72]/10 border border-[#FBBA72]/30 flex items-center justify-center text-[#FBBA72]">
                <Database className="size-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-sans tracking-tight text-foreground flex items-center gap-2">
                Real Satellite Dataset Browser
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[11px] font-mono">
                  {total.toLocaleString()} Scenes Loaded
                </Badge>
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              Live inspection of real Sentinel-1 (SAR) and Sentinel-2 (Multispectral) scenes from your local dataset. Click any scene to run instant cross-sensor retrieval.
            </p>
          </div>

          {/* Modality Selector & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border/60 p-0.5 bg-muted/30">
              <button
                type="button"
                onClick={() => setGalleryModality('s2')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  galleryModality === 's2'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sentinel-2 Optical (RGB)
              </button>
              <button
                type="button"
                onClick={() => setGalleryModality('s1')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  galleryModality === 's1'
                    ? 'bg-[#FBBA72] text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sentinel-1 SAR (VV/VH)
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRandomPage}
              className="gap-1.5 text-xs font-medium border-border/60 h-8"
            >
              <RotateCw className="size-3.5" />
              Random Batch
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground font-medium shrink-0">Filter by Class:</span>
            <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val || 'all'); setPage(1) }}>
              <SelectTrigger className="h-8 border-border/60 bg-background/50 text-xs w-full sm:w-[220px]">
                <SelectValue placeholder="All Land Cover Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes ({total.toLocaleString()} scenes)</SelectItem>
                {BIGEARTHNET_CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleJump} className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-muted-foreground shrink-0 font-medium">Jump to Index:</span>
            <Input
              type="number"
              placeholder="e.g. 42"
              value={jumpIndex}
              onChange={(e) => setJumpIndex(e.target.value)}
              className="h-8 w-24 text-xs font-mono border-border/60"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs font-medium px-2.5">
              Go
            </Button>
          </form>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 py-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border/40 bg-muted/10 p-2 space-y-2 animate-pulse">
                <div className="w-full aspect-square rounded-md bg-muted/40" />
                <div className="h-3 w-3/4 rounded bg-muted/40" />
                <div className="h-2 w-1/2 rounded bg-muted/30" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8 text-rose-500 space-y-2">
            <p className="text-sm font-semibold">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchSamples(page, galleryModality, selectedClass)}>
              Retry Loading
            </Button>
          </div>
        )}

        {/* Scene Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {samples.map((item) => {
              const isCurrentQuery = params.qIdx === item.index
              return (
                <div
                  key={item.index}
                  onClick={() => handleSelectQuery(item.index)}
                  className={`group relative rounded-lg border p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                    isCurrentQuery
                      ? 'border-[#FBBA72] ring-2 ring-[#FBBA72]/40 bg-[#FBBA72]/5 shadow-md scale-[1.02]'
                      : 'border-border/60 hover:border-primary/50 bg-card hover:bg-accent/20'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square w-full rounded-md overflow-hidden bg-muted/20 mb-2">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <ImageIcon className="size-6" />
                      </div>
                    )}

                    {/* Top index badge */}
                    <span className="absolute top-1 left-1 bg-black/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                      #{item.index}
                    </span>

                    {/* Active query indicator */}
                    {isCurrentQuery && (
                      <span className="absolute top-1 right-1 bg-[#FBBA72] text-black font-sans text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="size-2.5" />
                        QUERY
                      </span>
                    )}
                  </div>

                  {/* Scene metadata */}
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-[10px] font-mono text-foreground font-semibold truncate" title={item.name}>
                      {item.name.replace('_paired.png', '').replace('.png', '')}
                    </p>

                    <div className="flex flex-wrap gap-1 min-h-[22px]">
                      {item.active_classes.slice(0, 2).map((cls, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1 py-0.2 rounded bg-muted/70 text-muted-foreground font-medium truncate max-w-full"
                          title={cls}
                        >
                          {cls}
                        </span>
                      ))}
                      {item.active_classes.length > 2 && (
                        <span className="text-[8px] text-muted-foreground/70 self-center">
                          +{item.active_classes.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    size="sm"
                    variant={isCurrentQuery ? 'default' : 'outline'}
                    className={`mt-2 w-full h-6 text-[10px] font-semibold gap-1 ${
                      isCurrentQuery
                        ? 'bg-[#FBBA72] hover:bg-[#FBBA72]/90 text-black border-none'
                        : 'border-border/60 hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {isCurrentQuery ? 'Active Scene' : 'Select Query'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
          <div className="font-sans">
            Showing scenes <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold text-foreground">{Math.min(page * limit, total)}</span> of{' '}
            <span className="font-semibold text-foreground">{total.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 gap-1 text-xs border-border/60"
            >
              <ChevronLeft className="size-3.5" /> Prev
            </Button>
            <span className="font-mono text-xs text-foreground px-2">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 gap-1 text-xs border-border/60"
            >
              Next <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
