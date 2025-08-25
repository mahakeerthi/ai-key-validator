/**
 * Jest test setup configuration
 * This file runs before all tests and sets up global test environment
 */
export declare const TEST_CONSTANTS: {
    MOCK_API_KEYS: {
        openai: {
            valid: string;
            validLegacy: string;
            invalid: string;
            malformed: string;
            empty: string;
        };
        claude: {
            valid: string;
            invalid: string;
            malformed: string;
            empty: string;
        };
        gemini: {
            valid: string;
            invalid: string;
            malformed: string;
            empty: string;
        };
    };
    MOCK_RESPONSES: {
        success: {
            status: number;
            statusText: string;
        };
        unauthorized: {
            status: number;
            statusText: string;
        };
        forbidden: {
            status: number;
            statusText: string;
        };
        notFound: {
            status: number;
            statusText: string;
        };
        rateLimited: {
            status: number;
            statusText: string;
        };
        serverError: {
            status: number;
            statusText: string;
        };
        badGateway: {
            status: number;
            statusText: string;
        };
        serviceUnavailable: {
            status: number;
            statusText: string;
        };
    };
    TIMEOUTS: {
        fast: number;
        normal: number;
        slow: number;
    };
};
export declare const delay: (ms: number) => Promise<void>;
export declare const suppressConsole: (fn: () => void | Promise<void>) => void | Promise<void>;
export declare const createMemoryTest: () => {
    track: (obj: {
        [key: string]: unknown;
    }) => {
        [key: string]: unknown;
    };
    cleanup: () => void;
    getTrackedCount: () => number;
};
//# sourceMappingURL=setup.d.ts.map