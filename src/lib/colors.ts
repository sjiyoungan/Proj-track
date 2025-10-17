// Color system for consistent theming across the application
export const colors = {
  // Primary colors
  primary: {
    blue: 'text-blue-600',
    blueBg: 'bg-blue-600',
    blueBorder: 'border-blue-600',
    blueOutline: 'outline-slate-200 dark:outline-slate-700',
  },
  
  // Container colors
  container: {
    blue: 'text-slate-400 dark:text-slate-500', // Empty state input field color
    blueBg: 'bg-slate-50 dark:bg-slate-900', // Even lighter badge fill color
    blueBorder: 'border-slate-600 dark:border-slate-400',
  },
  
  // Status colors
  status: {
    notStarted: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    inProgress: 'bg-[#CBE0FC] text-[#224777]',
    onHold: 'bg-[#F4DD90] text-[#4D462F]',
    blocked: 'bg-[#FFD1D2] text-[#732A33]',
    done: 'bg-[#cce2e2] text-[#0B4F51]',
    future: 'bg-[#DCDBDC] text-[#777680]',
  },
  
  // Plan colors
  plan: {
    prime: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    free: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    preAccount: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  
  // Interactive elements
  interactive: {
    hover: 'hover:bg-slate-50 dark:hover:bg-slate-800',
    outline: 'outline-slate-200 dark:outline-slate-700',
    border: 'border-slate-200 dark:border-slate-700',
  },
  
  // Text colors
  text: {
    primary: 'text-slate-900 dark:text-slate-100',
    secondary: 'text-slate-500 dark:text-slate-400',
    muted: 'text-slate-400 dark:text-slate-500',
  }
} as const;

// Helper function to get color classes
export const getColor = (category: keyof typeof colors, variant: string) => {
  return colors[category][variant as keyof typeof colors[typeof category]] || '';
};
