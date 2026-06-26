const ICONS: Record<string, (color: string) => JSX.Element> = {
  '👋': (c) => <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill={c} stroke={c} strokeWidth={1.5}/>,
  '✅': (c) => <><circle cx="12" cy="12" r="9" fill={c} opacity=".18"/><path d="M8 12l3 3 5-6" fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></>,
  '🐢': (c) => <><ellipse cx="12" cy="14" rx="7" ry="5" fill={c} opacity=".22"/><circle cx="12" cy="13" r="4.5" fill={c} opacity=".35"/><circle cx="8" cy="10" r="2" fill={c}/><circle cx="7.2" cy="9.5" r=".7" fill="#fff"/></>,
  '🙋': (c) => <><circle cx="12" cy="7" r="3.5" fill={c}/><path d="M6 21v-2a6 6 0 0112 0v2" fill={c} opacity=".3"/><path d="M15 4l2-2" stroke={c} strokeWidth={2} strokeLinecap="round"/></>,
  '💬': (c) => <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill={c}/>,
  '☕': (c) => <><rect x="4" y="7" width="13" height="11" rx="2" fill={c} opacity=".25"/><path d="M17 9h1.5a2.5 2.5 0 010 5H17" stroke={c} strokeWidth={1.8} fill="none"/><path d="M7 4c0-1 1-2 2-1s1 2 2 1 1-2 2-1" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round"/><rect x="4" y="18" width="13" height="2" rx="1" fill={c} opacity=".4"/></>,
  '🍛': (c) => <><ellipse cx="12" cy="15" rx="9" ry="5" fill={c} opacity=".2"/><path d="M3 15c0-4 4-10 9-10s9 6 9 10" fill="none" stroke={c} strokeWidth={1.8}/><circle cx="9" cy="13" r="1.2" fill={c}/><circle cx="14" cy="12" r="1" fill={c}/><circle cx="12" cy="15" r=".8" fill={c}/></>,
  '😋': (c) => <><circle cx="12" cy="12" r="9" fill={c} opacity=".18"/><circle cx="9" cy="10" r="1.2" fill={c}/><circle cx="15" cy="10" r="1.2" fill={c}/><path d="M8 14c1.5 2.5 6.5 2.5 8 0" stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round"/></>,
  '🧭': (c) => <><circle cx="12" cy="12" r="9" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><polygon points="12,4 14,11 12,12 10,11" fill={c}/><polygon points="12,20 10,13 12,12 14,13" fill={c} opacity=".4"/></>,
  '🛺': (c) => <><rect x="3" y="10" width="14" height="8" rx="2" fill={c} opacity=".25"/><circle cx="7" cy="19" r="2" fill={c}/><circle cx="15" cy="19" r="2" fill={c}/><path d="M14 10l4-4h3v6a2 2 0 01-2 2h-1" stroke={c} strokeWidth={1.5} fill={c} opacity=".35"/><rect x="5" y="12" width="4" height="3" rx="1" fill={c} opacity=".5"/></>,
  '🔢': (c) => <><rect x="3" y="3" width="18" height="18" rx="3" fill={c} opacity=".15"/><text x="7" y="11" fontSize="7" fontWeight="bold" fill={c} fontFamily="system-ui">1</text><text x="14" y="11" fontSize="7" fontWeight="bold" fill={c} fontFamily="system-ui">2</text><text x="7" y="19" fontSize="7" fontWeight="bold" fill={c} fontFamily="system-ui">3</text><text x="14" y="19" fontSize="7" fontWeight="bold" fill={c} fontFamily="system-ui">4</text></>,
  '💰': (c) => <><circle cx="12" cy="12" r="9" fill={c} opacity=".18"/><text x="12" y="16" fontSize="12" fontWeight="bold" fill={c} fontFamily="system-ui" textAnchor="middle">₹</text></>,
  '👨‍👩‍👧': (c) => <><circle cx="8" cy="6" r="2.5" fill={c}/><circle cx="16" cy="6" r="2.5" fill={c} opacity=".6"/><circle cx="12" cy="9" r="2" fill={c} opacity=".4"/><path d="M3 20v-1a5 5 0 015-5h8a5 5 0 015 5v1" fill={c} opacity=".2"/></>,
  '⏰': (c) => <><circle cx="12" cy="13" r="8" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><path d="M12 8v5l3 3" stroke={c} strokeWidth={2} strokeLinecap="round"/><path d="M8 3l-2-1M16 3l2-1" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></>,
  '🌅': (c) => <><path d="M2 16h20" stroke={c} strokeWidth={1.5}/><path d="M4 16a8 8 0 0116 0" fill={c} opacity=".2"/><circle cx="12" cy="12" r="3" fill={c}/><path d="M12 6v-2M6 12H4M20 12h-2M7.05 7.05L5.64 5.64M16.95 7.05l1.41-1.41" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></>,
  '💚': (c) => <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={c}/>,
  '💊': (c) => <><rect x="4" y="9" width="16" height="6" rx="3" fill={c} opacity=".3" transform="rotate(-45 12 12)"/><rect x="4" y="9" width="8" height="6" rx="3" fill={c} transform="rotate(-45 12 12)"/></>,
  '📅': (c) => <><rect x="3" y="4" width="18" height="18" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><path d="M3 9h18" stroke={c} strokeWidth={1.5}/><path d="M8 2v4M16 2v4" stroke={c} strokeWidth={1.5} strokeLinecap="round"/><circle cx="12" cy="15" r="1.5" fill={c}/></>,
  '🚨': (c) => <><path d="M12 3l9 15H3z" fill={c} opacity=".2"/><path d="M12 3l9 15H3z" fill="none" stroke={c} strokeWidth={1.5} strokeLinejoin="round"/><path d="M12 10v3" stroke={c} strokeWidth={2} strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill={c}/></>,
  '🤝': (c) => <><path d="M7 12l3-3 2 1 2-1 3 3" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M2 14h3l2-2M22 14h-3l-2-2" stroke={c} strokeWidth={1.5} strokeLinecap="round" fill="none"/><path d="M10 16l-2 3M14 16l2 3" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></>,
  '🛍️': (c) => <><rect x="4" y="8" width="16" height="13" rx="2" fill={c} opacity=".2" stroke={c} strokeWidth={1.5}/><path d="M8 8V6a4 4 0 018 0v2" stroke={c} strokeWidth={1.5} fill="none"/></>,
  '🏡': (c) => <><path d="M3 11l9-7 9 7" fill={c} opacity=".2" stroke={c} strokeWidth={1.5} strokeLinejoin="round"/><rect x="5" y="12" width="14" height="9" fill={c} opacity=".15"/><rect x="9" y="15" width="6" height="6" rx="1" fill={c} opacity=".4"/></>,
  '⛅': (c) => <><circle cx="10" cy="14" r="4" fill={c} opacity=".3"/><circle cx="14" cy="12" r="5" fill={c} opacity=".25"/><circle cx="8" cy="12" r="3" fill={c} opacity=".25"/><circle cx="18" cy="8" r="3" fill={c}/><path d="M16 5l2-2M20 6l2-1M19 10h2" stroke={c} strokeWidth={1.2} strokeLinecap="round"/></>,
  '📱': (c) => <><rect x="6" y="2" width="12" height="20" rx="2.5" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><rect x="8" y="5" width="8" height="11" rx="1" fill={c} opacity=".2"/><circle cx="12" cy="19" r="1" fill={c}/></>,
  '💼': (c) => <><rect x="3" y="8" width="18" height="12" rx="2" fill={c} opacity=".2" stroke={c} strokeWidth={1.5}/><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke={c} strokeWidth={1.5} fill="none"/><path d="M3 13h18" stroke={c} strokeWidth={1.2}/></>,
  '🏠': (c) => <><path d="M3 12l9-8 9 8" stroke={c} strokeWidth={1.8} fill={c} opacity=".15" strokeLinejoin="round"/><rect x="5" y="12" width="14" height="9" fill={c} opacity=".2"/><rect x="10" y="15" width="4" height="6" rx=".5" fill={c} opacity=".5"/></>,
  '🚆': (c) => <><rect x="4" y="5" width="16" height="13" rx="3" fill={c} opacity=".2" stroke={c} strokeWidth={1.5}/><rect x="7" y="8" width="4" height="4" rx="1" fill={c} opacity=".4"/><rect x="13" y="8" width="4" height="4" rx="1" fill={c} opacity=".4"/><circle cx="8" cy="20" r="1.2" fill={c}/><circle cx="16" cy="20" r="1.2" fill={c}/><path d="M12 2v3" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></>,
  '💭': (c) => <><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill={c} opacity=".2" stroke={c} strokeWidth={1.2}/><circle cx="10" cy="12" r="1" fill={c}/><circle cx="14" cy="12" r="1" fill={c}/><circle cx="18" cy="12" r="1" fill={c}/></>,
  '🎬': (c) => <><rect x="3" y="5" width="18" height="14" rx="2" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><path d="M3 9h18M7 5v4M11 5v4M15 5v4M19 5v4" stroke={c} strokeWidth={1.2}/><polygon points="10,12 10,17 15,14.5" fill={c}/></>,
  '⏳': (c) => <><path d="M6 2h12M6 22h12" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><path d="M7 2c0 5 5 5 5 10S7 17 7 22M17 2c0 5-5 5-5 10s5 5 5 10" stroke={c} strokeWidth={1.5} fill={c} opacity=".15"/><circle cx="12" cy="17" r="2" fill={c} opacity=".4"/></>,
  '🏢': (c) => <><rect x="4" y="4" width="16" height="18" rx="1.5" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><rect x="7" y="7" width="3" height="3" rx=".5" fill={c} opacity=".4"/><rect x="14" y="7" width="3" height="3" rx=".5" fill={c} opacity=".4"/><rect x="7" y="13" width="3" height="3" rx=".5" fill={c} opacity=".4"/><rect x="14" y="13" width="3" height="3" rx=".5" fill={c} opacity=".4"/><rect x="10" y="18" width="4" height="4" fill={c} opacity=".3"/></>,
  '⏱️': (c) => <><circle cx="12" cy="13" r="8" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><path d="M12 9v4l2.5 2.5" stroke={c} strokeWidth={2} strokeLinecap="round"/><path d="M10 2h4" stroke={c} strokeWidth={2} strokeLinecap="round"/><path d="M18 5l1.5-1.5" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></>,
  '🧹': (c) => <><path d="M12 3v10" stroke={c} strokeWidth={2} strokeLinecap="round"/><path d="M8 13c0 0-2 8 4 8s4-8 4-8" fill={c} opacity=".25" stroke={c} strokeWidth={1.5}/><path d="M9 16h6M10 19h4" stroke={c} strokeWidth={1} opacity=".5"/></>,
  '🔧': (c) => <><path d="M14.7 6.3a6 6 0 00-8.5 8.5l1.4-1.4a4 4 0 015.7-5.7z" fill={c} opacity=".3"/><path d="M6.3 14.7l-3.5 3.5a2 2 0 002.8 2.8l3.5-3.5" stroke={c} strokeWidth={1.5} fill={c} opacity=".4"/><path d="M14.7 6.3L20 3l-3 3.3" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></>,
  '🚌': (c) => <><rect x="2" y="7" width="20" height="11" rx="3" fill={c} opacity=".2" stroke={c} strokeWidth={1.5}/><rect x="4" y="9" width="5" height="4" rx="1" fill={c} opacity=".4"/><rect x="11" y="9" width="5" height="4" rx="1" fill={c} opacity=".4"/><circle cx="7" cy="20" r="1.5" fill={c}/><circle cx="17" cy="20" r="1.5" fill={c}/></>,
  '🤔': (c) => <><circle cx="12" cy="12" r="9" fill={c} opacity=".15"/><circle cx="9" cy="10" r="1.2" fill={c}/><circle cx="15" cy="10" r="1.2" fill={c}/><path d="M9 15.5c1 1 5 1 6 0" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round"/><path d="M17 7c1-2 3-1 2 1" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round"/></>,
  '⚖️': (c) => <><path d="M12 3v16" stroke={c} strokeWidth={2}/><path d="M5 7h14" stroke={c} strokeWidth={2} strokeLinecap="round"/><path d="M3 12l2-5 2 5a3 3 0 01-4 0zM17 12l2-5 2 5a3 3 0 01-4 0z" fill={c} opacity=".3" stroke={c} strokeWidth={1.2}/><rect x="9" y="19" width="6" height="2" rx="1" fill={c} opacity=".4"/></>,
  '🎵': (c) => <><circle cx="7" cy="18" r="3" fill={c} opacity=".3"/><circle cx="17" cy="16" r="3" fill={c} opacity=".3"/><path d="M10 18V6l10-3v13" stroke={c} strokeWidth={2} fill="none"/><path d="M10 10l10-3" stroke={c} strokeWidth={1.5}/></>,
  '⚽': (c) => <><circle cx="12" cy="12" r="9" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><path d="M12 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill={c} opacity=".25"/></>,
  '🕐': (c) => <><circle cx="12" cy="12" r="9" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><path d="M12 6v6l-4 2" stroke={c} strokeWidth={2} strokeLinecap="round"/><path d="M17 4l1.5-1.5" stroke={c} strokeWidth={1.2} strokeLinecap="round"/></>,
  '🔮': (c) => <><circle cx="12" cy="11" r="7" fill={c} opacity=".15" stroke={c} strokeWidth={1.5}/><path d="M8 18h8l1 3H7z" fill={c} opacity=".3"/><path d="M9 9c2-2 5-1 5 2" stroke={c} strokeWidth={1.2} fill="none" strokeLinecap="round"/></>,
  '🔄': (c) => <><path d="M3 12a9 9 0 0115-6.7" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round"/><path d="M21 12a9 9 0 01-15 6.7" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round"/><path d="M15 3l3 2.3-3 2.3" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21l-3-2.3 3-2.3" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
};

