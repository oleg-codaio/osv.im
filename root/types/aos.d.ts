declare module 'aos' {
  export interface AosOptions {
    disable?: boolean | 'phone' | 'tablet' | 'mobile' | (() => boolean);
    startEvent?: 'DOMContentLoaded' | string;
    initClassName?: string;
    animatedClassName?: string;
    useClassNames?: false;

    offset?: number;
    delay?: number;
    duration?: number;
    easing?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: string;
  }

  export function init(opts?: AosOptions): void;
  export function refresh(): void;
  export function refreshHard(): void;
}
