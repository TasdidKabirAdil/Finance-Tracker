import { useEffect } from "react"
import Expenses from "../components/Expenses"
import { useNavigate } from "react-router-dom"
import { GET_REPORT } from "../graphql/queries/expenseQueries"
import { ACKNOWLEDGE_REPORT } from "../graphql/mutations/expenseMutations"
import { useMutation, useQuery } from "@apollo/client"
import { handleReportAcknowledge } from "../utils/reportAlert"
import { getPreviousMonthISO } from "../utils/prevMonthParse"

function Dashboard() {
    const navigate = useNavigate()
    const id = localStorage.getItem('id')
    const targetMonth = getPreviousMonthISO()
    const { data: reportData } = useQuery(GET_REPORT, { variables: { userId: id, targetMonth } })
    const [ack] = useMutation(ACKNOWLEDGE_REPORT)

    useEffect(() => {
        handleReportAcknowledge(reportData, ack, targetMonth)
    }, [reportData]);

    return (
        <>
            <button onClick={() => navigate('/reports')}>View Monthly Reports</button>
            <Expenses />
        </>
    )
}

export default Dashboard

