import { addDays, addMonths, setHours, setMinutes } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { EST_TIMEZONE } from "$/constants";
import { TEE_TIME_RELEASE_HOUR, type TeeTimeHoursMinutes } from "./constants";

type TeeTimeDetails = {
	teeTimeDate: Date;
	teeTimeIsoEst: string; // e.g "2025-08-12 14:30"
	teeTimeOneMonthAgoEst: number; // e.g 202507121430
};

// this gets the tee time details for the next available targeted tee time date in EST timezone
// it allows the user to run the sniper in a different timezone but keep EST calculations
export function getTeeTimeDetails(teeTimeHoursMinutes: TeeTimeHoursMinutes): TeeTimeDetails {
	const hours = Number(teeTimeHoursMinutes.slice(0, 2));
	const minutes = Number(teeTimeHoursMinutes.slice(2));

	const currDateEst = toZonedTime(new Date(), EST_TIMEZONE);
	// get the current hour in EST timezone e.g. 7PM EST = 19
	const currHourEst = Number(formatInTimeZone(currDateEst, EST_TIMEZONE, "H"));

	const currDateWithTeeTimeEst = setMinutes(setHours(currDateEst, hours), minutes);

	// add 7 or 8 days to the current date with the tee time to get the next available tee time
	// if the current hour is after 7PM EST, the next available tee time is 8 days away
	// e.g. sniper starts at Friday 730 PM, next available chance to snipe is Saturday 7PM
	const teeTimeDate = addDays(currDateWithTeeTimeEst, currHourEst >= TEE_TIME_RELEASE_HOUR ? 8 : 7);

	// get the tee time date one month ago (this is for the startFrontTime field in bookReservation request)
	const teeTimeDateLastMonth = addMonths(teeTimeDate, -1);

	const teeTimeIsoEst = formatInTimeZone(teeTimeDate, EST_TIMEZONE, "yyyy-MM-dd HH:mm");
	const teeTimeOneMonthAgoEst = formatInTimeZone(
		teeTimeDateLastMonth,
		EST_TIMEZONE,
		"yyyyMMddHHmm",
	);

	return {
		teeTimeDate,
		teeTimeIsoEst,
		teeTimeOneMonthAgoEst: Number(teeTimeOneMonthAgoEst),
	};
}
