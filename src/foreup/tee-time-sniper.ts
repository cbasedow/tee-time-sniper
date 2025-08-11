import { Cron } from "croner";
import { EST_TIMEZONE } from "$/constants";
import { env } from "$/env";
import { logger } from "$/utils/logger";
import { bookReservation } from "./book-reservation";
import {
  type GreenFeeString,
  TEE_TIME_RELEASE_HOUR,
  type TeeTimeHoursMinutes,
  type TotalPlayers,
  type TotalPlayersString,
} from "./constants";
import { fetchJwt } from "./fetch-jwt";
import { fetchPendingReservationId } from "./fetch-pending-reservation-id";
import { getGreenFee } from "./get-green-fee";
import { getTeeTimeDetails } from "./get-tee-time-details";

const { FOREUP_EMAIL, FOREUP_PASSWORD } = env;

const MAX_RUNS = 1;
const BOOKING_DELAY_MS = 500;

export function startTeeTimeSniper(
  totalPlayers: TotalPlayers,
  teeTimeHoursMinutes: TeeTimeHoursMinutes,
): void {
  const { teeTimeDate, teeTimeIsoEst, teeTimeOneMonthAgoEst } =
    getTeeTimeDetails(teeTimeHoursMinutes);
  const greenFee = getGreenFee(teeTimeDate, teeTimeHoursMinutes);
  const greenFeeString = `${greenFee}` as GreenFeeString;
  const totalPriceUsd = greenFee * totalPlayers;
  const totalPlayersString = `${totalPlayers}` as TotalPlayersString;

  logger.info(
    {
      account: FOREUP_EMAIL,
      teeTime: teeTimeIsoEst,
      totalPlayers,
      greenFee,
      totalPriceUsd,
    },
    "Starting tee time sniper for Sunken Meadow",
  );

  let jwt: string | null = null;

  // fetch jwt at 6:59 PM EST
  new Cron(
    "59 18 * * *",
    {
      timezone: EST_TIMEZONE,
      maxRuns: MAX_RUNS,
    },
    async () => {
      const jwtResult = await fetchJwt(FOREUP_EMAIL, FOREUP_PASSWORD);

      if (jwtResult.isErr()) {
        logger.error(jwtResult.error, "Failed to fetch JWT from ForeUP");
        process.exit(1);
      }

      logger.info("Successfully fetched JWT from ForeUP");
      jwt = jwtResult.value;
    },
  );

  // fetch pending reservation id and book reservation at 7:00 PM EST
  new Cron(
    `0 ${TEE_TIME_RELEASE_HOUR} * * *`,
    {
      timezone: EST_TIMEZONE,
      maxRuns: MAX_RUNS,
    },
    async () => {
      if (!jwt) {
        logger.error(
          "ForeUP JWT token not found, skipping reservation booking",
        );
        process.exit(1);
      }

      // add slight delay to account for ForeUP posting delays
      await new Promise((resolve) => setTimeout(resolve, BOOKING_DELAY_MS));

      const pendingReservationIdResult = await fetchPendingReservationId({
        jwt,
        teeTimeIso: teeTimeIsoEst,
        totalPlayersString,
        greenFeeString,
      });

      if (pendingReservationIdResult.isErr()) {
        logger.error(
          pendingReservationIdResult.error,
          "Failed to fetch pending reservation ID from ForeUP",
        );
        process.exit(1);
      }

      logger.info("Successfully fetched pending reservation ID from ForeUP");

      const bookReservationIdResult = await bookReservation({
        jwt,
        pendingReservationId: pendingReservationIdResult.value,
        totalPriceUsd,
        totalPlayers,
        totalPlayersString,
        greenFee,
        teeTimeIso: teeTimeIsoEst,
        teeTimeOneMonthAgo: teeTimeOneMonthAgoEst,
      });

      if (bookReservationIdResult.isErr()) {
        logger.error(
          bookReservationIdResult.error,
          "Failed to book reservation from ForeUP",
        );
        process.exit(1);
      }

      logger.info(
        {
          reservationDetails: bookReservationIdResult.value,
        },
        "Successfully booked reservation from ForeUP",
      );
      process.exit(0);
    },
  );
}
