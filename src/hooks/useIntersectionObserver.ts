import { useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
  target: React.RefObject<Element>;
  onIntersect?: () => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionObserver({
  target,
  onIntersect,
  threshold = 0.1,
  rootMargin = '0px',
  enabled = true,
}: UseIntersectionObserverProps) {
  const savedCallback = useRef(onIntersect);

  useEffect(() => {
    savedCallback.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    if (!enabled || !target.current || !savedCallback.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && savedCallback.current) {
            savedCallback.current();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const element = target.current;
    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [enabled, rootMargin, target, threshold]);
} 