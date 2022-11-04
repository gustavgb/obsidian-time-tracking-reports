# obsidian-time-tracking-reports

Dataview script used to aggregate time tracking entries into a table showing weekly entries grouped by date and monthly entries grouped by week number.

## Installation

Make sure [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) is installed.

Then create a new note and paste the contents of [reports.md](./reports.md) into this note. The note will act as the time report. You could have the report and the worklog in the same note, this is up to you.

Lastly, set your locale in the line that says `const locale = 'da'`. This is only used for calculating week numbers and start of week, not the displayed language, which matches Obsidian's language.

## Usage

The Dataview script will use entries from all notes tagged #worklog. A worklog entry should have either of the following formats:

- 2022-10-25: 3:45

or

- 2022-10-25: 12:00 - 15:45

Either format will contribute 3 hours and 45 minutes on the 25th of October 2022.
