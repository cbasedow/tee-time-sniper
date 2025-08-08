import * as p from "@clack/prompts";
import { ResultAsync } from "neverthrow";
import {
	SUNKEN_MEADOW_CONFIG,
	type TeeTimeHoursMinutes,
	type TotalPlayers,
} from "$/foreup/constants";
import type { StartTeeTimeSniperParams } from "$/foreup/tee-time-sniper";
import { toError } from "$/utils/error";

export class UserCancelledPromptError extends Error {
	constructor() {
		super("User cancelled the prompt");
	}
}

const totalPlayersOptions: p.Option<TotalPlayers>[] = SUNKEN_MEADOW_CONFIG.TOTAL_PLAYERS_ARRAY.map(
	(t) => ({
		value: t,
		label: `${t}`,
	}),
);

const teeTimeOptions = SUNKEN_MEADOW_CONFIG.TEE_TIME_HOURS_MINUTES.map((t) => ({
	value: t,
	label: `${t}`,
})) satisfies p.Option<string>[];

export function getUserTeeTimeInput(): ResultAsync<
	StartTeeTimeSniperParams,
	Error | UserCancelledPromptError
> {
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
					throw new UserCancelledPromptError();
				},
			},
		),
		(error) => {
			if (error instanceof UserCancelledPromptError) {
				return error;
			}

			return toError(error, "Failed to get user tee time input");
		},
	);
}
