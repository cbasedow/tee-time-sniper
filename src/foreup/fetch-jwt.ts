import type { ResultAsync } from "neverthrow";
import * as v from "valibot";
import { fetchWithRetry } from "$/utils/http";
import { formatValibotIssues, validateValibotSchema } from "$/utils/valibot";
import { FOREUP_API_CONFIG, SUNKEN_MEADOW_CONFIG } from "./constants";

const LOGIN_REQUEST_URL = `${FOREUP_API_CONFIG.baseUrl}/booking/users/login`;

const loginResponseSchema = v.object({
	jwt: v.pipe(v.string(), v.nonEmpty()),
});

export function fetchJwt(email: string, password: string): ResultAsync<string, Error> {
	const requestBody = {
		username: email,
		password,
		booking_class_id: "",
		api_key: FOREUP_API_CONFIG.apiKey,
		course_id: `${SUNKEN_MEADOW_CONFIG.courseId}`,
	} as const;

	return fetchWithRetry(LOGIN_REQUEST_URL, {
		method: "POST",
		headers: {
			...FOREUP_API_CONFIG.baseRequestHeaders,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams(requestBody),
	})
		.json<unknown>()
		.andThen((json) =>
			validateValibotSchema(loginResponseSchema, json).mapErr((issues) => {
				const formattedIssues = formatValibotIssues(issues);

				return new Error(`Invalid ForeUP login response: ${formattedIssues.join("\n")}`);
			}),
		)
		.map(({ jwt }) => jwt);
}
