import type { ResultAsync } from "neverthrow";
import * as v from "valibot";
import { fetchWithRetry } from "$/utils/http";
import { formatValibotIssues, validateValibotSchema } from "$/utils/valibot";
import {
	FOREUP_API_CONFIG,
	type GreenFeeString,
	SUNKEN_MEADOW_CONFIG,
	type TotalPlayersString,
} from "./constants";

const PENDING_RESERVATION_ID_REQUEST_URL = `${FOREUP_API_CONFIG.baseUrl}/booking/pending_reservation`;

const BASE_REQUEST_BODY = {
	holes: `${SUNKEN_MEADOW_CONFIG.totalHoles}`,
	carts: `${SUNKEN_MEADOW_CONFIG.allowCarts}`,
	schedule_id: `${SUNKEN_MEADOW_CONFIG.scheduleId}`,
	teesheet_side_id: `${SUNKEN_MEADOW_CONFIG.teesheetSideFrontId}`,
	course_id: `${SUNKEN_MEADOW_CONFIG.courseId}`,
	booking_class_id: `${SUNKEN_MEADOW_CONFIG.bookingClassId}`,
	duration: `${SUNKEN_MEADOW_CONFIG.duration}`,
	foreup_discount: `${SUNKEN_MEADOW_CONFIG.foreUpDiscount}`,
	foreup_trade_discount_rate: `${SUNKEN_MEADOW_CONFIG.foreUpTradeDiscountRate}`,
	trade_min_players: `${SUNKEN_MEADOW_CONFIG.tradeMinPlayers}`,
	cart_fee: `${SUNKEN_MEADOW_CONFIG.cartFee}`,
	cart_fee_tax: `${SUNKEN_MEADOW_CONFIG.cartFeeTax}`,
	green_fee_tax: `${SUNKEN_MEADOW_CONFIG.greenFeeTax}`,
} as const;

const pendingReservationResponseSchema = v.object({
	success: v.literal(true),
	reservation_id: v.pipe(v.string(), v.nonEmpty()),
});

export function fetchPendingReservationId({
	jwt,
	teeTimeIso,
	totalPlayersString,
	greenFeeString,
}: {
	jwt: string;
	teeTimeIso: string;
	totalPlayersString: TotalPlayersString;
	greenFeeString: GreenFeeString;
}): ResultAsync<string, Error> {
	const requestBody = {
		...BASE_REQUEST_BODY,
		time: teeTimeIso,
		players: totalPlayersString,
		green_fee: greenFeeString,
	} as const;

	return fetchWithRetry(PENDING_RESERVATION_ID_REQUEST_URL, {
		method: "POST",
		headers: {
			...FOREUP_API_CONFIG.baseRequestHeaders,
			"Content-Type": "application/x-www-form-urlencoded",
			"X-Authorization": `Bearer ${jwt}`,
			"Api-Key": FOREUP_API_CONFIG.apiKey,
		},
		body: new URLSearchParams(requestBody),
	})
		.json<unknown>()
		.andThen((json) =>
			validateValibotSchema(pendingReservationResponseSchema, json).mapErr((issues) => {
				const formattedIssues = formatValibotIssues(issues);

				return new Error(
					`Invalid ForeUP pending reservation response: ${formattedIssues.join("\n")}`,
				);
			}),
		)
		.map(({ reservation_id }) => reservation_id);
}
