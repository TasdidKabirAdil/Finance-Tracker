import { GET_REPORTS } from "../graphql/queries/expenseQueries"
import { GET_USER } from "../graphql/queries/userQueries"
import { useQuery } from "@apollo/client"
import styles from '../styles/Reports.module.css'

function Reports() {
    const id = localStorage.getItem('id')

    const { data: reportsData, loading, error } = useQuery(GET_REPORTS, { variables: { userId: id } })
    const { data: userData } = useQuery(GET_USER, { variables: { userId: id } })

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

    const spendingVsAvg = (amount) => {
        if (amount == 0) {
            return `Spent ${amount.toLocaleString('en-US', currencyFormat)} ${currency} compared to average`
        } else if (amount > 0) {
            return `Spent ${amount.toLocaleString('en-US', currencyFormat)} ${currency} less than average`
        } else {
            return `Spent ${Math.abs(amount).toLocaleString('en-US', currencyFormat)} ${currency} more than average`
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error.message}</p>

    return (
        <>
            <h1>Monthly Reports</h1>
            {reportsData?.monthlyReports.length > 0 ? (
                <div className={styles.reportsHolder}>
                    {[...reportsData?.monthlyReports]
                        .sort((a, b) => b.targetMonth.localeCompare(a.targetMonth))
                        .map((report) => (
                            <div key={report.id} className={styles.report}>
                                <h2>{formatMonthYear(report.targetMonth)}</h2>
                                <p>Total Expense: {report.totalExpense.toLocaleString('en-US', currencyFormat)} {currency}</p>
                                <p>Total Saved: {report.savedAmount.toLocaleString('en-US', currencyFormat)} {currency}</p>
                                <p>Most Spent On: {report.topCategory ? report.topCategory : 'N/A'}</p>
                                {report.spendingByCategory.length > 0 ? (
                                    <>
                                        <ul>Categorical Spendings - {report.spendingByCategory.map((item) => (
                                            <li key={item.category}>
                                                {item.category.charAt(0) + item.category.slice(1).toLowerCase()} : {item.amount.toLocaleString('en-US', currencyFormat)} {currency}
                                            </li>
                                        ))}</ul>
                                    </>
                                ) : (
                                    <p>Categorical Spending - N/A</p>
                                )}
                                <p>{spendingVsAvg(report.spendingVsAverage)}</p>
                            </div>
                        ))}
                </div>
            ) : (
                <p>No reports yet. Reports start from the current month and won’t reflect edits to past expenses.</p>
            )}
        </>
    )
}

export default Reports