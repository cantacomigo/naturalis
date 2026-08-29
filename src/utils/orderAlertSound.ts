/**
 * Sound Alert System for Naturalis Gourmet - iFood & Telephone Style Order Ringtones
 * Uses Web Audio API for zero-latency, cross-platform synthesized ringtones without external audio dependencies.
 * 
 * STRICT POLICY: Sound notifications are strictly reserved for the store Administrator.
 * Regular customers browsing the store or placing an order will NEVER hear any sound alert.
 */

class OrderSoundManager {
  private audioCtx: AudioContext | null = null;
  private loopInterval: number | null = null;
  private isSoundEnabled: boolean = true;
  private isAdmin: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('naturalis_order_sound_enabled');
      this.isSoundEnabled = saved !== null ? saved === 'true' : true;
      this.isAdmin = localStorage.getItem('geladinhos_admin_auth') === 'true';
    } catch {
      this.isSoundEnabled = true;
      this.isAdmin = false;
    }
  }

  public setAdminAuthenticated(isAdmin: boolean): void {
    this.isAdmin = isAdmin;
    if (!isAdmin) {
      this.stopLoop();
    }
  }

  private isAuthorizedAdmin(): boolean {
    if (this.isAdmin) return true;
    try {
      return localStorage.getItem('geladinhos_admin_auth') === 'true';
    } catch {
      return false;
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public isEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.isSoundEnabled = enabled;
    try {
      localStorage.setItem('naturalis_order_sound_enabled', enabled ? 'true' : 'false');
    } catch {}
    if (!enabled) {
      this.stopLoop();
    }
  }

  /**
   * Plays the signature upbeat iFood-style double chime + phone notification trill
   * STRICTLY ADMIN-ONLY: Silently ignored if user is not authenticated as admin
   */
  public playIFoodOrderAlert(): void {
    if (!this.isAuthorizedAdmin() || !this.isSoundEnabled) {
      return;
    }

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Part 1: First upbeat bell motif (D5 -> F#5 -> A5 -> D6)
      const notes = [
        { freq: 587.33, start: 0.00, dur: 0.12, gain: 0.28 }, // D5
        { freq: 739.99, start: 0.10, dur: 0.14, gain: 0.30 }, // F#5
        { freq: 880.00, start: 0.22, dur: 0.16, gain: 0.32 }, // A5
        { freq: 1174.66, start: 0.36, dur: 0.35, gain: 0.35 }, // D6 (accent)
      ];

      notes.forEach(({ freq, start, dur, gain: vol }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Use triangle + sine blend for warm rich bell timbre
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);

        gainNode.gain.setValueAtTime(0, now + start);
        gainNode.gain.linearRampToValueAtTime(vol, now + start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur);
      });

      // Part 2: Quick vibrant telephone bell trill (like iFood / modern POS ringer)
      const trillNotes = [
        { freq: 1046.50, start: 0.70, dur: 0.08 }, // C6
        { freq: 1318.51, start: 0.78, dur: 0.08 }, // E6
        { freq: 1046.50, start: 0.86, dur: 0.08 }, // C6
        { freq: 1318.51, start: 0.94, dur: 0.08 }, // E6
        { freq: 1567.98, start: 1.02, dur: 0.40 }, // G6 long finish
      ];

      trillNotes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);

        gainNode.gain.setValueAtTime(0, now + start);
        gainNode.gain.linearRampToValueAtTime(0.25, now + start + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur);
      });

      // Secondary repetition (second ring pulse after 1.5s for authentic phone cadence)
      const secondPulseStart = 1.5;
      notes.forEach(({ freq, start, dur, gain: vol }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + secondPulseStart + start);

        gainNode.gain.setValueAtTime(0, now + secondPulseStart + start);
        gainNode.gain.linearRampToValueAtTime(vol * 0.9, now + secondPulseStart + start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + secondPulseStart + start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + secondPulseStart + start);
        osc.stop(now + secondPulseStart + start + dur);
      });

      trillNotes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + secondPulseStart + start);

        gainNode.gain.setValueAtTime(0, now + secondPulseStart + start);
        gainNode.gain.linearRampToValueAtTime(0.22, now + secondPulseStart + start + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + secondPulseStart + start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + secondPulseStart + start);
        osc.stop(now + secondPulseStart + start + dur);
      });

    } catch (e) {
      console.warn('AudioContext playback error:', e);
    }
  }

  /**
   * Starts a continuous telephone ring cycle (rings every 3.5 seconds)
   * STRICTLY ADMIN-ONLY: Silently ignored if user is not authenticated as admin
   */
  public startOrderRingtoneLoop(maxRepetitions = 6): void {
    if (!this.isAuthorizedAdmin() || !this.isSoundEnabled) {
      return;
    }
    this.stopLoop();

    let count = 0;
    this.playIFoodOrderAlert();
    count++;

    this.loopInterval = window.setInterval(() => {
      if (!this.isAuthorizedAdmin() || !this.isSoundEnabled) {
        this.stopLoop();
        return;
      }
      if (count >= maxRepetitions) {
        this.stopLoop();
        return;
      }
      this.playIFoodOrderAlert();
      count++;
    }, 3600);
  }

  public stopLoop(): void {
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }
}

export const orderSoundManager = new OrderSoundManager();
