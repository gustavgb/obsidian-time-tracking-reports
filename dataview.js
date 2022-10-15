dv.header(1, "Weekly report")

const items = dv.current().file.lists
.where(item => item.tags.contains("#track"))
.map(item => item.text)
.sort()
.array()
.map(item => item.replace('#track', '').trim())

const sow = moment().startOf('week')
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
}).filter(item => moment(item.date).isAfter(sow))

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

const rows = days.map(day =>[formatDate(day[0]), formatDuration(day[1])])

rows.push(
	[
	'**Total**',
	formatDuration(days.reduce((acc, day) => acc.add(day[1]), moment.duration(0)))
	]
)

dv.table(["Date", "Duration"], rows)
