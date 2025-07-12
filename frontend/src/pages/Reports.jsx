import { GET_REPORTS } from "../graphql/queries/expenseQueries"
import { GET_USER } from "../graphql/queries/userQueries"
import { useQuery } from "@apollo/client"
import { useState } from "react"
import { getPreviousMonthISO } from "../utils/prevMonthParse"
import { RoundAddIcon, RoundUpIcon, RoundDownIcon, QsIcon } from "../components/Icons"
import Spinner from "../components/Spinner"
import styles from '../styles/Reports.module.css'

function Reports() {
    const id = localStorage.getItem('id')

    const { data: reportsData, loading: loadingReports } = useQuery(GET_REPORTS, { variables: { userId: id } })
    const { data: userData, loading: loadingUser } = useQuery(GET_USER, { variables: { userId: id } })

    const isLoading = loadingReports || loadingUser

    const [monthFilter, setMonthFilter] = useState(getPreviousMonthISO())

    const currency = userData?.user.currency
    const currencyFormat = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };

    function formatMonthYear(ym) {
        const [year, month] = ym.split('-').map(Number);
        const date = new Date(year, month - 1);
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    const changeMonth = (delta) => {
        const [year, month] = monthFilter.split('-').map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + delta);

        const today = new Date();
        today.setDate(1);

        if (date >= today) return;

        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        setMonthFilter(newMonth);
    };

    const filteredReport = reportsData?.monthlyReports.find(
        (report) => report.targetMonth === monthFilter
    )

    const comparisonText = filteredReport?.spendingVsAverage > 0
        ? 'less than'
        : filteredReport?.spendingVsAverage < 0
            ? 'more than'
            : 'compared to'

    const comparisonIcon = filteredReport?.spendingVsAverage >= 0
        ? <RoundDownIcon size={40} color="black" />
        : <RoundUpIcon size={40} color="black" />

    const savings = filteredReport?.savedAmount
    const expense = filteredReport?.totalExpense
    const savingIcon = savings >= expense
        ? <RoundUpIcon size={40} color="black" />
        : <RoundDownIcon size={40} color="black" />

    if (isLoading) return <Spinner />

    return (
        <div className={styles.homeContainer}>
            <div className={styles.heading}>
                <h1>Monthly Reports
                    <div className={styles.tooltipWrapper}>
                        <QsIcon size={20} color="white" />
                        <span className={styles.tooltipText}>
                            Each month's report is posted at the start of the following month
                        </span>
                    </div>
                </h1>
                <div className={styles.monthSelector}>
                    <button onClick={() => changeMonth(-1)}>◁ Prev</button>
                    <span>{formatMonthYear(monthFilter)}</span>
                    <button onClick={() => changeMonth(1)}>Next ▷</button>
                </div>
            </div>

            {filteredReport ? (
                <div className={styles.report}>
                    <div className={styles.reportTitle}>
                        <h1>{formatMonthYear(filteredReport.targetMonth)} Report</h1>
                        <h2>Key highlights of this months expenses</h2>
                    </div>
                    <div className={styles.reportBody}>
                        <div className={styles.left}>
                            <div className={styles.section}>
                                <div className={styles.iconHolder}>
                                    <h1>{filteredReport.totalExpense.toLocaleString('en-US', currencyFormat)} {currency}</h1>
                                    <span style={{ width: '30px' }}><RoundAddIcon size={40} color="black" /></span>
                                </div>
                                <p>Total Expense</p>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.iconHolder}>
                                    <h1>{filteredReport.savedAmount.toLocaleString('en-US', currencyFormat)} {currency}</h1>
                                    <span style={{ width: '30px' }}>{savingIcon}</span>
                                </div>
                                <p>Total Saved</p>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.iconHolder}>
                                    <h1>{Math.abs(filteredReport.spendingVsAverage).toLocaleString('en-US', currencyFormat)} {currency}</h1>
                                    <span style={{ width: '30px' }}>{comparisonIcon}</span>
                                </div>
                                <p>Spent {comparisonText} average</p>
                            </div>
                        </div>

                        <div className={styles.right}>
                            <div className={styles.section}>
                                <h1>{filteredReport.topCategory ? filteredReport.topCategory : 'N/A'}</h1>
                                <p>Most Spent On</p>
                            </div>

                            {filteredReport.spendingByCategory.length > 0 ? (
                                <div className={styles.section}>
                                    <h2>Top Categorical Spendings</h2>
                                    <div className={styles.section2}>
                                        {
                                            [...filteredReport.spendingByCategory]
                                                .sort((a, b) => b.amount - a.amount)
                                                .slice(0, 3)
                                                .map((item) => (
                                                    <div key={item.category}>
                                                        <h1>{item.amount.toLocaleString('en-US', currencyFormat)}<br /> {currency}</h1>
                                                        <p>{item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase()}</p>
                                                    </div>
                                                ))
                                        }</div>
                                </div>
                            ) : (
                                <p>Categorical Spending - N/A</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '20px',
                }}>
                    <p>No report for {formatMonthYear(monthFilter)}.</p>
                </div>
            )}
        </div>
    )
}

export default Reports