import type { ResultAsync } from "neverthrow";
import * as v from "valibot";
import { env } from "$/env";
import { FOREUP_API_CONFIG, SUNKEN_MEADOW_CONFIG } from "$/foreup/constants";
import { fetchWithRetry, parseResponseJson } from "$/utils/http";
import { formatValibotIssues, validateValibotSchema } from "$/utils/valibot";

const LOGIN_REQUEST_URL = `${FOREUP_API_CONFIG.BASE_URL}/booking/users/login`;

const LOGIN_REQUEST_BODY = {
	username: env.FOREUP_EMAIL,
	password: env.FOREUP_PASSWORD,
	booking_class_id: "", // Don't need booking class id in login request
	api_key: "no_limits",
	course_id: `${SUNKEN_MEADOW_CONFIG.COURSE_ID}`,
} as const;

const LoginResponseSchema = v.object({
	jwt: v.pipe(v.string(), v.nonEmpty()), // we only care about the jwt from the response
});

export function fetchJwt(): ResultAsync<string, Error> {
	return fetchWithRetry(LOGIN_REQUEST_URL, {
		method: "POST",
		headers: {
			...FOREUP_API_CONFIG.BASE_REQUEST_HEADERS,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams(LOGIN_REQUEST_BODY),
	})
		.andThen(parseResponseJson<unknown>)
		.andThen((jsonBody) =>
			validateValibotSchema(LoginResponseSchema, jsonBody).mapErr((issues) => {
				const formattedIssues = formatValibotIssues(issues);

				return new Error(`Invalid login response: ${formattedIssues.join("\n")}`);
			}),
		)
		.map((loginResult) => loginResult.jwt);
}
