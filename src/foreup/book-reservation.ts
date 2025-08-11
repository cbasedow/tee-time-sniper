import type { ResultAsync } from "neverthrow";
import * as v from "valibot";
import type { GreenFee, TotalPlayers, TotalPlayersString } from "$/foreup/constants";
import { FOREUP_API_CONFIG, SUNKEN_MEADOW_CONFIG } from "$/foreup/constants";
import { fetchWithRetry } from "$/utils/http";
import { formatValibotIssues, validateValibotSchema } from "$/utils/valibot";

const BOOK_RESERVATION_REQUEST_URL = `${FOREUP_API_CONFIG.baseUrl}/booking/users/reservations`;

const bookReservationResponseBodySchema = v.object({
	teetime_id: v.pipe(v.string(), v.nonEmpty()),
	time: v.pipe(v.string(), v.nonEmpty()),
	holes: v.literal(SUNKEN_MEADOW_CONFIG.totalHoles),
	player_count: v.picklist(SUNKEN_MEADOW_CONFIG.totalPlayersArray),
	schedule_id: v.literal(SUNKEN_MEADOW_CONFIG.scheduleId),
	teesheet_title: v.literal(SUNKEN_MEADOW_CONFIG.scheduleName),
	course_name: v.literal(SUNKEN_MEADOW_CONFIG.name),
	course_id: v.literal(SUNKEN_MEADOW_CONFIG.courseId),
	details: v.string(),
});

