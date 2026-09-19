export const Colors = {
  light: {
    text: '#0f172a',
    textSecondary: '#64748b',
    background: '#f1f5f9',
    card: '#ffffff',
    border: '#e2e8f0',
    tint: '#2563eb',
    tintSoft: '#dbeafe',
    danger: '#dc2626',
    success: '#16a34a',
    warning: '#d97706',
    chip: '#e2e8f0',
    input: '#ffffff',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
  dark: {
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    background: '#0b1220',
    card: '#111827',
    border: '#1f2937',
    tint: '#60a5fa',
    tintSoft: '#1e3a5f',
    danger: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    chip: '#1f2937',
    input: '#0f172a',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export type ThemeColors = typeof Colors.light;
