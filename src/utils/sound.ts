class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public setMuted(m: boolean) {
    this.muted = m;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    delay = 0,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(540, 0.06, 'triangle', 0.1, 0, 620);
  }

  public playPop() {
    this.playTone(320, 0.09, 'sine', 0.18, 0, 920);
  }

  public playFlip() {
    this.playTone(420, 0.07, 'sine', 0.09, 0, 640);
  }

  public playCorrect(combo = 1) {
    const boost = Math.min(combo - 1, 6) * 35;
    this.playTone(523.25 + boost, 0.13, 'triangle', 0.14, 0);
    this.playTone(659.25 + boost, 0.14, 'triangle', 0.15, 0.08);
    this.playTone(783.99 + boost, 0.22, 'sine', 0.16, 0.16);
  }

  public playWrong() {
    // Gentle soft marimba tone, never harsh buzzer
    this.playTone(310, 0.14, 'sine', 0.12, 0, 270);
    this.playTone(255, 0.2, 'sine', 0.12, 0.13, 220);
  }

  public playBoost() {
    this.playTone(360, 0.16, 'sawtooth', 0.06, 0, 740);
    this.playTone(780, 0.16, 'triangle', 0.1, 0.09, 980);
  }

  public playTick() {
    this.playTone(700, 0.035, 'square', 0.04);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.42 : 0.14, 'triangle', 0.15, idx * 0.1);
    });
  }
}

export const sound = new SoundEngine();
