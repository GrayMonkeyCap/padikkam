import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '../storage/store';
import { dueCount } from '../srs/queue';

const NAV = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/learn', label: 'Learn', icon: '📚', end: false },
  { to: '/review', label: 'Review', icon: '🔁', end: false },
  { to: '/progress', label: 'Progress', icon: '📈', end: false },
];

export function AppLayout() {
  const srs = useStore((s) => s.srs);
  const due = dueCount(srs);

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-teal-100 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-stretch justify-around">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                  isActive ? 'text-teal-700' : 'text-ink/40'
                }`
              }
            >
              <span className="relative text-xl">
                {item.icon}
                {item.to === '/review' && due > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
                    {due}
                  </span>
                )}
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
