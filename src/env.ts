import * as v from "valibot";
import { formatValibotIssues, validateValibotSchema } from "./utils/valibot";

const envSchema = v.object({
	NODE_ENV: v.optional(v.literal("development"), "development"),
	// FOREUP_EMAIL: v.pipe(v.string(), v.nonEmpty(), v.email()),
	// FOREUP_PASSWORD: v.pipe(v.string(), v.nonEmpty()),
});

function validateEnv(env: NodeJS.ProcessEnv): v.InferOutput<typeof envSchema> {
	return validateValibotSchema(envSchema, env).match(
		(env) => env,
		(issues) => {
			const formattedIssues = formatValibotIssues(issues);

			throw new Error(`❌ Invalid environment variables:\n${formattedIssues.join("\n")}`);
		},
	);
}

export const env = validateEnv(process.env);