export function bookReservation({
	jwt,
	pendingReservationId,
	totalPriceUsd,
	totalPlayers,
	totalPlayersString,
	greenFee,
	teeTimeIso,
	teeTimeOneMonthAgo,
}: {
	jwt: string;
	pendingReservationId: string;
	totalPriceUsd: number;
	totalPlayers: TotalPlayers;
	totalPlayersString: TotalPlayersString;
	greenFee: GreenFee;
	teeTimeIso: string;
	teeTimeOneMonthAgo: number;
}): ResultAsync<v.InferOutput<typeof bookReservationResponseBodySchema>, Error> {
	const requestBody = {
		airQuotesCart: [
			{
				description: "Green Fee",
				price: greenFee,
				subtotal: totalPriceUsd,
				type: "item",
				quantity: totalPlayers,
			},
		],
		allow_mobile_checkin: 0,
		allowed_group_sizes: ["1", "2", "3", "4"],
		available_duration: null,
		available_spots: totalPlayers,
		available_spots_18: totalPlayers,
		available_spots_9: 0,
		availableHoles: `${SUNKEN_MEADOW_CONFIG.totalHoles}`,
		blockReservationDueToExistingReservation: false,
		booking_class_id: `${SUNKEN_MEADOW_CONFIG.bookingClassId}`,
		booking_fee_per_person: false,
		booking_fee_price: false,
		booking_fee_required: false,
		captchaid: "",
		cart_fee: SUNKEN_MEADOW_CONFIG.cartFee,
		cart_fee_18: SUNKEN_MEADOW_CONFIG.cartFee,
		cart_fee_9: SUNKEN_MEADOW_CONFIG.cartFee,
		cart_fee_tax: SUNKEN_MEADOW_CONFIG.cartFeeTax,
		cart_fee_tax_18: SUNKEN_MEADOW_CONFIG.cartFeeTax,
		cart_fee_tax_9: SUNKEN_MEADOW_CONFIG.cartFeeTax,
		cart_fee_tax_rate: false,
		carts: SUNKEN_MEADOW_CONFIG.allowCarts,
		course_id: SUNKEN_MEADOW_CONFIG.courseId,
		course_name: SUNKEN_MEADOW_CONFIG.name,
		customer_message: "",
		details: "",
		discount: 0,
		discount_percent: 0,
		duration: SUNKEN_MEADOW_CONFIG.duration,
		estimatedTax: 0,
		foreup_discount: SUNKEN_MEADOW_CONFIG.foreUpDiscount,
		foreup_trade_discount_information: [],
		foreup_trade_discount_rate: SUNKEN_MEADOW_CONFIG.foreUpTradeDiscountRate,
		green_fee: greenFee,
		green_fee_18: greenFee,
		green_fee_9: 0,
		green_fee_tax: SUNKEN_MEADOW_CONFIG.greenFeeTax,
		green_fee_tax_18: SUNKEN_MEADOW_CONFIG.greenFeeTax,
		green_fee_tax_9: SUNKEN_MEADOW_CONFIG.greenFeeTax,
		green_fee_tax_rate: false,
		group_id: false,
		guest_cart_fee: SUNKEN_MEADOW_CONFIG.cartFee,
		guest_cart_fee_18: SUNKEN_MEADOW_CONFIG.cartFee,
		guest_cart_fee_9: SUNKEN_MEADOW_CONFIG.cartFee,
		guest_cart_fee_tax: SUNKEN_MEADOW_CONFIG.cartFeeTax,
		guest_cart_fee_tax_18: SUNKEN_MEADOW_CONFIG.cartFeeTax,
		guest_cart_fee_tax_9: SUNKEN_MEADOW_CONFIG.cartFeeTax,
		guest_cart_fee_tax_rate: false,
		guest_green_fee: greenFee,
		guest_green_fee_18: greenFee,
		guest_green_fee_9: 0,
		guest_green_fee_tax: SUNKEN_MEADOW_CONFIG.greenFeeTax,
		guest_green_fee_tax_18: SUNKEN_MEADOW_CONFIG.greenFeeTax,
		guest_green_fee_tax_9: SUNKEN_MEADOW_CONFIG.greenFeeTax,
		guest_green_fee_tax_rate: false,
		has_special: false,
		holes: `${SUNKEN_MEADOW_CONFIG.totalHoles}`,
		increment_amount: null,
		maximum_players_per_booking: "4",
		minimum_players: "1",
		notes: [],
		paid_player_count: 0,
		pay_carts: 0,
		pay_online: "no",
		pay_players: totalPlayersString,
		pay_subtotal: totalPriceUsd,
		pay_total: totalPriceUsd,
		pending_reservation_id: pendingReservationId,
		player_list: false,
		players: totalPlayersString,
		preTaxSubtotal: totalPriceUsd,
		promo_code: "",
		promo_discount: 0,
		purchased: false,
		rate_type: "walking",
		require_credit_card: false,
		reround_teeshot_side_id: SUNKEN_MEADOW_CONFIG.teesheetSideBackId,
		reround_teeshot_side_name: "Back",
		schedule_id: SUNKEN_MEADOW_CONFIG.scheduleId,
		schedule_name: SUNKEN_MEADOW_CONFIG.scheduleName,
		special_discount_percentage: 0,
		special_id: false,
		special_was_price: null,
		start_front: teeTimeOneMonthAgo,
		subtotal: totalPriceUsd,
		teesheet_holes: SUNKEN_MEADOW_CONFIG.totalHoles,
		teesheet_id: SUNKEN_MEADOW_CONFIG.scheduleId,
		teesheet_side_id: SUNKEN_MEADOW_CONFIG.teesheetSideFrontId,
		teesheet_side_name: "Front",
		teesheet_side_order: 1,
		time: teeTimeIso,
		total: totalPriceUsd,
		trade_available_players: 0,
		trade_cart_requirement: "both",
		trade_hole_requirement: "all",
		trade_min_players: SUNKEN_MEADOW_CONFIG.tradeMinPlayers,
	} as const;

	return fetchWithRetry(BOOK_RESERVATION_REQUEST_URL, {
		method: "POST",
		headers: {
			...FOREUP_API_CONFIG.baseRequestHeaders,
			"Content-Type": "application/json",
			"X-Authorization": `Bearer ${jwt}`,
			"Api-Key": FOREUP_API_CONFIG.apiKey,
		},
		body: JSON.stringify(requestBody),
	})
		.json<unknown>()
		.andThen((json) =>
			validateValibotSchema(bookReservationResponseBodySchema, json).mapErr((issues) => {
				const formattedIssues = formatValibotIssues(issues);

				return new Error(`Invalid ForeUP book reservation response: ${formattedIssues.join("\n")}`);
			}),
		);
}
