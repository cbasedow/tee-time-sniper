import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { toError } from "./error";
import { logger } from "./logger";

interface FetchWithRetryOptions extends RequestInit {
	maxRetries?: number;
	retryDelay?: number;
	maxRetryDelay?: number;
	timeout?: number | null;
}

const DEFAULT_FETCH_OPTIONS = {
	DEFAULT_MAX_RETRIES: 3,
	DEFAULT_RETRY_DELAY: 500,
	DEFAULT_TIMEOUT: 10_000,
	MAX_RETRY_DELAY: 5000,
} as const;

const JITTER_FACTOR = 0.5; // Adds 0-50% random variation

interface FetchWithRetryResult extends ResultAsync<Response, Error> {
	json<U>(): ResultAsync<U, Error>;
}

export function fetchWithRetry(url: string, options: FetchWithRetryOptions): FetchWithRetryResult {
	const {
		maxRetries = DEFAULT_FETCH_OPTIONS.DEFAULT_MAX_RETRIES,
		retryDelay = DEFAULT_FETCH_OPTIONS.DEFAULT_RETRY_DELAY,
		maxRetryDelay = DEFAULT_FETCH_OPTIONS.MAX_RETRY_DELAY,
		timeout = DEFAULT_FETCH_OPTIONS.DEFAULT_TIMEOUT,
		...fetchOptions
	} = options;

	function shouldRetry(response: Response, attempt: number): boolean {
		if (attempt >= maxRetries) {
			return false;
		}

		// retry on server errors and rate limiting
		return response.status >= 500 || response.status === 429;
	}

	const urlPath = getSafeUrlPath(url);

	function executeFetchWithRetry(attempt: number): ResultAsync<Response, Error> {
		const signal = timeout ? AbortSignal.timeout(timeout) : undefined;

		return ResultAsync.fromPromise(
			fetch(url, {
				...fetchOptions,
				signal,
			}),
			(error) => {
				if (error instanceof DOMException && error.name === "TimeoutError") {
					return new Error(`Request to ${urlPath} timed out after ${timeout}ms`);
				}

				return toError(error, `Fetch request to ${urlPath} failed`);
			},
		).andThen((response) => {
			if (shouldRetry(response, attempt)) {
				// Exponential backoff with an equal jitter delay
				const exponentialDelay = retryDelay * 2 ** attempt;
				const delay = Math.min(
					exponentialDelay * JITTER_FACTOR + Math.random() * exponentialDelay * JITTER_FACTOR,
					maxRetryDelay,
				);
				logger.debug(
					{
						attempt: attempt + 1,
						delay,
						status: `${response.status} ${response.statusText}`,
					},
					`Retrying fetch request to ${urlPath}`,
				);

				return ResultAsync.fromPromise(
					new Promise((resolve) => setTimeout(resolve, delay)),
					(error) => toError(error, "Retry delay failed"),
				).andThen(() => executeFetchWithRetry(attempt + 1));
			}

			if (!response.ok) {
				const errorMessagePrefix = `HTTP error for ${urlPath}! status: ${response.status} ${response.statusText}`;

				return ResultAsync.fromPromise(response.text(), (error) =>
					toError(error, `${errorMessagePrefix}. Failed to fetch response body.`),
				).andThen((body) => {
					const errorMessage = body
						? `${errorMessagePrefix}: Response body: ${body}`
						: `${errorMessagePrefix}: Empty or unreadable response body`;

					return errAsync(new Error(errorMessage));
				});
			}

			return okAsync(response);
		});
	}

	const result = executeFetchWithRetry(0);

	const fetchResult: FetchWithRetryResult = result as FetchWithRetryResult;

	// extend the result with json helper method
	fetchResult.json = <U>() =>
		result.andThen((response) => {
			return ResultAsync.fromPromise(response.json() as Promise<U>, (error) =>
				toError(error, `Failed to parse response body as JSON for ${urlPath}`),
			);
		});

	return fetchResult;
}

const MAX_URL_LENGTH = 50;

function getSafeUrlPath(urlString: string): string {
	try {
		return new URL(urlString).pathname;
	} catch {
		// fallback for malformed URLs
		return urlString.length > MAX_URL_LENGTH
			? `${urlString.substring(0, MAX_URL_LENGTH)}...`
			: urlString;
	}
}
