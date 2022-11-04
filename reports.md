```dataviewjs
const locale = 'da'
dv.header(1, "Weekly overview")

const items = dv.pages('#worklog').file.lists
	.map(item => item.text)
	.sort()
	.array()

const sow = moment().locale(locale).startOf('week')
const som = moment().locale(locale).startOf('month')
const durationReg = /(\d{1,2}:\d{2})\s*(-*)\s*(\d{1,2}:\d{2})*/

function parseDuration (str) {
	const match = str.match(durationReg)
	if (!match) {
		return moment.duration(0)
	}

	const start = match[1]
	const dilimeter = match[2]
	const end = match[3]
	
	if (start && end) {
		if (start > end) {
			dv.paragraph('Invalid duration (start must be earlier than end): ' + str)
			return moment.duration(0)
		}

		return moment.duration(end).subtract(moment.duration(start))
	} else if (start && !dilimeter) {
		return moment.duration(start)
	}

	return moment.duration(0)
}

function formatDate (d) {
	const str = moment(d).format("dddd, LL")
	return str[0].toUpperCase() + str.substring(1)
}

function formatDuration (d) {
	const duration = d.as('hours')
	const hours = Math.floor(duration)
	const minutes = Math.round((duration - hours) * 60)

	const hoursFormatted = hours ? `${hours} hour${hours > 1 ? 's' : ''}` : ''
	const minutesFormatted = minutes ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''
	return [hoursFormatted, minutesFormatted].join(' ')
}

const entries = items.map(item => {
	const parts = item.split(':')
	const date = parts[0].trim()
	const durationStr = parts.slice(1).join(':').trim()

	return {
		date,
		duration: parseDuration(durationStr)
	}
})

const days = Object.entries(entries.reduce(
	(acc, item) => {
		const lastDuration = acc[item.date] || moment.duration(0)
		return Object.assign(acc, {
				[item.date]: lastDuration.add(item.duration)
		})
	},
	{}
))

const weekDays = days.filter(item => moment(item[0]).isSameOrAfter(sow))
const weekRows = weekDays.map(day =>[formatDate(day[0]), formatDuration(day[1])]).reverse()

weekRows.push(
	[
	'**Total**',
	`**${formatDuration(weekDays.reduce((acc, day) => acc.add(day[1]), moment.duration(0)))}**`
	]
)

dv.table(["Date", "Duration"], weekRows)

dv.header(1, 'Monthly overview')

const weeks = Object.entries(days.filter(item => moment(item.date).isSameOrAfter(som)).reduce((acc, day) => {
	const weekNumber = moment(day[0]).locale(locale).week()
	const lastDuration = acc[weekNumber] || moment.duration(0)
	return Object.assign(acc, { [weekNumber]: lastDuration.add(day[1]) })
}, {}))

const monthRows = weeks.map(week => [`Week ${week[0]}`, formatDuration(week[1])]).reverse()
monthRows.push([
	'**Total**',
	`**${formatDuration(weeks.reduce((acc, week) => acc.add(week[1]), moment.duration(0)))}**`
])

dv.table(["Week", "Duration"], monthRows)
```
