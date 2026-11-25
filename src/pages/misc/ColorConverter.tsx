import { useState, useEffect } from 'react'
import { ToolPage } from '../../components/ToolPage'
import { CopyButton } from '../../components/CopyButton'
import { Palette } from 'lucide-react'

// Convert Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  if (hex.length !== 6) return null
  const num = parseInt(hex, 16)
  if (isNaN(num)) return null
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

// RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

// RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100

  let r = l
  let g = l
  let b = l

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

export default function ColorConverter() {
  const [hex, setHex] = useState('#3B82F6')
  const [r, setR] = useState(59)
  const [g, setG] = useState(130)
  const [b, setB] = useState(246)
  const [alpha, setAlpha] = useState(1)
  const [h, setH] = useState(217)
  const [s, setS] = useState(91)
  const [l, setL] = useState(60)

  // From HEX change
  const handleHexChange = (val: string) => {
    setHex(val)
    const rgb = hexToRgb(val)
    if (rgb) {
      setR(rgb.r)
      setG(rgb.g)
      setB(rgb.b)
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setH(hsl.h)
      setS(hsl.s)
      setL(hsl.l)
    }
  }

  // From RGB change
  const handleRgbChange = (newR: number, newG: number, newB: number) => {
    setR(newR)
    setG(newG)
    setB(newB)
    const newHex = rgbToHex(newR, newG, newB)
    setHex(newHex)
    const hsl = rgbToHsl(newR, newG, newB)
    setH(hsl.h)
    setS(hsl.s)
    setL(hsl.l)
  }

  // From HSL change
  const handleHslChange = (newH: number, newS: number, newL: number) => {
    setH(newH)
    setS(newS)
    setL(newL)
    const rgb = hslToRgb(newH, newS, newL)
    setR(rgb.r)
    setG(rgb.g)
    setB(rgb.b)
    setHex(rgbToHex(rgb.r, rgb.g, rgb.b))
  }

  const rgbStr = `rgb(${r}, ${g}, ${b})`
  const rgbaStr = `rgba(${r}, ${g}, ${b}, ${alpha})`
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`
  const hslaStr = `hsla(${h}, ${s}%, ${l}%, ${alpha})`

  const presets = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B',
  ]

  return (
    <ToolPage title="颜色转换器" description="HEX、RGB、RGBA、HSL、HSLA 互相转换与在线取色器">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Color Preview & Native Picker */}
        <div className="card p-5 flex flex-col items-center justify-center gap-4">
          <div
            className="w-full h-44 rounded-xl shadow-inner border transition-colors flex items-end justify-end p-3 relative overflow-hidden"
            style={{ backgroundColor: rgbaStr }}
          >
            <div className="bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded text-xs font-mono">
              {rgbaStr}
            </div>
          </div>

          <div className="w-full flex items-center gap-3">
            <input
              type="color"
              value={hex.startsWith('#') && hex.length === 7 ? hex : '#3B82F6'}
              onChange={e => handleHexChange(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border p-0.5 bg-transparent"
            />
            <div className="flex-1 text-sm font-medium">点击左侧选择任意颜色</div>
          </div>

          {/* Quick presets */}
          <div className="w-full">
            <div className="text-xs text-gray-500 mb-2">常用预设色板:</div>
            <div className="flex flex-wrap gap-2">
              {presets.map(color => (
                <button
                  key={color}
                  onClick={() => handleHexChange(color)}
                  className="w-7 h-7 rounded-md border shadow-sm transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Input & Formats */}
        <div className="card p-5 lg:col-span-2 flex flex-col gap-5">
          {/* HEX Input */}
          <div>
            <label className="label">HEX 颜色代码</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hex}
                onChange={e => handleHexChange(e.target.value)}
                placeholder="#3B82F6"
                className="input-field font-mono"
              />
              <CopyButton text={hex} />
            </div>
          </div>

          {/* RGB Inputs */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">RGB (0 - 255)</label>
              <CopyButton text={rgbStr} label="复制 RGB" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-gray-400">R:</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={r}
                  onChange={e => handleRgbChange(Number(e.target.value), g, b)}
                  className="input-field font-mono text-center"
                />
              </div>
              <div>
                <span className="text-xs text-gray-400">G:</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={g}
                  onChange={e => handleRgbChange(r, Number(e.target.value), b)}
                  className="input-field font-mono text-center"
                />
              </div>
              <div>
                <span className="text-xs text-gray-400">B:</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={b}
                  onChange={e => handleRgbChange(r, g, Number(e.target.value))}
                  className="input-field font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* HSL Inputs */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">HSL</label>
              <CopyButton text={hslStr} label="复制 HSL" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-gray-400">H (0-360°):</span>
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={h}
                  onChange={e => handleHslChange(Number(e.target.value), s, l)}
                  className="input-field font-mono text-center"
                />
              </div>
              <div>
                <span className="text-xs text-gray-400">S (0-100%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={s}
                  onChange={e => handleHslChange(h, Number(e.target.value), l)}
                  className="input-field font-mono text-center"
                />
              </div>
              <div>
                <span className="text-xs text-gray-400">L (0-100%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={l}
                  onChange={e => handleHslChange(h, s, Number(e.target.value))}
                  className="input-field font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Alpha Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">透明度 (Alpha: {alpha})</label>
              <CopyButton text={rgbaStr} label="复制 RGBA" />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={alpha}
              onChange={e => setAlpha(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

