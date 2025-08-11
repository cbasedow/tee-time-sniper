import { env } from "./env";
import { logger } from "./utils/logger";

logger.info(`Hello via Bun in ${env.NODE_ENV} mode!`);
