import { getUserTeeTimeInput } from "./cli/get-user-tee-time-input";
import { startTeeTimeSniper } from "./foreup/tee-time-sniper";
import { toError } from "./utils/error";
import { logger } from "./utils/logger";
import "./env"; // validate env vars before starting

async function main(): Promise<void> {
	try {
		const userInputResult = await getUserTeeTimeInput();

		if (userInputResult.isErr()) {
			logger.error(userInputResult.error);
			process.exit(1);
		}

		const { totalPlayers, teeTimeHoursMinutes } = userInputResult.value;

		startTeeTimeSniper(totalPlayers, teeTimeHoursMinutes);
	} catch (error) {
		logger.error(toError(error, "An unexpected error occurred"));
		process.exit(1);
	}
}

main();
