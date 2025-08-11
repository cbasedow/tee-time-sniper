import pino from "pino";

export const logger = pino({
	level: "info",
	serializers: {
		err: pino.stdSerializers.err,
		error: pino.stdSerializers.err,
		req: pino.stdSerializers.req,
		res: pino.stdSerializers.res,
	},
	timestamp: pino.stdTimeFunctions.isoTime,
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			ignore: "pid,hostname",
			translateTime: "SYS:HH:MM:ss.l",
		},
	},
});
