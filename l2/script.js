const CURRENCY_API_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0"
const CHART_START_DATE = dayjs().subtract(6, "day")
const CHART_END_DATE = dayjs()

async function getExchangeRates(date) {
    const resp = await fetch(
        `${CURRENCY_API_URL}/currency-api@${date.format(
            "YYYY-MM-DD"
        )}/v1/currencies/uah.min.json`
    )

    const data = await resp.json()

    return {
        date: date,
        currency: "uah",
        exchangeRates: data.uah,
    }
}

async function getExchangeRatesForPeriod(startDate, endDate) {
    const difference = endDate.diff(startDate, "day")
    const promises = []

    for (let i = 0; i <= difference; i++) {
        promises.push(getExchangeRates(startDate.add(i, "day")))
    }

    return Promise.all(promises)
}

async function getChartData() {
    const exchangeRates = await getExchangeRatesForPeriod(
        CHART_START_DATE,
        CHART_END_DATE
    )
    const dates = exchangeRates.map((item) => item.date.format("YYYY-MM-DD"))

    const usdTrace = {
        x: dates,
        y: exchangeRates.map((item) => 1 / item.exchangeRates.usd),
        name: "USD to UAH",
    }

    const eurTrace = {
        x: dates,
        y: exchangeRates.map((item) => 1 / item.exchangeRates.eur),
        name: "EUR to UAH",
    }

    return [usdTrace, eurTrace]
}

async function renderChart() {
    const chartConfig = {
        staticPlot: true,
    }

    const chartLayout = {
        xaxis: {
            dtick: "D1",
        },
    }

    try {
        const chartData = await getChartData()
        const chartContainer = document.querySelector(".exchange-chart")
        Plotly.newPlot(chartContainer, chartData, chartLayout, chartConfig)
    } catch (error) {
        alert(
            "An error occured while fetching exchange rates, try refreshing the page"
        )
    }
}

renderChart()

