export const checkHttpFrameEmbeddability = async (urlStr: string): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        let response: Response;
        try {
            response = await fetch(urlStr, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                signal: controller.signal,
                redirect: 'follow',
            });
            if (response.status === 405 || response.status === 501) {
                response = await fetch(urlStr, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    },
                    signal: controller.signal,
                    redirect: 'follow',
                });
            }
        } catch {
            return false;
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            return false;
        }

        const xFrameOptions = response.headers.get('x-frame-options');
        if (xFrameOptions) {
            const xfo = xFrameOptions.toUpperCase();
            if (xfo.includes('DENY') || xfo.includes('SAMEORIGIN')) {
                return false;
            }
        }

        const csp = response.headers.get('content-security-policy');
        if (csp) {
            const match = csp.match(/frame-ancestors\s+([^;]+)/i);
            if (match) {
                const ancestors = match[1].trim().toLowerCase();
                if (ancestors === "'none'" || ancestors === "'self'") {
                    return false;
                }
            }
        }

        return true;
    } catch {
        return false;
    }
};
