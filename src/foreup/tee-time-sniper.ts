import { Cron } from "croner";
import { logger } from "$/utils/logger";
import { bookReservation } from "./book-reservation";
import type {
	GreenFee,
	GreenFeeString,
	TeeTimeHoursMinutes,
	TotalPlayers,
	TotalPlayersString,
} from "./constants";
import { fetchJwt } from "./fetch-jwt";
import { fetchPendingReservationId } from "./fetch-pending-reservation-id";
import { getGreenFee } from "./get-green-fee";
import { getTeeTimeDetails } from "./get-tee-time-details";

export type StartTeeTimeSniperParams = {
	totalPlayers: TotalPlayers;
	teeTimeHoursMinutes: TeeTimeHoursMinutes;
};

type BookingContext = {
	teeTimeIsoEst: string;
	teeTimeOneMonthAgoEst: number;
	greenFee: GreenFee;
	greenFeeString: GreenFeeString;
	totalPriceUsd: number;
};

function computeBookingContext(
	teeTimeHoursMinutes: TeeTimeHoursMinutes,
	totalPlayers: TotalPlayers,
): BookingContext {
	const { teeTimeDate, teeTimeIsoEst, teeTimeOneMonthAgoEst } =
		getTeeTimeDetails(teeTimeHoursMinutes);
	const greenFee = getGreenFee(teeTimeDate, teeTimeHoursMinutes);
	const totalPriceUsd = greenFee * totalPlayers;

	return {
		teeTimeIsoEst,
		teeTimeOneMonthAgoEst,
		greenFee,
		greenFeeString: `${greenFee}`,
		totalPriceUsd,
	};
}

export function startTeeTimeSniper({
	totalPlayers,
	teeTimeHoursMinutes,
}: StartTeeTimeSniperParams): void {
	const totalPlayersString = `${totalPlayers}` as TotalPlayersString;

	let jwt: string | null = null;
	let bookingContext: BookingContext | null = null;

	// Fetch JWT token at 6:59 PM EST
	new Cron(
		"59 18 * * *",
		{
			timezone: "America/New_York",
			maxRuns: 1,
		},
		async () => {
			logger.info("Fetching JWT token from Foreup...");
			const jwtResult = await fetchJwt();

			if (jwtResult.isErr()) {
				logger.error(jwtResult.error, "Failed to fetch JWT token from Foreup");
				process.exit(1);
			}

			logger.info("Successfully fetched JWT token from Foreup");
			jwt = jwtResult.value;
			bookingContext = computeBookingContext(teeTimeHoursMinutes, totalPlayers);
		},
	);

	// Book reservation at 7:00 PM EST
	new Cron(
		"0 19 * * *",
		{
			timezone: "America/New_York",
			maxRuns: 1,
		},
		async () => {
			if (!jwt) {
				logger.error("JWT token not found, skipping reservation booking");
				process.exit(1);
			}

			// This should never happen, but just in case
			if (!bookingContext) {
				bookingContext = computeBookingContext(teeTimeHoursMinutes, totalPlayers);
			}

			const { teeTimeIsoEst, teeTimeOneMonthAgoEst, greenFee, greenFeeString, totalPriceUsd } =
				bookingContext;

			// Add slight delay to account for ForeUP posting delays
			await new Promise((resolve) => setTimeout(resolve, 500));

			const pendingReservationIdResult = await fetchPendingReservationId({
				jwt,
				totalPlayersString,
				teeTimeIso: teeTimeIsoEst,
				greenFeeString,
			});

			if (pendingReservationIdResult.isErr()) {
				logger.error(pendingReservationIdResult.error, "Failed to fetch pending reservation ID");
				process.exit(1);
			}

			logger.info("Successfully fetched pending reservation ID, booking reservation...");

			const bookReservationResult = await bookReservation({
				jwt,
				pendingReservationId: pendingReservationIdResult.value,
				totalPriceUsd,
				totalPlayers,
				totalPlayersString,
				greenFee,
				teeTimeOneMonthAgo: teeTimeOneMonthAgoEst,
				teeTimeIso: teeTimeIsoEst,
			});

			if (bookReservationResult.isErr()) {
				logger.error(bookReservationResult.error, "Failed to book reservation");
				process.exit(1);
			}

			const { time } = bookReservationResult.value;

			logger.info(
				{
					time,
					totalPlayers,
					totalPriceUsd,
				},
				"Successfully booked reservation",
			);

			process.exit(0);
		},
	);
}
