import React, { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';

const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const WHEEL_MAX_STRETCH = 40;
const WHEEL_SETTLE_MS = 120;

/**
 * Apple-style rubber-band resistance formula:
 * displacement = maxStretch * (1 - 1 / (dragDistance * 0.55 / maxStretch + 1))
 */
function calcRubberBand(dragDistance, maxStretch) {
  if (dragDistance <= 0 || maxStretch <= 0) return 0;
  return maxStretch * (1 - 1 / ((dragDistance * 0.55) / maxStretch + 1));
}

/**
 * Resolves the active vertical scroll metrics from the document scrolling element,
 * accounting for mobile dynamic toolbars (visualViewport / innerHeight / clientHeight)
 * and subpixel devicePixelRatio rounding.
 */
function getEdgeState() {
  const docEl = document.scrollingElement || document.documentElement;
  const scrollTop = Math.max(0, window.scrollY ?? docEl.scrollTop ?? 0);
  const viewHeight = Math.max(
    docEl.clientHeight || 0,
    window.innerHeight || 0,
    Math.ceil(window.visualViewport?.height || 0)
  );
  const scrollHeight = Math.max(
    docEl.scrollHeight || 0,
    document.body?.scrollHeight || 0
  );
  const maxScrollTop = Math.max(0, scrollHeight - viewHeight);

  return {
    scrollTop,
    atTop: scrollTop <= 4,
    atBottom: maxScrollTop <= 4 || scrollTop >= maxScrollTop - 8,
  };
}

export default function ElasticScroll({
  children,
  maxStretchTop = 100,
  maxStretchBottom = 120,
  footer,
  disabled = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const y = useMotionValue(0);

  // Map negative y (bottom pull) to footer opacity (0 -> 1) and lime dot scale
  const footerOpacity = useTransform(
    y,
    [0, -6, -Math.min(48, maxStretchBottom * 0.5)],
    [0, 0.15, 1],
    { clamp: true }
  );

  const dotScale = useTransform(
    y,
    [0, -20, -maxStretchBottom],
    [0.55, 0.9, 1.4],
    { clamp: true }
  );

  const footerTranslateY = useTransform(
    y,
    [0, -maxStretchBottom],
    [8, 0],
    { clamp: true }
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    let animControls = null;
    let wheelTimer = null;
    let wheelAccum = 0;
    let wheelDirection = null; // 'top' | 'bottom' | null

    const gesture = {
      active: false,
      isHorizontal: false,
      directionLocked: false,
      startX: 0,
      startY: 0,
      lastY: 0,
      lastTime: 0,
      velocityY: 0, // px/s
      startedAtTop: false,
      startedAtBottom: false,
      overscrollDir: null, // 'top' | 'bottom' | null
      anchorY: 0,
      hapticFired: false,
    };

    const stopCurrentAnimation = () => {
      if (animControls) {
        animControls.stop();
        animControls = null;
      }
    };

    const springBackToZero = (customVelocity) => {
      stopCurrentAnimation();
      const currentY = y.get();
      if (Math.abs(currentY) < 0.1) {
        y.set(0);
        return;
      }
      const vel =
        typeof customVelocity === 'number' && !Number.isNaN(customVelocity)
          ? customVelocity
          : y.getVelocity();

      animControls = animate(y, 0, {
        ...SPRING_CONFIG,
        velocity: vel,
      });
    };

    const cancelOverscroll = () => {
      gesture.overscrollDir = null;
      gesture.hapticFired = false;
      springBackToZero(0);
    };

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const edges = getEdgeState();

      if (wheelTimer) {
        clearTimeout(wheelTimer);
        wheelTimer = null;
        wheelAccum = 0;
        wheelDirection = null;
      }

      const currentOffset = y.get();

      gesture.active = true;
      gesture.isHorizontal = false;
      gesture.directionLocked = false;
      gesture.startX = touch.clientX;
      gesture.startY = touch.clientY;
      gesture.lastY = touch.clientY;
      gesture.lastTime = performance.now();
      gesture.velocityY = 0;
      gesture.startedAtTop = edges.atTop;
      gesture.startedAtBottom = edges.atBottom;
      gesture.hapticFired = false;

      // Catch an in-flight rubber-band if currently stretched
      if (currentOffset > 1 && edges.atTop && maxStretchTop > 0) {
        stopCurrentAnimation();
        gesture.directionLocked = true;
        gesture.overscrollDir = 'top';
        const invDist =
          (maxStretchTop / 0.55) *
          (1 / (1 - Math.min(currentOffset, maxStretchTop - 1) / maxStretchTop) - 1);
        gesture.anchorY = touch.clientY - invDist;
      } else if (currentOffset < -1 && edges.atBottom && maxStretchBottom > 0) {
        stopCurrentAnimation();
        gesture.directionLocked = true;
        gesture.overscrollDir = 'bottom';
        const absOffset = Math.abs(currentOffset);
        const invDist =
          (maxStretchBottom / 0.55) *
          (1 / (1 - Math.min(absOffset, maxStretchBottom - 1) / maxStretchBottom) - 1);
        gesture.anchorY = touch.clientY + invDist;
      } else {
        gesture.overscrollDir = null;
        gesture.anchorY = touch.clientY;
      }
    };

    const onTouchMove = (e) => {
      if (!gesture.active || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const now = performance.now();

      const stepDx = touch.clientX - gesture.startX;
      const stepDyFromStart = touch.clientY - gesture.startY;
      const moveDeltaY = touch.clientY - gesture.lastY;

      if (now > gesture.lastTime) {
        const instantVel = (moveDeltaY / (now - gesture.lastTime)) * 1000;
        gesture.velocityY = gesture.velocityY * 0.35 + instantVel * 0.65;
      }
      gesture.lastY = touch.clientY;
      gesture.lastTime = now;

      // Lock axis as soon as finger moves 2px so we beat the browser's 6px touch slop at edges
      if (!gesture.directionLocked) {
        if (Math.abs(stepDx) < 2 && Math.abs(stepDyFromStart) < 2) {
          return;
        }
        gesture.directionLocked = true;
        if (Math.abs(stepDx) > Math.abs(stepDyFromStart) * 1.15) {
          gesture.isHorizontal = true;
          return;
        }
      }

      if (gesture.isHorizontal) return;

      const edges = getEdgeState();

      // Update whether edge condition became true during the gesture
      if (edges.atTop) gesture.startedAtTop = true;
      if (edges.atBottom) gesture.startedAtBottom = true;

      // Enter overscroll if at top/bottom edge and dragging past that edge
      if (!gesture.overscrollDir) {
        if (
          edges.atTop &&
          gesture.startedAtTop &&
          moveDeltaY > 0 &&
          stepDyFromStart >= 2 &&
          maxStretchTop > 0
        ) {
          stopCurrentAnimation();
          gesture.overscrollDir = 'top';
          gesture.anchorY = touch.clientY - Math.max(1, moveDeltaY);
          gesture.hapticFired = false;
        } else if (
          edges.atBottom &&
          gesture.startedAtBottom &&
          moveDeltaY < 0 &&
          stepDyFromStart <= -2 &&
          maxStretchBottom > 0
        ) {
          stopCurrentAnimation();
          gesture.overscrollDir = 'bottom';
          gesture.anchorY = touch.clientY + Math.max(1, Math.abs(moveDeltaY));
          gesture.hapticFired = false;
        } else {
          return;
        }
      }

      // Active overscroll handling
      if (gesture.overscrollDir === 'top') {
        const rawDrag = touch.clientY - gesture.anchorY;
        // Cancel immediately if user reverses past anchor or swipes sharply back up
        if (rawDrag <= 0 || moveDeltaY < -10) {
          cancelOverscroll();
          return;
        }

        if (e.cancelable) e.preventDefault();

        const disp = calcRubberBand(rawDrag, maxStretchTop);
        y.set(disp);

        if (!gesture.hapticFired && disp >= maxStretchTop * 0.72) {
          gesture.hapticFired = true;
          try {
            navigator.vibrate?.(8);
          } catch {}
        }
      } else if (gesture.overscrollDir === 'bottom') {
        const rawDrag = gesture.anchorY - touch.clientY;
        // Cancel immediately if user reverses past anchor or swipes sharply back down
        if (rawDrag <= 0 || moveDeltaY > 10) {
          cancelOverscroll();
          return;
        }

        if (e.cancelable) e.preventDefault();

        const disp = calcRubberBand(rawDrag, maxStretchBottom);
        y.set(-disp);

        if (!gesture.hapticFired && disp >= maxStretchBottom * 0.72) {
          gesture.hapticFired = true;
          try {
            navigator.vibrate?.(8);
          } catch {}
        }
      }
    };

    const onTouchEnd = () => {
      if (!gesture.active) return;
      gesture.active = false;

      if (gesture.overscrollDir || Math.abs(y.get()) > 0.5) {
        gesture.overscrollDir = null;
        springBackToZero(gesture.velocityY);
      }
    };

    const onWheel = (e) => {
      // Ignore horizontal trackpad swipes
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;

      const edges = getEdgeState();

      const pullingTop = edges.atTop && e.deltaY < 0 && maxStretchTop > 0;
      const pullingBottom = edges.atBottom && e.deltaY > 0 && maxStretchBottom > 0;

      // Cancel immediately if user reverses wheel direction while stretched
      if (
        (wheelDirection === 'top' && e.deltaY > 0) ||
        (wheelDirection === 'bottom' && e.deltaY < 0)
      ) {
        if (wheelTimer) {
          clearTimeout(wheelTimer);
          wheelTimer = null;
        }
        wheelAccum = 0;
        wheelDirection = null;
        springBackToZero(0);
        return;
      }

      if (!pullingTop && !pullingBottom) return;

      if (e.cancelable) e.preventDefault();
      stopCurrentAnimation();

      wheelDirection = pullingTop ? 'top' : 'bottom';
      wheelAccum += -e.deltaY * 0.85;

      const maxWheel = Math.min(
        WHEEL_MAX_STRETCH,
        pullingTop ? maxStretchTop : maxStretchBottom
      );
      const disp = calcRubberBand(Math.abs(wheelAccum), maxWheel);
      y.set(Math.sign(wheelAccum) * disp);

      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelAccum = 0;
        wheelDirection = null;
        springBackToZero(y.getVelocity());
      }, WHEEL_SETTLE_MS);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      stopCurrentAnimation();
      if (wheelTimer) clearTimeout(wheelTimer);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, [disabled, maxStretchTop, maxStretchBottom, y]);

  const defaultFooter = (
    <div className="flex flex-col items-center justify-center gap-1.5 pt-3 pb-1 select-none pointer-events-none">
      <p className="font-display font-extrabold text-[15px] tracking-[-0.02em] text-[#5E6B63]">
        that&apos;s everything<span className="text-[#003820]">.</span>
      </p>
      <motion.span
        style={{ scale: dotScale }}
        className="w-2 h-2 rounded-[999px] bg-[#C6F26B] block"
      />
    </div>
  );

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <motion.div
        style={{
          y,
          willChange: 'transform',
        }}
        className="w-full"
      >
        {children}

        {maxStretchBottom > 0 && (
          <motion.div
            aria-hidden="true"
            style={{
              opacity: footerOpacity,
              y: footerTranslateY,
            }}
            className="w-full"
          >
            {footer !== undefined ? footer : defaultFooter}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
