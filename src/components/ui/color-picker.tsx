'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ColorPickerProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export const ColorPicker = React.forwardRef<
  HTMLDivElement,
  ColorPickerProps
>(({ value = '#000000', onChange, className, ...props }, ref) => {
  const [hue, setHue] = React.useState(0);
  const [saturation, setSaturation] = React.useState(100);
  const [lightness, setLightness] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  };

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Initialize from value
  React.useEffect(() => {
    const [h, s, l] = hexToHsl(value);
    setHue(h);
    setSaturation(s);
    setLightness(l);
  }, [value]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    const newSaturation = x * 100;
    const newLightness = (1 - y) * 100;
    
    setSaturation(newSaturation);
    setLightness(newLightness);
    
    if (onChange) {
      onChange(hslToHex(hue, newSaturation, newLightness));
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      const handleMouseUp = () => setIsDragging(false);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={ref}
      className={cn("w-fit h-fit rounded-md border shadow-sm", className)}
      {...props}
    >
      <div
        ref={containerRef}
        className="relative w-[200px] h-[200px] cursor-crosshair rounded overflow-hidden"
        style={{
          background: `linear-gradient(to right, white, hsl(${hue}, 100%, 50%)), linear-gradient(to top, black, transparent)`
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Smaller draggable circle */}
        <div
          className="absolute w-2 h-2 bg-white border border-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
          style={{
            left: `${saturation}%`,
            top: `${100 - lightness}%`,
          }}
        />
      </div>
    </div>
  );
});
ColorPicker.displayName = "ColorPicker";

export const ColorPickerSelection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full h-32 rounded border", className)}
    {...props}
  />
));
ColorPickerSelection.displayName = "ColorPickerSelection";

export const ColorPickerHue = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-24 h-2 rounded", className)}
    {...props}
  />
));
ColorPickerHue.displayName = "ColorPickerHue";

export const ColorPickerFormat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
));
ColorPickerFormat.displayName = "ColorPickerFormat";

export const ColorPickerHex = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    value?: string;
    onChange?: (value: string) => void;
  }
>(({ value = '#000000', onChange, className, ...props }, ref) => (
  <input
    ref={ref}
    type="text"
    value={value}
    onChange={(e) => {
      const hex = e.target.value;
      if (/^#[0-9A-Fa-f]{0,6}$/.test(hex) && onChange) {
        onChange(hex);
      }
    }}
    className={cn(
      "w-20 h-6 px-2 text-xs border border-slate-200 dark:border-slate-700 rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase",
      className
    )}
    {...props}
  />
));
ColorPickerHex.displayName = "ColorPickerHex";

