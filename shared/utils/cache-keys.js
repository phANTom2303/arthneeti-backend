export const CACHE_TTL = {
    ONE_MINUTE: 60,
    ONE_HOUR: 3600,
    TWELVE_HOURS: 43200,
    ONE_DAY: 86400,
};

export const CacheKeys = {
    AI_VERDICT: {
        latest_decision: (symbol) => `verdict:latest:decision${symbol.toUpperCase()}`,

        latest_reports: (analysisId) => `verdict:latest:reports:${analysisId}`
    }
};