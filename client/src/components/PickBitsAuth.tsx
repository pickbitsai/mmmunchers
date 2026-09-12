import { useEffect, useState } from 'react';
import { isPbActive, onPbAuth, pbLogin, type PbUser } from '../lib/pickbits';

export function PickBitsAuth() {
  const [user, setUser] = useState<PbUser | null>(null);
  useEffect(() => onPbAuth(setUser), []);
  const name = user ? user.username || user.display_name || 'player' : 'anon';
  return (
    <div className="fixed bottom-2 right-2 md:bottom-16 z-[60] flex max-w-[calc(100vw-144px)] items-center gap-2 rounded-lg border border-cyan-400/40 bg-slate-950/95 px-2 py-1.5 text-xs text-cyan-200">
      <span className="truncate" data-testid="pb-auth-state" title={name}>{name}</span>
      {!user && isPbActive() && (
        <button type="button" onClick={pbLogin} aria-label="Sign in with PickBits" className="shrink-0 font-semibold text-lime-300 hover:underline">
          Sign in
        </button>
      )}
    </div>
  );
}
