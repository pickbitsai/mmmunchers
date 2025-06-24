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
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      if (isMuted) {
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playMunch: () => {
    const { munchSound, isMuted } = get();
    if (munchSound && !isMuted) {
      const soundClone = munchSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.6;
      // Make it sound more crunchy by adjusting playback rate slightly
      soundClone.playbackRate = 0.8; // Slower, deeper crunch sound
      soundClone.play().catch(error => {
        console.log("Munch sound play prevented:", error);
      });
    }
  },
  
  playMove: () => {
    const { moveSound, isMuted } = get();
    if (moveSound && !isMuted) {
      const soundClone = moveSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.2;
      soundClone.play().catch(error => {
        console.log("Move sound play prevented:", error);
      });
    }
  },
  
  playEnemyMove: () => {
    const { enemyMoveSound, isMuted } = get();
    if (enemyMoveSound && !isMuted) {
      const soundClone = enemyMoveSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Enemy move sound play prevented:", error);
      });
    }
  }
}));
