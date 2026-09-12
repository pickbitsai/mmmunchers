import { create } from 'zustand';
import { applyProgress, CAREER_KEY, CAREER_SYNC_EVENT, readLocalCareer, writeLocalCareer, type CareerProgress, type CareerStats } from '../careerStats';
import { saveProgress, unlockAchievement } from '../pickbits';

export const useCareerState = create<{ career: CareerStats }>(() => ({ career: readLocalCareer() }));

export function recordCareerProgress(progress: CareerProgress): void {
  const before = readLocalCareer();
  const after = applyProgress(before, progress);
  writeLocalCareer(after); // Includes unlocks even when anonymous or SDK-inactive.
  useCareerState.setState({ career: after });
  for (const slug of after.achievements) {
    if (!before.achievements.includes(slug)) unlockAchievement(slug);
  }
  saveProgress();
}

export function subscribeCareerSync(): () => void {
  const refresh = () => useCareerState.setState({ career: readLocalCareer() });
  const onStorage = (event: StorageEvent) => { if (event.key === CAREER_KEY) refresh(); };
  window.addEventListener(CAREER_SYNC_EVENT, refresh);
  window.addEventListener('storage', onStorage);
  refresh();
  return () => {
    window.removeEventListener(CAREER_SYNC_EVENT, refresh);
    window.removeEventListener('storage', onStorage);
  };
}
