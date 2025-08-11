import { err, ok, type Result } from "neverthrow";
import * as v from "valibot";

export type AnyValibotSchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
export type AnyValibotIssue = v.BaseIssue<unknown>;

export function formatValibotIssues(issues: AnyValibotIssue[]): string[] {
	return issues.map((issue) => {
		const pathString = issue.path
			?.map((p) => String(p.key))
			.filter(Boolean)
			.join(".");

		const message = pathString ? `${pathString}: ${issue.message}` : issue.message;

		return `- ${message}`;
	});
}

export function validateValibotSchema<T extends AnyValibotSchema>(
	schema: T,
	data: unknown,
): Result<v.InferOutput<T>, v.InferIssue<T>[]> {
	const result = v.safeParse(schema, data);

	if (!result.success) {
		return err(result.issues);
	}

	return ok(result.output);
}
