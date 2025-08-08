# Tee Time Sniper

This project is an automated command-line tool for booking golf tee times from the Foreup booking system, specifically for **Sunken Meadow State Park**. It's designed to be highly performant by fetching authentication tokens and pre-calculating booking information just before the booking window opens, ensuring the highest chance of success.

## Features

-   **Automated Booking:** Schedules cron jobs to snipe tee times at the precise moment they become available.
-   **Interactive CLI:** Provides a user-friendly way to select the number of players and desired tee time.
-   **Timezone-Aware:** All date and time calculations are robustly anchored to the target's timezone (`America/New_York`), ensuring accuracy regardless of where the script is run.
-   **Performant:** Implements a two-stage process:
    1.  **Preparation (6:59 PM EST):** Fetches the authentication JWT and computes all necessary booking details.
    2.  **Execution (7:00 PM EST):** Makes the final booking request with pre-calculated data to minimize latency.
-   **Type-Safe:** Written entirely in TypeScript with modern best practices for robust and predictable code.

## Tech Stack

The sniper is built with a modern, type-safe stack:

-   **Runtime:** [Bun](https://bun.sh/) as the all-in-one JavaScript runtime, bundler, and package manager.
-   **Scheduling:** [Croner](https://github.com/Hexagon/croner) for robust, timezone-aware job scheduling.
-   **Logging:** [Pino](https://getpino.io/) for high-performance, structured JSON logging.
-   **CLI Prompts:** [@clack/prompts](https://github.com/natemoo-re/clack) for a beautiful and interactive user experience.
-   **Error Handling:** [neverthrow](https://github.com/supermacro/neverthrow) for explicit and type-safe error handling, avoiding runtime exceptions.
-   **Date & Time:** [date-fns](https://date-fns.org/) and [date-fns-tz](https://github.com/marnusw/date-fns-tz) for reliable and timezone-safe date manipulations.
-   **Validation:** [Valibot](https://valibot.dev/) for parsing and validating environment variables and ForeUP API data.

---

## Disclaimer

**This project was created for educational purposes only.** It serves as a demonstration of advanced concepts in automation, asynchronous programming, and timezone handling in TypeScript. It is not intended for real-world use. Using automated scripts or "bots" may violate the terms of service of the target website. The author is not responsible for any consequences, such as account suspension or other penalties, that may arise from using this software. **Use at your own risk.**
