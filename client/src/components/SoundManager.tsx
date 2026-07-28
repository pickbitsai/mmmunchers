import { useEffect } from "react";
import { useAudio } from "../lib/stores/useAudio";

export default function SoundManager() {
  const {
    isMuted,
    backgroundMusic,
    setBackgroundMusic,
    setHitSound,
    setSuccessSound,
    setMunchSound,
    setMoveSound,
    setEnemyMoveSound
  } = useAudio();

  useEffect(() => {
    // Load background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    // Load hit sound
    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.5;
    setHitSound(hitAudio);

    // Load success sound
    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.7;
    setSuccessSound(successAudio);

    // Load munch sound (using hit sound for crunchier effect)
    const munchAudio = new Audio("/sounds/hit.mp3");
    munchAudio.volume = 0.6;
    setMunchSound(munchAudio);

    // Load move sound (using hit sound with lower volume)
    const moveAudio = new Audio("/sounds/hit.mp3");
    moveAudio.volume = 0.2;
    setMoveSound(moveAudio);

    // Load enemy move sound (using hit sound)
    const enemyMoveAudio = new Audio("/sounds/hit.mp3");
    enemyMoveAudio.volume = 0.3;
    setEnemyMoveSound(enemyMoveAudio);

    // Browsers block audio until the page has seen a user gesture — retry
    // starting the music on the first click/keypress if it was blocked on mount.
    const tryStartMusic = () => {
      if (!useAudio.getState().isMuted) {
        bgMusic.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", tryStartMusic, { once: true });
    window.addEventListener("keydown", tryStartMusic, { once: true });

    return () => {
      window.removeEventListener("pointerdown", tryStartMusic);
      window.removeEventListener("keydown", tryStartMusic);
      bgMusic.pause();
      bgMusic.src = "";
      hitAudio.src = "";
      successAudio.src = "";
      munchAudio.src = "";
      moveAudio.src = "";
      enemyMoveAudio.src = "";
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, setMunchSound, setMoveSound, setEnemyMoveSound]);

  // Keep playback in sync with the mute toggle.
  useEffect(() => {
    if (!backgroundMusic) return;
    if (isMuted) {
      backgroundMusic.pause();
    } else {
      backgroundMusic.play().catch(() => {});
    }
  }, [isMuted, backgroundMusic]);

  return null;
}
