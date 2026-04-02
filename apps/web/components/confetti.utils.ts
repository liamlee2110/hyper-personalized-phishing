/**
 * Confetti Animation Utility
 *
 * A lightweight, performant confetti animation system using HTML5 Canvas.
 * Optimized for celebration moments like successful form submissions.
 *
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ConfettiOptions {
    /** Number of confetti particles to generate */
    particleCount?: number;
    /** Launch angle in degrees (90 = straight up) */
    angle?: number;
    /** How far particles spread (in degrees) */
    spread?: number;
    /** Initial launch velocity */
    startVelocity?: number;
    /** Velocity decay rate (0-1) */
    decay?: number;
    /** Gravity strength */
    gravity?: number;
    /** Horizontal drift */
    drift?: number;
    /** Animation duration in ticks */
    ticks?: number;
    /** Origin point { x: 0-1, y: 0-1 } */
    origin?: { x: number; y: number };
    /** Array of color hex strings */
    colors?: string[];
    /** Array of shape types */
    shapes?: Array<'circle' | 'square'>;
    /** Size multiplier */
    scalar?: number;
    /** Canvas z-index */
    zIndex?: number;
  }
  
  interface RGB {
    r: number;
    g: number;
    b: number;
  }
  
  interface Particle {
    x: number;
    y: number;
    wobble: number;
    wobbleSpeed: number;
    velocity: number;
    angle2D: number;
    tiltAngle: number;
    color: RGB;
    shape: 'circle' | 'square';
    tick: number;
    totalTicks: number;
    decay: number;
    drift: number;
    random: number;
    tiltSin: number;
    tiltCos: number;
    wobbleX: number;
    wobbleY: number;
    gravity: number;
    ovalScalar: number;
    scalar: number;
  }
  
  interface AnimationState {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    particles: Particle[];
    animationFrame: number | null;
  }
  
  // ============================================================================
  // Constants & Defaults
  // ============================================================================
  
  const DEFAULT_OPTIONS: Required<ConfettiOptions> = {
    particleCount: 50,
    angle: 90,
    spread: 45,
    startVelocity: 45,
    decay: 0.9,
    gravity: 1,
    drift: 0,
    ticks: 200,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#ef4444', '#000000', '#ffffff', '#dc2626', '#fca5a5'],
    shapes: ['square', 'circle'],
    scalar: 1,
    zIndex: 100,
  };
  
  // ============================================================================
  // Utility Functions
  // ============================================================================
  
  /**
   * Converts hex color to RGB object
   * @param hex - Hex color string (e.g., '#26ccff')
   * @returns RGB color object
   */
  function hexToRgb(hex: string): RGB {
    const val = String(hex).replace(/[^0-9a-f]/gi, '');
    const normalized =
      val.length < 6 ? (val[0] ?? '') + (val[0] ?? '') + (val[1] ?? '') + (val[1] ?? '') + (val[2] ?? '') + (val[2] ?? '') : val;
  
    return {
      r: parseInt(normalized.substring(0, 2), 16),
      g: parseInt(normalized.substring(2, 4), 16),
      b: parseInt(normalized.substring(4, 6), 16),
    };
  }
  
  /**
   * Converts array of hex colors to RGB objects
   * @param colors - Array of hex color strings
   * @returns Array of RGB color objects
   */
  function colorsToRgb(colors: string[]): RGB[] {
    return colors.map(hexToRgb);
  }
  
  /**
   * Returns random integer between min (inclusive) and max (exclusive)
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random integer
   */
  function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  /**
   * Draws an ellipse on canvas (fallback for older browsers)
   */
  function drawEllipse(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
  ): void {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(radiusX, radiusY);
    context.arc(0, 0, 1, startAngle, endAngle);
    context.restore();
  }
  
  // ============================================================================
  // Particle Physics
  // ============================================================================
  
  /**
   * Creates a particle with random physics properties
   * @param opts - Configuration options for the particle
   * @returns Particle object with physics properties
   */
  function createParticle(opts: {
    x: number;
    y: number;
    angle: number;
    spread: number;
    startVelocity: number;
    color: RGB;
    shape: 'circle' | 'square';
    ticks: number;
    decay: number;
    gravity: number;
    drift: number;
    scalar: number;
  }): Particle {
    const radAngle = opts.angle * (Math.PI / 180);
    const radSpread = opts.spread * (Math.PI / 180);
  
    return {
      x: opts.x,
      y: opts.y,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
      velocity: opts.startVelocity * 0.5 + Math.random() * opts.startVelocity,
      angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
      tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
      color: opts.color,
      shape: opts.shape,
      tick: 0,
      totalTicks: opts.ticks,
      decay: opts.decay,
      drift: opts.drift,
      random: Math.random() + 2,
      tiltSin: 0,
      tiltCos: 0,
      wobbleX: 0,
      wobbleY: 0,
      gravity: opts.gravity * 3,
      ovalScalar: 0.6,
      scalar: opts.scalar,
    };
  }
  
  /**
   * Updates particle physics and renders it
   * @param context - Canvas rendering context
   * @param particle - Particle to update and render
   * @returns True if particle is still alive, false if completed
   */
  function updateAndRenderParticle(
    context: CanvasRenderingContext2D,
    particle: Particle,
  ): boolean {
    // Physics-based position update
    // Horizontal: velocity-based initially, then drift reduces as particle falls
    const verticalProgress = Math.min(
      1,
      particle.tick / (particle.totalTicks * 0.4),
    );
    const driftReduction = 1 - verticalProgress * 0.7; // Reduce horizontal movement as it falls
  
    particle.x +=
      Math.cos(particle.angle2D) * particle.velocity +
      particle.drift * driftReduction;
  
    // Vertical: gravity dominates, creating realistic straight-down falling
    particle.y +=
      Math.sin(particle.angle2D) * particle.velocity + particle.gravity;
  
    // Velocity decay (air resistance)
    particle.velocity *= particle.decay;
  
    // Update wobble (slight air turbulence effect)
    particle.wobble += particle.wobbleSpeed;
    particle.wobbleX =
      particle.x + 10 * particle.scalar * Math.cos(particle.wobble);
    particle.wobbleY =
      particle.y + 10 * particle.scalar * Math.sin(particle.wobble);
  
    // Update tilt (rotation from air resistance)
    particle.tiltAngle += 0.1;
    particle.tiltSin = Math.sin(particle.tiltAngle);
    particle.tiltCos = Math.cos(particle.tiltAngle);
    particle.random = Math.random() + 2;
  
    // Calculate progress for fade-out
    const progress = particle.tick++ / particle.totalTicks;
  
    // Calculate render coordinates
    const x1 = particle.x + particle.random * particle.tiltCos;
    const y1 = particle.y + particle.random * particle.tiltSin;
    const x2 = particle.wobbleX + particle.random * particle.tiltCos;
    const y2 = particle.wobbleY + particle.random * particle.tiltSin;
  
    // Set fill style with fade-out
    context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${1 - progress})`;
  
    // Render particle based on shape
    context.beginPath();
  
    if (particle.shape === 'circle') {
      const radiusX = Math.abs(x2 - x1) * particle.ovalScalar;
      const radiusY = Math.abs(y2 - y1) * particle.ovalScalar;
      const rotation = (Math.PI / 10) * particle.wobble;
  
      if (context.ellipse) {
        context.ellipse(
          particle.x,
          particle.y,
          radiusX,
          radiusY,
          rotation,
          0,
          2 * Math.PI,
        );
      } else {
        drawEllipse(
          context,
          particle.x,
          particle.y,
          radiusX,
          radiusY,
          rotation,
          0,
          2 * Math.PI,
        );
      }
    } else {
      // Square shape
      context.moveTo(Math.floor(particle.x), Math.floor(particle.y));
      context.lineTo(Math.floor(particle.wobbleX), Math.floor(y1));
      context.lineTo(Math.floor(x2), Math.floor(y2));
      context.lineTo(Math.floor(x1), Math.floor(particle.wobbleY));
    }
  
    context.closePath();
    context.fill();
  
    // Return true if particle is still alive
    return particle.tick < particle.totalTicks;
  }
  
  // ============================================================================
  // Canvas Management
  // ============================================================================
  
  let globalCanvas: HTMLCanvasElement | null = null;
  let globalAnimationState: AnimationState | null = null;
  
  /**
   * Creates and configures a canvas element
   * @param zIndex - Z-index for canvas positioning
   * @returns Configured canvas element
   */
  function createCanvas(zIndex: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
  
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = String(zIndex);
  
    // Set canvas size to match viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    return canvas;
  }
  
  /**
   * Gets or creates the global canvas instance
   * @param zIndex - Z-index for canvas positioning
   * @returns Canvas element
   */
  function getCanvas(zIndex: number): HTMLCanvasElement {
    if (!globalCanvas) {
      globalCanvas = createCanvas(zIndex);
      document.body.appendChild(globalCanvas);
    }
    return globalCanvas;
  }
  
  /**
   * Cleans up canvas and animation state
   */
  function cleanupCanvas(): void {
    if (globalCanvas && document.body.contains(globalCanvas)) {
      document.body.removeChild(globalCanvas);
    }
    globalCanvas = null;
    globalAnimationState = null;
  }
  
  // ============================================================================
  // Animation Loop
  // ============================================================================
  
  /**
   * Main animation loop
   * @param state - Current animation state
   */
  function animationLoop(state: AnimationState): void {
    const { context, particles, canvas } = state;
  
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    // Update and render all particles
    state.particles = particles.filter((particle) =>
      updateAndRenderParticle(context, particle),
    );
  
    // Continue animation if particles remain
    if (state.particles.length > 0) {
      state.animationFrame = requestAnimationFrame(() => animationLoop(state));
    } else {
      // Animation complete - cleanup
      cleanupCanvas();
    }
  }
  
  // ============================================================================
  // Public API
  // ============================================================================
  
  /**
   * Fires confetti with specified options
   *
   * @param options - Configuration options for confetti
   * @returns Promise that resolves when animation completes
   *
   * @example
   * ```typescript
   * // Fire confetti from bottom-left corner
   * fireConfetti({
   *   particleCount: 50,
   *   angle: 60,
   *   spread: 55,
   *   origin: { x: 0, y: 1 }
   * });
   * ```
   */
  export function fireConfetti(options: ConfettiOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      // Check for reduced motion preference
      const prefersReducedMotion =
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion)').matches;
  
      if (prefersReducedMotion) {
        resolve();
        return;
      }
  
      // Merge options with defaults
      const opts: Required<ConfettiOptions> = {
        ...DEFAULT_OPTIONS,
        ...options,
        origin: { ...DEFAULT_OPTIONS.origin, ...(options.origin || {}) },
      };
  
      // Get or create canvas
      const canvas = getCanvas(opts.zIndex);
      const context = canvas.getContext('2d');
  
      if (!context) {
        resolve();
        return;
      }
  
      // Convert colors to RGB
      const rgbColors = colorsToRgb(opts.colors);
  
      // Calculate origin in pixels
      const startX = canvas.width * opts.origin.x;
      const startY = canvas.height * opts.origin.y;
  
      // Create particles
      const particles: Particle[] = [];
      for (let i = 0; i < opts.particleCount; i++) {
        particles.push(
          createParticle({
            x: startX,
            y: startY,
            angle: opts.angle,
            spread: opts.spread,
            startVelocity: opts.startVelocity,
          color: rgbColors[i % rgbColors.length]!,
          shape: opts.shapes[randomInt(0, opts.shapes.length)]!,
            ticks: opts.ticks,
            decay: opts.decay,
            gravity: opts.gravity,
            drift: opts.drift,
            scalar: opts.scalar,
          }),
        );
      }
  
      // Add particles to existing animation or start new one
      if (globalAnimationState && globalAnimationState.animationFrame !== null) {
        // Add to existing animation
        globalAnimationState.particles.push(...particles);
        resolve();
      } else {
        // Start new animation
        globalAnimationState = {
          canvas,
          context,
          particles,
          animationFrame: null,
        };
  
        // Start animation loop
        globalAnimationState.animationFrame = requestAnimationFrame(() => {
          if (globalAnimationState) {
            animationLoop(globalAnimationState);
          }
          resolve();
        });
      }
    });
  }
  
  /**
   * Stops all active confetti animations and cleans up
   *
   * @example
   * ```typescript
   * // Stop confetti after 2 seconds
   * setTimeout(() => {
   *   stopConfetti();
   * }, 2000);
   * ```
   */
  export function stopConfetti(): void {
    if (globalAnimationState?.animationFrame) {
      cancelAnimationFrame(globalAnimationState.animationFrame);
    }
    cleanupCanvas();
  }
  
  /**
   * Fires confetti from both bottom corners simultaneously
   * Single powerful burst with MASSIVE particle count for spectacular effect
   *
   * @param particleCount - Number of particles per corner (default: 300)
   * @param colors - Optional array of hex colors to use
   * @returns Promise that resolves when animation completes
   *
   * @example
   * ```typescript
   * // Fire epic confetti burst
   * await fireCornerConfetti();
   *
   * // Custom particle count
   * await fireCornerConfetti(400);
   * ```
   */
  export async function fireCornerConfetti(
    particleCount: number = 300,
    colors?: string[],
  ): Promise<void> {
    const confettiColors = colors || [
      '#ef4444',
      '#000000',
      '#ffffff',
      '#dc2626',
      '#fca5a5',
    ];
  
    // Fire MASSIVE SLOW & HIGH burst from bottom-left corner - GRACEFUL ASCENT
    await fireConfetti({
      particleCount,
      angle: 85,
      spread: 180,
      startVelocity: 35,
      origin: { x: 0, y: 1 },
      colors: confettiColors,
      shapes: ['circle', 'square'],
      gravity: 0.65,
      scalar: 2.2,
      drift: 8,
      ticks: 750,
      decay: 0.97,
    });
  
    // Fire MASSIVE SLOW & HIGH burst from bottom-right corner - GRACEFUL ASCENT
    await fireConfetti({
      particleCount,
      angle: 95,
      spread: 180,
      startVelocity: 35,
      origin: { x: 1, y: 1 },
      colors: confettiColors,
      shapes: ['circle', 'square'],
      gravity: 0.65,
      scalar: 2.2,
      drift: -8,
      ticks: 750,
      decay: 0.97,
    });
  }
  