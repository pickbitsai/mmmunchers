import { useEffect } from "react";
import { useAudio } from "../lib/stores/useAudio";

export default function SoundManager() {
  const { 
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

    return () => {
      bgMusic.pause();
      bgMusic.src = "";
      hitAudio.src = "";
      successAudio.src = "";
      munchAudio.src = "";
      moveAudio.src = "";
      enemyMoveAudio.src = "";
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, setMunchSound, setMoveSound, setEnemyMoveSound]);

  return null;
}
