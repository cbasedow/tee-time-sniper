import * as p from "@clack/prompts";
import { ResultAsync } from "neverthrow";
import {
	SUNKEN_MEADOW_CONFIG,
	type TeeTimeHoursMinutes,
	type TotalPlayers,
} from "$/foreup/constants";
import { toError } from "$/utils/error";
import { logger } from "$/utils/logger";

type StartTeeTimeSniperParams = {
	totalPlayers: TotalPlayers;
	teeTimeHoursMinutes: TeeTimeHoursMinutes;
};

const totalPlayersOptions: p.Option<TotalPlayers>[] = SUNKEN_MEADOW_CONFIG.totalPlayersArray.map(
	(t) => ({
		value: t,
		label: `${t}`,
	}),
);

const teeTimeOptions = SUNKEN_MEADOW_CONFIG.teeTimeHoursMinutes.map((t) => ({
	value: t,
	label: `${t}`,
})) satisfies p.Option<string>[];

export function getUserTeeTimeInput(): ResultAsync<StartTeeTimeSniperParams, Error> {
	return ResultAsync.fromPromise(
		p.group(
			{
				totalPlayers: () =>
					p.select({
						message: "How many players are you booking for?",
						options: totalPlayersOptions,
					}),
				teeTimeHoursMinutes: () =>
					p.select<string>({
						message: "What time are you booking for?",
						options: teeTimeOptions,
					}) as Promise<TeeTimeHoursMinutes>,
			},
			{
				onCancel: () => {
					logger.info("User cancelled the prompt");
					process.exit(0);
				},
			},
		),
		(error) => toError(error, "Failed to get user tee time input"),
	);
}
