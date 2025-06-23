import { useEffect } from "react";
import { useAudio } from "../lib/stores/useAudio";

export default function SoundManager() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

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

    return () => {
      bgMusic.pause();
      bgMusic.src = "";
      hitAudio.src = "";
      successAudio.src = "";
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return null;
}
