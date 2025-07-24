"use client"

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string }[]
  className?: string
  showValues?: boolean
}

export function SimpleBarChart({ data, className, showValues = true }: SimpleBarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data])
  
  return (
    <div className={cn("space-y-3", className)}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{item.label}</span>
            {showValues && <span className="text-muted-foreground">{item.value.toLocaleString()}</span>}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || '#f59e0b'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

interface SimplePieChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  className?: string
  onSegmentClick?: (label: string) => void
}

export function SimplePieChart({ 
  data, 
  size = 200, 
  className,
  onSegmentClick 
}: SimplePieChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data])
  
  const segments = useMemo(() => {
    let currentAngle = 0
    return data.map(item => {
      const percentage = item.value / total
      const angle = percentage * 360
      const segment = {
        ...item,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        pathData: createArcPath(size / 2, size / 2, size / 2 - 10, currentAngle, currentAngle + angle)
      }
      currentAngle += angle
      return segment
    })
  }, [data, total, size])
  
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-sm"
      >
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.pathData}
            fill={segment.color}
            stroke="white"
            strokeWidth="2"
            className={cn(
              "transition-all duration-200",
              onSegmentClick && "cursor-pointer hover:opacity-80"
            )}
            onClick={() => onSegmentClick?.(segment.label)}
          />
        ))}
      </svg>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-muted-foreground">
              {segment.label} ({Math.round(segment.percentage * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function createArcPath(
  cx: number, 
  cy: number, 
  radius: number, 
  startAngle: number, 
  endAngle: number
): string {
  const startAngleRad = (startAngle - 90) * (Math.PI / 180)
  const endAngleRad = (endAngle - 90) * (Math.PI / 180)
  
  const x1 = cx + radius * Math.cos(startAngleRad)
  const y1 = cy + radius * Math.sin(startAngleRad)
  const x2 = cx + radius * Math.cos(endAngleRad)
  const y2 = cy + radius * Math.sin(endAngleRad)
  
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  
  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    'Z'
  ].join(' ')
}

interface SimpleLineChartProps {
  data: { x: string; y: number }[]
  className?: string
  height?: number
  color?: string
}

export function SimpleLineChart({ 
  data, 
  className, 
  height = 200,
  color = '#f59e0b'
}: SimpleLineChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.y)), [data])
  const minValue = useMemo(() => Math.min(...data.map(d => d.y)), [data])
  const range = maxValue - minValue
  
  const points = useMemo(() => {
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = ((maxValue - point.y) / range) * 100
      return `${x},${y}`
    }).join(' ')
  }, [data, maxValue, range])
  
  return (
    <div className={cn("space-y-2", className)}>
      <svg 
        width="100%" 
        height={height} 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="border rounded"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          className="drop-shadow-sm"
        />
      </svg>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.x}</span>
        <span>{data[data.length - 1]?.x}</span>
      </div>
    </div>
  )
} 