const BADGE_ICONS: Record<string, (c: string) => JSX.Element> = {
  '🌱': (c) => <><path d="M12 22V12" stroke={c} strokeWidth={2}/><path d="M7 12c0-4 5-8 5-8s5 4 5 8" fill={c} opacity=".3" stroke={c} strokeWidth={1.5}/><path d="M9 15c1-1 2-1 3 0s2 1 3 0" stroke={c} strokeWidth={1.2} fill="none"/></>,
  '🔥': (c) => <path d="M12 2c-1 4-4 6-6 10a7 7 0 1014 0C18 8 15 6 12 2z" fill={c}/>,
  '⚡': (c) => <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill={c}/>,
  '💬': (c) => <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill={c}/>,
  '💯': (c) => <><text x="12" y="16" fontSize="13" fontWeight="900" fill={c} fontFamily="system-ui" textAnchor="middle">100</text></>,
  '🚀': (c) => <><path d="M12 2c-2 4-3 8-3 12h6c0-4-1-8-3-12z" fill={c} opacity=".3" stroke={c} strokeWidth={1.5}/><circle cx="12" cy="10" r="1.5" fill={c}/><path d="M9 14l-2 3M15 14l2 3" stroke={c} strokeWidth={1.5} strokeLinecap="round"/><path d="M10 18h4" stroke={c} strokeWidth={2} strokeLinecap="round"/></>,
  '🏆': (c) => <><path d="M6 4h12v5a6 6 0 01-12 0z" fill={c} opacity=".3" stroke={c} strokeWidth={1.5}/><path d="M6 7H3c0 3 2 4 3 4M18 7h3c0 3-2 4-3 4" stroke={c} strokeWidth={1.5} fill="none"/><rect x="9" y="15" width="6" height="2" rx="1" fill={c}/><rect x="8" y="17" width="8" height="2" rx="1" fill={c} opacity=".4"/></>,
};

interface Props {
  emoji: string;
  size?: number;
  color?: string;
  className?: string;
}

export function TopicIcon({ emoji, size = 24, color = 'var(--color-primary)', className }: Props) {
  const iconFn = ICONS[emoji];
  if (!iconFn) {
    return <span className={className} style={{ fontSize: size * 0.85, lineHeight: 1 }}>{emoji}</span>;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {iconFn(color)}
    </svg>
  );
}

export function BadgeIcon({ emoji, size = 24, color = 'var(--color-secondary)' }: { emoji: string; size?: number; color?: string }) {
  const iconFn = BADGE_ICONS[emoji] ?? ICONS[emoji];
  if (!iconFn) {
    return <span style={{ fontSize: size * 0.85, lineHeight: 1 }}>{emoji}</span>;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {iconFn(color)}
    </svg>
  );
}
