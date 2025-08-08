import { addDays, addMonths, setHours, setMinutes } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { EST_TIMEZONE } from "$/constants";
import type { TeeTimeHoursMinutes } from "./constants";

type TeeTimeDetails = {
	teeTimeDate: Date;
	teeTimeIsoEst: string;
	teeTimeOneMonthAgoEst: number;
};

export function getTeeTimeDetails(teeTimeHoursMinutes: TeeTimeHoursMinutes): TeeTimeDetails {
	const hours = Number(teeTimeHoursMinutes.slice(0, 2));
	const minutes = Number(teeTimeHoursMinutes.slice(2));

	const currDateEst = toZonedTime(new Date(), EST_TIMEZONE);
	const currDateWithTeeTimeEst = setMinutes(setHours(currDateEst, hours), minutes);

	// Add 7 days to the current date with the tee time
	const teeTimeDate = addDays(currDateWithTeeTimeEst, 7);
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
