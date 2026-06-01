import React, { useEffect, useRef, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale-up";
  duration?: number; // duration in ms (overrides setting)
  delay?: number; // delay in ms (overrides setting)
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

export function ScrollReveal({
  children,
  animation,
  duration,
  delay,
  className = "",
  threshold = 0.1,
  triggerOnce = true,
  as: Component = "div",
}: ScrollRevealProps) {
  const { settings } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  // Fallback to settings if prop not specified
  const configAnimation = animation || settings.scrollReveal.animationType || "slide-up";
  const configDuration = duration !== undefined ? duration : (settings.scrollReveal.duration || 800);
  const configDelay = delay !== undefined ? delay : (settings.scrollReveal.delay || 0);
  const isAnimationEnabled = settings.scrollReveal.enabled;

  useEffect(() => {
    if (!isAnimationEnabled || typeof window === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [isAnimationEnabled, threshold, triggerOnce]);

  if (!isAnimationEnabled) {
    return (
      <Component className={className}>
        {children}
      </Component>
    );
  }

  const animationClass = `reveal-${configAnimation}`;
  const visibilityClass = isVisible ? "is-visible" : "";

  // Inline styles for hardware-accelerated transitions
  const style: React.CSSProperties = {
    transitionDuration: `${configDuration}ms`,
    transitionDelay: `${configDelay}ms`,
  };

  return (
    <Component
      ref={elementRef as any}
      className={`reveal-base ${animationClass} ${visibilityClass} ${className}`}
      style={style}
    >
      {children}
    </Component>
  );
}

interface ScrollStaggerProps {
  children: React.ReactNode[];
  animation?: "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale-up";
  duration?: number;
  baseDelay?: number;
  interval?: number; // delay between each child in ms
  className?: string;
  threshold?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

export function ScrollStagger({
  children,
  animation,
  duration,
  baseDelay = 0,
  interval = 100,
  className = "",
  threshold = 0.1,
  as: Component = "div",
}: ScrollStaggerProps) {
  return (
    <Component className={className}>
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        return (
          <ScrollReveal
            animation={animation}
            duration={duration}
            delay={baseDelay + idx * interval}
            threshold={threshold}
          >
            {child}
          </ScrollReveal>
        );
      })}
    </Component>
  );
}
