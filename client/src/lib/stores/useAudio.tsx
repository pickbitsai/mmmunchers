import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  munchSound: HTMLAudioElement | null;
  moveSound: HTMLAudioElement | null;
  enemyMoveSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setMunchSound: (sound: HTMLAudioElement) => void;
  setMoveSound: (sound: HTMLAudioElement) => void;
  setEnemyMoveSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playMunch: () => void;
  playMove: () => void;
  playEnemyMove: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  munchSound: null,
  moveSound: null,
  enemyMoveSound: null,
  isMuted: true, // Start muted by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setMunchSound: (sound) => set({ munchSound: sound }),
  setMoveSound: (sound) => set({ moveSound: sound }),
  setEnemyMoveSound: (sound) => set({ enemyMoveSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(() => {
        // Silently handle audio play errors
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      successSound.currentTime = 0;
      successSound.play().catch(() => {
        // Silently handle audio play errors
      });
    }
  },
  
  playMunch: () => {
    const { munchSound, isMuted } = get();
    if (munchSound && !isMuted) {
      // Use the original sound directly for fastest response
      munchSound.currentTime = 0; // Reset to beginning
      munchSound.volume = 0.6;
      munchSound.playbackRate = 0.8; // Slower, deeper crunch sound
      munchSound.play().catch(() => {
        // Silently handle audio play errors
      });
    }
  },
  
  playMove: () => {
    const { moveSound, isMuted } = get();
    if (moveSound && !isMuted) {
      const soundClone = moveSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.2;
      soundClone.play().catch(() => {
        // Silently handle audio play errors
      });
    }
  },
  
  playEnemyMove: () => {
    const { enemyMoveSound, isMuted } = get();
    if (enemyMoveSound && !isMuted) {
      const soundClone = enemyMoveSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(() => {
        // Silently handle audio play errors
      });
    }
  }
}));
