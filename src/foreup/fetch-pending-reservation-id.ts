import type { ResultAsync } from "neverthrow";
import * as v from "valibot";
import {
	FOREUP_API_CONFIG,
	type GreenFeeString,
	SUNKEN_MEADOW_CONFIG,
	type TotalPlayersString,
} from "$/foreup/constants";
import { fetchWithRetry, parseResponseJson } from "$/utils/http";
import { logger } from "$/utils/logger";
import { formatValibotIssues, validateValibotSchema } from "$/utils/valibot";

const PENDING_RESERVATION_ID_REQUEST_URL = `${FOREUP_API_CONFIG.BASE_URL}/booking/pending_reservation`;

const PendingReservationIdResponseSchema = v.object({
	success: v.literal(true),
	reservation_id: v.pipe(v.string(), v.nonEmpty()),
});

export function fetchPendingReservationId({
	jwt,
	totalPlayersString,
	teeTimeIso,
	greenFeeString,
}: {
	jwt: string;
	totalPlayersString: TotalPlayersString;
	teeTimeIso: string;
	greenFeeString: GreenFeeString;
}): ResultAsync<string, Error> {
	const requestBody = {
		time: teeTimeIso,
		holes: `${SUNKEN_MEADOW_CONFIG.TOTAL_HOLES}`,
		players: totalPlayersString,
		carts: `${SUNKEN_MEADOW_CONFIG.ALLOW_CARTS}`,
		schedule_id: `${SUNKEN_MEADOW_CONFIG.SCHEDULE_ID}`,
		teesheet_side_id: `${SUNKEN_MEADOW_CONFIG.TEESHEET_SIDE_FRONT_ID}`,
		course_id: `${SUNKEN_MEADOW_CONFIG.COURSE_ID}`,
		booking_class_id: `${SUNKEN_MEADOW_CONFIG.BOOKING_CLASS_ID}`,
		duration: `${SUNKEN_MEADOW_CONFIG.DURATION}`,
		foreup_discount: `${SUNKEN_MEADOW_CONFIG.FOREUP_DISCOUNT}`,
		foreup_trade_discount_rate: `${SUNKEN_MEADOW_CONFIG.FOREUP_TRADE_DISCOUNT_RATE}`,
		trade_min_players: `${SUNKEN_MEADOW_CONFIG.TRADE_MIN_PLAYERS}`,
		cart_fee: `${SUNKEN_MEADOW_CONFIG.CART_FEE}`,
		cart_fee_tax: `${SUNKEN_MEADOW_CONFIG.CART_FEE_TAX}`,
		green_fee: greenFeeString,
		green_fee_tax: `${SUNKEN_MEADOW_CONFIG.GREEN_FEE_TAX}`,
	} as const;

	return fetchWithRetry(PENDING_RESERVATION_ID_REQUEST_URL, {
		method: "POST",
		headers: {
			...FOREUP_API_CONFIG.BASE_REQUEST_HEADERS,
			"Content-Type": "application/x-www-form-urlencoded",
			"X-Authorization": `Bearer ${jwt}`,
			"Api-Key": "no_limits",
		},
		body: new URLSearchParams(requestBody),
	})
		.andThen(parseResponseJson<unknown>)
		.andThen((jsonBody) => {
			logger.info({ jsonBody }, "Pending reservation id response");

			return validateValibotSchema(PendingReservationIdResponseSchema, jsonBody).mapErr(
				(issues) => {
					const formattedIssues = formatValibotIssues(issues);

					return new Error(
						`Invalid pending reservation id response: ${formattedIssues.join("\n")}`,
					);
				},
			);
		})
		.map((pendingReservationIdResponse) => pendingReservationIdResponse.reservation_id);
}
