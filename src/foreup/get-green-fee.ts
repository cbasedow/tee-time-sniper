import { formatInTimeZone } from "date-fns-tz";
import { EST_TIMEZONE } from "$/constants";
import { type GreenFee, SUNKEN_MEADOW_CONFIG, type TeeTimeHoursMinutes } from "./constants";

const { GREEN_FEES, TWILIGHT_START_TIME } = SUNKEN_MEADOW_CONFIG;

const WEEKEND_DAYS_ISO = new Set<number>([6, 7]); // Sunday and Saturday

export function getGreenFee(teeTimeDate: Date, teeTimeHoursMinutes: TeeTimeHoursMinutes): GreenFee {
	const isTwilight = teeTimeHoursMinutes >= TWILIGHT_START_TIME;

	// Get the day of the week as an ISO number (1-7) in EST
	const teeTimeDayOfWeekIso = Number(formatInTimeZone(teeTimeDate, EST_TIMEZONE, "i"));

	if (WEEKEND_DAYS_ISO.has(teeTimeDayOfWeekIso)) {
		return isTwilight ? GREEN_FEES.WEEKEND_TWILIGHT : GREEN_FEES.WEEKEND;
	}

	return isTwilight ? GREEN_FEES.WEEKDAY_TWILIGHT : GREEN_FEES.WEEKDAY;
}
