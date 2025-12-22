import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { HolidayTheme, VideoFormat } from '@card0r/shared';

interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  duration: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const FORMAT_CONFIGS: Record<VideoFormat, { width: number; height: number }> = {
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
  'square': { width: 1080, height: 1080 },
  'social': { width: 1080, height: 1920 }
};

const HOLIDAY_COLORS: Record<HolidayTheme, { bg: string; primary: string; secondary: string; accent: string }> = {
  christmas: { bg: '#1a472a', primary: '#d42426', secondary: '#2e7d32', accent: '#ffd700' },
  new_year: { bg: '#0a0a2e', primary: '#ffd700', secondary: '#ff6b9d', accent: '#00d4ff' },
  easter: { bg: '#fff9e6', primary: '#ff99cc', secondary: '#99ccff', accent: '#ffeb3b' },
  valentines_day: { bg: '#ffe6f0', primary: '#ff1744', secondary: '#ff4081', accent: '#f50057' },
  halloween: { bg: '#1a1a1a', primary: '#ff6600', secondary: '#8b00ff', accent: '#00ff00' },
  thanksgiving: { bg: '#8b4513', primary: '#ff8c00', secondary: '#daa520', accent: '#cd853f' },
  rosh_hashanah: { bg: '#f5f5dc', primary: '#daa520', secondary: '#cd853f', accent: '#ff6347' },
  hanukkah: { bg: '#001f3f', primary: '#0074d9', secondary: '#ffffff', accent: '#ffd700' },
  passover: { bg: '#f5f5dc', primary: '#8b4513', secondary: '#daa520', accent: '#cd853f' },
  yom_kippur: { bg: '#f0f0f0', primary: '#4a4a4a', secondary: '#7f7f7f', accent: '#ffffff' },
  eid_al_fitr: { bg: '#0a5f38', primary: '#ffd700', secondary: '#00d4aa', accent: '#ffffff' },
  eid_al_adha: { bg: '#0a5f38', primary: '#ffd700', secondary: '#00d4aa', accent: '#ffffff' },
  ramadan: { bg: '#1a237e', primary: '#ffd700', secondary: '#9c27b0', accent: '#00bcd4' },
  chinese_new_year: { bg: '#b71c1c', primary: '#ffd700', secondary: '#ffeb3b', accent: '#ff5722' },
  diwali: { bg: '#1a237e', primary: '#ff9800', secondary: '#ffeb3b', accent: '#f44336' },
  lunar_new_year: { bg: '#b71c1c', primary: '#ffd700', secondary: '#ffeb3b', accent: '#ff5722' }
};

export class CanvasRenderer {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private config: VideoConfig;
  private theme: HolidayTheme;
  private particles: Particle[] = [];

  private messageLines: string[] = [];
  private videoDuration: number = 30;

  constructor(format: VideoFormat, theme: HolidayTheme) {
    const dimensions = FORMAT_CONFIGS[format];
    this.config = {
      width: dimensions.width,
      height: dimensions.height,
      fps: 30,
      duration: 30 // Will be updated based on message length
    };
    this.theme = theme;
    this.canvas = createCanvas(this.config.width, this.config.height);
    this.ctx = this.canvas.getContext('2d');
    this.initializeParticles();
  }

  private calculateDuration(message: string): number {
    // Calculate reading time: average 200 words per minute = 3.3 words per second
    const wordCount = message.split(' ').length;
    const readingTime = Math.ceil(wordCount / 3.3);

    // Add time for intro (5s) + name reveal (3s) + outro (3s) + buffer (5s)
    const totalTime = 5 + 3 + readingTime + 5 + 3;

    // Minimum 20 seconds, maximum 60 seconds
    return Math.min(60, Math.max(20, totalTime));
  }

  private initializeParticles(): void {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    const colors = HOLIDAY_COLORS[this.theme];
    const particleColors = [colors.primary, colors.secondary, colors.accent, '#ffffff'];

    return {
      x: Math.random() * this.config.width,
      y: Math.random() * this.config.height,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      size: Math.random() * 4 + 2,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    };
  }

