import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '../storage/store';
import { dueCount } from '../srs/queue';

const NAV = [
  { to: '/', label: 'Home', shape: 'home' as const, end: true },
  { to: '/learn', label: 'Learn', shape: 'learn' as const, end: false },
  { to: '/review', label: 'Review', shape: 'review' as const, end: false },
  { to: '/progress', label: 'Progress', shape: 'progress' as const, end: false },
];

function NavIcon({ shape, active }: { shape: string; active: boolean }) {
  const color = active ? 'var(--color-primary)' : 'var(--color-ink-faint)';
  const size = 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {shape === 'home' && (
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z" fill={active ? color : 'none'} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      )}
      {shape === 'learn' && (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" fill={active ? color : 'none'} stroke={color} strokeWidth={2} />
          <path d="M8 8h8M8 12h5" stroke={active ? '#fff' : color} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {shape === 'review' && (
        <>
          <circle cx="12" cy="12" r="9" fill={active ? color : 'none'} stroke={color} strokeWidth={2} />
          <path d="M8 12l3 3 5-6" stroke={active ? '#fff' : color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {shape === 'progress' && (
        <>
          <path d="M4 20V10M10 20V6M16 20V13M22 20V4" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function AppLayout() {
  const srs = useStore((s) => s.srs);
  const due = dueCount(srs);

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-xl items-stretch justify-around">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium font-display transition ${
                  isActive ? 'text-primary' : 'text-ink-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`relative flex items-center justify-center rounded-full px-4 py-1 transition ${isActive ? 'bg-primary-soft' : ''}`}>
                    <NavIcon shape={item.shape} active={isActive} />
                    {item.to === '/review' && due > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                        {due}
                      </span>
                    )}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
