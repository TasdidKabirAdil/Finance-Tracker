import CategoryCharts from "../components/CategoryCharts"
import { useQuery, useMutation } from "@apollo/client"
import {
    GET_TOTAL_EXPENSE,
    GET_DAILY_REPORT,
    GET_CATEGORY_EXPENSE,
    GET_TYPICAL_SPENDING,
    GET_MONTHLY_CHART,
    GET_REPORT
} from "../graphql/queries/expenseQueries"
import { ACKNOWLEDGE_REPORT } from "../graphql/mutations/expenseMutations"
import {
    ThumbsUpIcon,
    ThumbsDownIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from "../components/Icons"
import { GET_USER_CURRENCY } from "../graphql/queries/userQueries"
import { getPreviousMonthISO } from '../utils/prevMonthParse'
import { handleReportAcknowledge } from "../utils/reportAlert"
import Spinner from "../components/Spinner"
import styles from '../styles/Dashboard.module.css'
import { useMemo, useEffect } from "react"

export default function Dashboard() {
    const userId = localStorage.getItem('id')
    const targetMonth = new Date().toISOString().slice(0, 7)

    // Local ISO date helper
    const todayISO = useMemo(() => {
        const now = new Date()
        const offset = now.getTimezoneOffset()
        const localDate = new Date(now.getTime() - offset * 60 * 1000)
        return localDate.toISOString()
    }, [])

    // GraphQL data
    const { data: currencyData } = useQuery(GET_USER_CURRENCY, { variables: { userId } })
    const { data: totalData, refetch: refetchTotalData, loading: loadingTotalData } = useQuery(GET_TOTAL_EXPENSE, { variables: { userId, targetMonth } })
    const { data: dailyReportData, refetch: refetchDailyReport, loading: loadingDailyReport } = useQuery(GET_DAILY_REPORT, { variables: { userId, targetDay: todayISO } })
    const { data: categoryExpenseData, refetch: refetchCategoryExpense, loading: loadingCategoryExpense } = useQuery(GET_CATEGORY_EXPENSE, { variables: { userId, targetMonth } })
    const { data: monthlyTotalChartData, refetch: refetchMonthlyChart, loading: loadingMonthlyChart } = useQuery(GET_MONTHLY_CHART, { variables: { userId } })
    const { data: typicalSpendingData, refetch: refetchTypicalSpending, loading: loadingTypicalSpending } = useQuery(GET_TYPICAL_SPENDING, { variables: { userId } })
    const { data: reportData, loading: loadingReport } = useQuery(GET_REPORT, { variables: { userId, targetMonth: getPreviousMonthISO(targetMonth) } })

    const [ackMonthlyReport] = useMutation(ACKNOWLEDGE_REPORT);

    const isLoading = loadingTotalData || loadingDailyReport || loadingCategoryExpense || loadingMonthlyChart || loadingTypicalSpending || loadingReport

    // Basic values
    const currency = currencyData?.user.currency || ''
    const totalSpent = totalData?.totalMonthlyExpense ?? 0
    const typicalSpent = typicalSpendingData?.typicalSpent ?? 0

    // Thresholds for monthly status
    const [lowThreshold, highThreshold] = useMemo(() => {
        const delta = typicalSpent * 0.15
        return [typicalSpent - delta, typicalSpent + delta]
    }, [typicalSpent])

    // Monthly summary
    const monthlyStatus = useMemo(() => {
        if (typicalSpent === 0) {
            return { text: 'You are on track with your spendings', icon: '' }
        }
        if (totalSpent < lowThreshold) {
            return { text: 'You are saving up some money this month', icon: <ThumbsUpIcon className={styles.responsiveIcon} color='white' /> }
        }
        if (totalSpent > highThreshold) {
            return { text: 'You are spending more than usual this month.', icon: <ThumbsDownIcon className={styles.responsiveIcon} color='white' /> }
        }
        return { text: 'You are on track with your spendings', icon: <ThumbsUpIcon className={styles.responsiveIcon} color='white' /> }
    }, [totalSpent, lowThreshold, highThreshold])

    // Daily summary
    const daily = dailyReportData?.dailyExpense || {}
    const dailyComparison = daily.prevDayComparison ?? 0
    const dailyIcon = dailyComparison > 0
        ? <ArrowDownIcon size={25} color="#009191" />
        : dailyComparison < 0
            ? <ArrowUpIcon size={25} color="#ff4949a8" />
            : null
    const dailyText = dailyComparison > 0
        ? 'less than'
        : dailyComparison < 0
            ? 'more than'
            : 'compared to'
    const h2Color = dailyComparison > 0 ? '#009191' : dailyComparison < 0 ? '#ff4949a8' : 'white'

    // Formatting helper
    const formatCurrency = amount => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    useEffect(() => {
        refetchTotalData()
        refetchDailyReport()
        refetchCategoryExpense()
        refetchMonthlyChart()
        refetchTypicalSpending()
    }, [totalData, dailyReportData, typicalSpendingData])

    useEffect(() => {
        if (!loadingReport) {
            handleReportAcknowledge(reportData, ackMonthlyReport, targetMonth);
        }
    }, [reportData]);

    if (isLoading) return <Spinner />


    return (
        <div className={styles.homeContainer}>
            <h1>Dashboard</h1>

            <div className={styles.expenseView}>
                {/* Monthly Overview */}
                <div className={styles.expViewContainer}>
                    <p style={{ marginBottom: '5px' }}>Total Expense This Month</p>
                    <div
                        className={`${styles.typicalSpending} \
                            ${typicalSpent === 0 ? '' : totalSpent > highThreshold ? styles.aboveTypical : totalSpent < lowThreshold ? styles.belowTypical : ''}`
                        }
                    >
                        <div>
                            <h2>{formatCurrency(totalSpent)} {currency}</h2>
                            <p>{monthlyStatus.text}</p>
                        </div>
                        <span>{monthlyStatus.icon}</span>
                    </div>

                    <div className={styles.comparison}>
                        <div>
                            <h4>{formatCurrency(typicalSpent)} {currency}</h4>
                            <p>Typically Spent</p>
                        </div>
                        <div>
                            <h4>{formatCurrency(Math.abs(typicalSpent - totalSpent))} {currency}</h4>
                            <p>{typicalSpent >= totalSpent ? 'Below' : 'Above'} typical spending</p>
                        </div>
                    </div>
                </div>

                {/* Daily Overview */}
                <div className={styles.expViewContainer}>
                    <p style={{ marginBottom: '5px' }}>Total Expense Today</p>
                    <div className={styles.comparison}>
                        <div>
                            <h2>{formatCurrency(daily.totalDailyExpense ?? 0)} {currency}</h2>
                            <p>Spent today</p>
                        </div>
                        <div>
                            <h2 style={{ color: h2Color, display: 'flex', alignItems: 'center' }}>
                                {formatCurrency(Math.abs(dailyComparison))} {currency}&nbsp;{dailyIcon}
                            </h2>
                            <p>Spent {dailyText} yesterday</p>
                        </div>
                        <div>
                            <p>Number of spendings</p>
                            <h2>{daily.numberOfExpense ?? 0}</h2>
                        </div>
                        <div>
                            <p>Most spent on</p>
                            <h2>{daily.topCategory ? daily.topCategory.charAt(0) + daily.topCategory.slice(1).toLowerCase() : 'None'}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <CategoryCharts
                categoryData={categoryExpenseData?.categoryExpense || []}
                monthlyData={monthlyTotalChartData?.monthlyTotal || []}
            />
        </div>
    )
}