  private updateParticles(): void {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;

      // Wrap around screen
      if (particle.y > this.config.height) {
        particle.y = -10;
        particle.x = Math.random() * this.config.width;
      }
      if (particle.x < -10) particle.x = this.config.width + 10;
      if (particle.x > this.config.width + 10) particle.x = -10;
    });
  }

  private drawParticles(): void {
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
      this.ctx.fillStyle = particle.color;

      // Different particle shapes based on theme
      if (this.theme === 'christmas') {
        // Snowflakes
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          this.ctx.rotate(Math.PI / 3);
          this.ctx.moveTo(0, 0);
          this.ctx.lineTo(0, particle.size);
        }
        this.ctx.strokeStyle = particle.color;
        this.ctx.stroke();
      } else if (this.theme === 'new_year') {
        // Confetti
        this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 2);
      } else if (this.theme === 'halloween') {
        // Stars
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          this.ctx.lineTo(
            Math.cos((i * 4 * Math.PI) / 5) * particle.size,
            Math.sin((i * 4 * Math.PI) / 5) * particle.size
          );
        }
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Default circles
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  private drawBackground(progress: number): void {
    const colors = HOLIDAY_COLORS[this.theme];

    // Gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height);
    gradient.addColorStop(0, colors.bg);
    gradient.addColorStop(1, this.adjustColorBrightness(colors.bg, 1.3));

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);

    // Animated circles/shapes in background
    this.ctx.globalAlpha = 0.1;
    for (let i = 0; i < 3; i++) {
      const offset = (progress + i * 0.33) % 1;
      this.ctx.beginPath();
      this.ctx.arc(
        this.config.width * (0.3 + i * 0.2),
        this.config.height * offset,
        200,
        0,
        Math.PI * 2
      );
      this.ctx.fillStyle = colors.accent;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  private adjustColorBrightness(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * factor));
    const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * factor));
    const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private drawText(text: string, y: number, size: number, align: 'center' | 'left' | 'right' = 'center', alpha: number = 1): void {
    const colors = HOLIDAY_COLORS[this.theme];

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.font = `bold ${size}px Arial, sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';

    // Text shadow for readability
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 3;

    // Gradient text
    const textGradient = this.ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    textGradient.addColorStop(0, colors.primary);
    textGradient.addColorStop(1, colors.accent);

    this.ctx.fillStyle = textGradient;
    this.ctx.fillText(text, align === 'center' ? this.config.width / 2 : (align === 'left' ? 100 : this.config.width - 100), y);

    this.ctx.restore();
  }

  private wrapText(text: string, maxWidth: number, lineHeight: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  public generateFrame(frameNumber: number, name: string, message: string): Buffer {
    // Initialize message lines on first frame
    if (frameNumber === 0) {
      this.videoDuration = this.calculateDuration(message);
      this.config.duration = this.videoDuration;
      this.ctx.font = '48px Arial, sans-serif';
      const maxWidth = this.config.width - 300;
      this.messageLines = this.wrapText(message, maxWidth, 60);
      console.log(`Video duration set to ${this.videoDuration}s for ${this.messageLines.length} lines`);
    }

    const totalFrames = this.config.fps * this.config.duration;
    const progress = frameNumber / totalFrames;
    const second = frameNumber / this.config.fps;

    // Clear and draw background
    this.drawBackground(progress);

    // Update and draw particles
    this.updateParticles();
    this.drawParticles();

    // Video structure:
    // 0-5s: Intro with theme animation
    // 5-8s: Name reveal
    // 8-[duration-3]s: Message display (line-by-line reveal + hold time)
    // [duration-3]-duration: Outro

    const messageStartTime = 8;
    const messageEndTime = this.config.duration - 3;
    const messageDuration = messageEndTime - messageStartTime;

    if (second < 5) {
      // Intro: Holiday theme title
      const introProgress = second / 5;
      const alpha = Math.sin(introProgress * Math.PI); // Fade in and out
      const themeName = this.theme.replace(/_/g, ' ').toUpperCase();
      this.drawText(themeName, this.config.height / 2, 120, 'center', alpha);

    } else if (second < 8) {
      // Name reveal
      const nameProgress = (second - 5) / 3;
      const scale = 0.5 + nameProgress * 0.5;
      const alpha = Math.min(1, nameProgress * 2);
      const fontSize = 100 * scale;
      this.drawText(name, this.config.height / 2, fontSize, 'center', alpha);

    } else if (second < messageEndTime) {
      // Message display
      const messageProgress = (second - messageStartTime) / messageDuration;

      // Draw name at top (smaller)
      this.drawText(name, 150, 60, 'center', 1);

      // Calculate timing: reveal lines one by one, then hold
      const revealTimePerLine = 0.8; // seconds per line
      const totalRevealTime = Math.min(this.messageLines.length * revealTimePerLine, messageDuration * 0.6);
      const holdTime = messageDuration - totalRevealTime;

      // Calculate fixed positions for all lines (centered vertically)
      const lineHeight = 70;
      const totalHeight = this.messageLines.length * lineHeight;
      const startY = (this.config.height / 2) - (totalHeight / 2) + 100;

      // Draw each line with fade-in animation
      this.messageLines.forEach((line, index) => {
        const lineStartTime = index * revealTimePerLine;
        const lineEndTime = lineStartTime + revealTimePerLine;
        const currentTime = second - messageStartTime;

        let alpha = 0;
        if (currentTime >= lineEndTime) {
          // Line fully visible
          alpha = 1;
        } else if (currentTime >= lineStartTime) {
          // Line fading in
          alpha = (currentTime - lineStartTime) / revealTimePerLine;
        }

        if (alpha > 0) {
          const yPos = startY + index * lineHeight;
          this.drawText(line, yPos, 48, 'center', alpha);
        }
      });

    } else {
      // Outro
      const outroProgress = (second - messageEndTime) / 3;
      const alpha = 1 - outroProgress;
      this.drawText('✨ ' + name + ' ✨', this.config.height / 2, 80, 'center', alpha);
    }

    // Return the frame as a buffer
    return this.canvas.toBuffer('image/png');
  }

  public getConfig(): VideoConfig {
    return this.config;
  }
}
