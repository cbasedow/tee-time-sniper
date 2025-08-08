import { getUserTeeTimeInput, UserCancelledPromptError } from "./cli/get-user-tee-time-input";
import { env } from "./env";
import { startTeeTimeSniper } from "./foreup/tee-time-sniper";
import { logger } from "./utils/logger";

async function main() {
	try {
		const userInputResult = await getUserTeeTimeInput();

		if (userInputResult.isErr()) {
			const error = userInputResult.error;

			if (error instanceof UserCancelledPromptError) {
				logger.info("User cancelled the prompt");
				process.exit(0);
			}

			throw error;
		}

		const { totalPlayers, teeTimeHoursMinutes } = userInputResult.value;

		logger.info(
			{
				email: env.FOREUP_EMAIL,
				totalPlayers,
				teeTimeHoursMinutes,
			},
			"Starting tee time sniper",
		);
		return startTeeTimeSniper({ totalPlayers, teeTimeHoursMinutes });
	} catch (error) {
		logger.error(error, "An unexpected error occurred");
		process.exit(1);
	}
}

main();
