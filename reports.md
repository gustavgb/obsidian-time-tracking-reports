```dataviewjs
dv.header(1, "Weekly tracking")

moment.locale('da')

const items = dv.current().file.lists
.where(item => item.tags.contains("#track"))
.map(item => item.text)
.sort()
.array()
.map(item => item.replace('#track', '').trim())

const sow = moment().startOf('week')
const som = moment().startOf('month')

const entries = items.map(item => {
	const durationStr = item.split(':')[1].trim()
	const date = item.split(':')[0].trim()
	const durationParams = durationStr.split(' ')

	if (durationParams.length % 2 !== 0) {
		dv.paragraph('Invalid duration (missing space between value and unit): ' + item)
		return {
			date,
			duration: moment.duration(0)
		}
	}

	const durations = []
	for (let i = 0; i < durationParams.length; i += 2) {
		const durationVal = parseFloat(durationParams[i].trim())
		const durationUnit = durationParams[i + 1].toLowerCase().trim()
		const duration = moment.duration(durationVal, durationUnit)
		if (!duration.isValid()) {
			dv.paragraph('Invalid duration: ' + durationVal + ' ' + durationUnit)
		} else {
			durations.push(duration)
		}
	}

	const totalDuration = durations.reduce(
		(acc, duration) => acc.add(duration),
		moment.duration(0)
	)

	return {
		date,
		duration: totalDuration
	}
})

//.filter(item => moment(item.date).isAfter(sow))

const days = Object.entries(entries.reduce(
	(acc, item) => {
		const lastDuration = acc[item.date] || moment.duration(0)
		return Object.assign(acc, {
				[item.date]: lastDuration.add(item.duration)
		})
	},
	{}
))

function formatDate (d) {
	return moment(d).format("dddd, MMMM Do YYYY");
}

function formatDuration (d) {
	return Math.round(d.as('hours') * 100) / 100 + ' hours'
}

const weekRows = days.filter(item => moment(item[0]).isAfter(sow)).map(day =>[formatDate(day[0]), formatDuration(day[1])]).reverse()

weekRows.push(
	[
	'**Total**',
	formatDuration(days.reduce((acc, day) => acc.add(day[1]), moment.duration(0)))
	]
)

dv.table(["Date", "Duration"], weekRows)

dv.header(1, 'Monthly overview')

const weeks = Object.entries(days.filter(item => moment(item.date).isAfter(som)).reduce((acc, day) => {
	const weekNumber = moment(day[0]).week()
	const lastDuration = acc[weekNumber] || moment.duration(0)
	return Object.assign(acc, { [weekNumber]: lastDuration.add(day[1]) })
}, {}))

const monthRows = weeks.map(week => [`Week ${week[0]}`, formatDuration(week[1])]).reverse()

dv.table(["Week", "Duration"], monthRows)
```
