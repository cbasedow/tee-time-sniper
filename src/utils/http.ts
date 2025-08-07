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

const JITTER_FACTOR = 0.5;

export function fetchWithRetry(
	url: string,
	options: FetchWithRetryOptions,
): ResultAsync<Response, Error> {
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

		// Retry on server errors and rate limiting
		return response.status >= 500 || response.status === 429;
	}

	function executeFetchWithRetry(attempt: number): ResultAsync<Response, Error> {
		const signal = timeout ? AbortSignal.timeout(timeout) : undefined;

		return ResultAsync.fromPromise(
			fetch(url, {
				...fetchOptions,
				signal,
			}),
			(error) => {
				if (error instanceof DOMException && error.name === "TimeoutError") {
					return new Error(`Request timed out after ${timeout}ms`);
				}

				return toError(error, `Fetch request to ${url} failed`);
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
					"Retrying fetch request",
				);

				return ResultAsync.fromPromise(
					new Promise((resolve) => setTimeout(resolve, delay)),
					(error) => toError(error, "Retry delay failed"),
				).andThen(() => executeFetchWithRetry(attempt + 1));
			}

			if (!response.ok) {
				const errorMessagePrefix = `HTTP error! status: ${response.status} ${response.statusText}`;

				return ResultAsync.fromPromise(response.text(), (error) =>
					toError(error, `${errorMessagePrefix}. Failed to fetch response body.`),
				).andThen((body) => {
					return errAsync(new Error(`${errorMessagePrefix}: Response body: ${body}`));
				});
			}

			return okAsync(response);
		});
	}

	return executeFetchWithRetry(0);
}

export function parseResponseJson<T>(response: Response): ResultAsync<T, Error> {
	return ResultAsync.fromPromise(response.json() as Promise<T>, (error) =>
		toError(error, "Failed to parse response body as JSON"),
	);
}
