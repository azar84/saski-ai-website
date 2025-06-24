import * as LucideIcons from 'lucide-react';
import React from 'react';

// Custom SVG Icon Components
const PhoneCustom = ({ className = "w-4 h-4", ...props }: { className?: string; [key: string]: any }) => (
  React.createElement('svg', {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...props
  }, [
    React.createElement('rect', {
      key: 'rect',
      x: "5",
      y: "2",
      width: "14",
      height: "20",
      rx: "2",
      ry: "2",
      fill: "currentColor",
      fillOpacity: "0.1",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('path', {
      key: 'path',
      d: "M9 18h6",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round"
    }),
    React.createElement('circle', {
      key: 'circle',
      cx: "12",
      cy: "6",
      r: "1",
      fill: "currentColor"
    })
  ])
);

const ChatCustom = ({ className = "w-4 h-4", ...props }: { className?: string; [key: string]: any }) => (
  React.createElement('svg', {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...props
  }, [
    React.createElement('path', {
      key: 'path1',
      d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
      fill: "currentColor",
      fillOpacity: "0.1",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('circle', {
      key: 'circle1',
      cx: "9",
      cy: "12",
      r: "1",
      fill: "currentColor"
    }),
    React.createElement('circle', {
      key: 'circle2',
      cx: "12",
      cy: "12",
      r: "1",
      fill: "currentColor"
    }),
    React.createElement('circle', {
      key: 'circle3',
      cx: "15",
      cy: "12",
      r: "1",
      fill: "currentColor"
    })
  ])
);

const NetworkCustom = ({ className = "w-4 h-4", ...props }: { className?: string; [key: string]: any }) => (
  React.createElement('svg', {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...props
  }, [
    React.createElement('circle', {
      key: 'circle1',
      cx: "12",
      cy: "6",
      r: "3",
      fill: "currentColor",
      fillOpacity: "0.2",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('circle', {
      key: 'circle2',
      cx: "6",
      cy: "18",
      r: "3",
      fill: "currentColor",
      fillOpacity: "0.2",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('circle', {
      key: 'circle3',
      cx: "18",
      cy: "18",
      r: "3",
      fill: "currentColor",
      fillOpacity: "0.2",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('path', {
      key: 'path1',
      d: "M12 9v3",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('path', {
      key: 'path2',
      d: "M9 15l3-3",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('path', {
      key: 'path3',
      d: "M15 15l-3-3",
      stroke: "currentColor",
      strokeWidth: "2"
    })
  ])
);

const ServerCustom = ({ className = "w-4 h-4", ...props }: { className?: string; [key: string]: any }) => (
  React.createElement('svg', {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...props
  }, [
    React.createElement('rect', {
      key: 'rect1',
      x: "4",
      y: "4",
      width: "16",
      height: "4",
      rx: "2",
      fill: "currentColor",
      fillOpacity: "0.2",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('rect', {
      key: 'rect2',
      x: "4",
      y: "10",
      width: "16",
      height: "4",
      rx: "2",
      fill: "currentColor",
      fillOpacity: "0.2",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('rect', {
      key: 'rect3',
      x: "4",
      y: "16",
      width: "16",
      height: "4",
      rx: "2",
      fill: "currentColor",
      fillOpacity: "0.2",
      stroke: "currentColor",
      strokeWidth: "2"
    }),
    React.createElement('circle', {
      key: 'circle1',
      cx: "7",
      cy: "6",
      r: "1",
      fill: "currentColor"
    }),
    React.createElement('circle', {
      key: 'circle2',
      cx: "7",
      cy: "12",
      r: "1",
      fill: "currentColor"
    }),
    React.createElement('circle', {
      key: 'circle3',
      cx: "7",
      cy: "18",
      r: "1",
      fill: "currentColor"
    }),
    React.createElement('path', {
      key: 'path1',
      d: "M10 6h7",
      stroke: "currentColor",
      strokeWidth: "1",
      strokeLinecap: "round"
    }),
    React.createElement('path', {
      key: 'path2',
      d: "M10 12h7",
      stroke: "currentColor",
      strokeWidth: "1",
      strokeLinecap: "round"
    }),
    React.createElement('path', {
      key: 'path3',
      d: "M10 18h7",
      stroke: "currentColor",
      strokeWidth: "1",
      strokeLinecap: "round"
    })
  ])
);

// Custom icons registry
const customIcons = {
  PhoneCustom,
  ChatCustom,
  NetworkCustom,
  ServerCustom
} as const;

// Centralized icon component getter
export const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return null;
  
  // Check custom icons first
  if (iconName in customIcons) {
    return (customIcons as any)[iconName];
  }
  
  // Fall back to Lucide icons
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || null;
};

export type IconName = keyof typeof LucideIcons | keyof typeof customIcons; 