export function toError(error: unknown, context?: string): Error {
	if (error instanceof Error) {
		return context ? new Error(`${context}: ${error.message}`, { cause: error }) : error;
	}

	let errorMessage: string;

	if (typeof error === "object" && error !== null) {
		if ("message" in error && typeof error.message === "string") {
			errorMessage = error.message;
		} else {
			try {
				errorMessage = JSON.stringify(error);
			} catch {
				errorMessage = String(error);
			}
		}
	} else {
		errorMessage = String(error);
	}

	const finalMessage = context ? `${context}: ${errorMessage}` : errorMessage;

	return new Error(finalMessage, { cause: error });
}
