import { RenderTier } from '../types';

/**
 * Mock detection of device capabilities to determine a render tier.
 * In a real-world scenario, this could involve more complex heuristics,
 * like benchmarking rendering performance with `requestAnimationFrame`.
 */
export const detectPerformanceTier = (): RenderTier => {
    // Simple heuristic based on screen width for demonstration.
    if (window.innerWidth >= 1280) {
        return 'Stellar';
    }
    if (window.innerWidth >= 768) {
        return 'Grove';
    }
    return 'Aethercore';
};