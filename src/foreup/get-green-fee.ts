import { formatInTimeZone } from "date-fns-tz";
import { EST_TIMEZONE } from "$/constants";
import { type GreenFee, SUNKEN_MEADOW_CONFIG, type TeeTimeHoursMinutes } from "./constants";

const { greenFees, twilightStartTime } = SUNKEN_MEADOW_CONFIG;

const WEEKEND_DAYS_ISO = new Set([6, 7]);

export function getGreenFee(teeTimeDate: Date, teeTimeHoursMinutes: TeeTimeHoursMinutes): GreenFee {
	const isTwilight = teeTimeHoursMinutes >= twilightStartTime;

	const teeTimeDayOfWeekIso = Number(formatInTimeZone(teeTimeDate, EST_TIMEZONE, "i"));

	if (WEEKEND_DAYS_ISO.has(teeTimeDayOfWeekIso)) {
		return isTwilight ? greenFees.weekendTwilight : greenFees.weekend;
	}

	return isTwilight ? greenFees.weekdayTwilight : greenFees.weekday;
}
