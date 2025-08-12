# Tee Time Sniper

An automated golf tee time booking system designed for competitive reservation sniping on the ForeUP platform, specifically targeting Sunken Meadow State Park.

## Overview

This application demonstrates a sophisticated automation system that books golf tee times the moment they become available. ForeUP releases tee times every day at 7:00 PM EST for dates exactly one week out, creating a highly competitive booking environment where milliseconds matter.

## How It Works

### 1. Interactive Setup

- **CLI Prompts**: Uses Clack prompts for user-friendly selection of player count (1-4) and desired tee time
- **Dynamic Pricing**: Automatically calculates green fees based on weekday/weekend and twilight pricing
- **Smart Date Logic**: Determines target booking date using timezone-aware calculations (7 or 8 days out depending on current time)

### 2. Pre-Competition Optimization

- **Pre-computed Context**: All calculations (pricing, dates, API payloads) happen at startup for maximum speed
- **JWT Pre-fetch**: Authenticates with ForeUP at 6:59 PM EST to avoid authentication delays during booking window
- **Strategic Timing**: 500ms delay accounts for ForeUP's internal posting delays

### 3. Competitive Execution

- **Precision Scheduling**: Cron jobs execute at exact EST times regardless of server timezone
- **Lightning-Fast Booking**: Two-step process (pending reservation + confirmation) with pre-computed data
- **Fail-Fast Design**: Single attempt execution - if unsuccessful, other bots likely succeeded

## Technical Stack

- **Runtime**: [Bun](https://bun.sh) for fast JavaScript execution
- **Language**: [TypeScript](https://www.typescriptlang.org) with strict type safety
- **Scheduling**: [Croner](https://github.com/hexagon/croner) for timezone-aware cron jobs
- **Date Handling**: [date-fns](https://date-fns.org)/[date-fns-tz](https://github.com/marnusw/date-fns-tz) for reliable EST timezone calculations
- **HTTP**: Custom retry logic with exponential backoff and jitter
- **Validation**: [Valibot](https://valibot.dev) for runtime API response and environment variable validation
- **Error Handling**: [Neverthrow](https://github.com/supermacro/neverthrow) for functional error management
- **Logging**: [Pino](https://getpino.io) with structured logging
- **CLI**: [Clack](https://github.com/natemoo-re/clack) for interactive prompts
- **Code Quality**: [Biome](https://biomejs.dev) for linting and formatting

## Architecture Highlights

### Competitive Optimizations

- **One-Shot Execution**: Designed to run once and exit (success or failure)
- **Pre-computed Everything**: Zero calculation overhead during critical booking window
- **Timezone Precision**: All timing logic uses EST regardless of deployment location
- **Resource Cleanup**: Proper process exit codes for monitoring and automation

### Error Resilience

- **Robust HTTP Client**: Handles network failures, timeouts, and rate limiting
- **Input Validation**: Runtime validation of all API responses
- **Graceful Degradation**: Clear error messages and proper exit codes
- **Environment Validation**: Fail-fast on missing credentials

### Code Quality

- **Type Safety**: Comprehensive TypeScript coverage with strict settings
- **Separation of Concerns**: Clean module boundaries between CLI, business logic, and utilities
- **Conventional Commits**: Structured commit history for maintainability
- **Modern Patterns**: Functional error handling and immutable configurations

## Disclaimer

**⚠️ This code is for educational and demonstration purposes only.**

This project showcases advanced automation techniques, competitive programming principles, and production-quality TypeScript architecture. It should not be used for actual golf course bookings or any automated interactions with live systems.

The code demonstrates concepts including:

- High-precision timing systems
- Competitive automation architecture
- Production-grade error handling
- Professional TypeScript patterns
- CLI application design

Use of this code for actual booking automation may violate terms of service and is not endorsed or recommended.
