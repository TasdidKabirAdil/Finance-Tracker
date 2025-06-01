import { useQuery, useMutation } from '@apollo/client'
import { useState, useEffect } from 'react'
import { ADD_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE } from '../graphql/mutations/expenseMutations'
import { GET_EXPENSES, GET_EXPENSE, GET_TOTAL_EXPENSE } from '../graphql/queries/expenseQueries'
import { GET_USER_CURRENCY } from '../graphql/queries/userQueries'
import styles from '../styles/Expenses.module.css'

function Expenses() {
    const id = localStorage.getItem('id')
    const { data: expensesData, loading, error, refetch } = useQuery(GET_EXPENSES, { variables: { userId: id } })
    const [expenseId, setExpenseId] = useState(null)
    const { data: expenseData } = useQuery(GET_EXPENSE, { variables: { expenseId: expenseId } })
    const { data: currencyData } = useQuery(GET_USER_CURRENCY, { variables: { userId: id } })

    const [addExpense] = useMutation(ADD_EXPENSE)
    const [editExpense] = useMutation(UPDATE_EXPENSE)
    const [deleteExpense] = useMutation(DELETE_EXPENSE)

    const categories = ['MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION', 'ULITITY', 'GAMES']

    const getLocalDateString = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - (offset * 60 * 1000));
        return localDate.toISOString()
    }
    const dummyExpObj = { name: '', category: 'MISC', amount: 0, date: getLocalDateString().slice(0, 10) }

    const [addForm, setAddForm] = useState(dummyExpObj)
    const [editForm, setEditForm] = useState(dummyExpObj)
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [monthFilter, setMonthFilter] = useState(getLocalDateString().slice(0, 7))
    const [categoryFilter, setCategoryFilter] = useState('ALL')

    const filteredExpenses = expensesData?.expenses.filter((exp) => {
        const expDate = new Date(parseInt(exp.date, 10)).toISOString().slice(0, 7)
        const matchesMonth = monthFilter ? monthFilter === expDate : true
        const matchesCategory = categoryFilter === 'ALL' || categoryFilter === exp.category
        return matchesMonth && matchesCategory
    })

    const { data: totalData, refetch: refetchTotal } = useQuery(GET_TOTAL_EXPENSE, {
        variables: { userId: id, targetMonth: monthFilter }
    })


    useEffect(() => {
        if (expenseData?.expense) {
            setEditForm({
                name: expenseData.expense.name,
                category: expenseData.expense.category,
                amount: expenseData.expense.amount,
                date: new Date(parseInt(expenseData.expense.date)).toISOString().slice(0, 10)
            })
        }
    }, [expenseData])

    useEffect(() => {
        if (expensesData && monthFilter) {
            refetchTotal({ userId: id, targetMonth: monthFilter })
        }
    }, [expensesData, monthFilter])

    const handleChange = (e) => {
        const { name, value } = e.target
        if (isAdding) {
            setAddForm({ ...addForm, [name]: name === 'amount' ? parseFloat(value) : value })
        } else {
            setEditForm({ ...editForm, [name]: name === 'amount' ? parseFloat(value) : value })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (isAdding) {
                await addExpense({ variables: { userId: id, ...addForm } })
                await refetch()
                setAddForm(dummyExpObj)
                setIsAdding(false)
            } else if (isEditing) {
                await editExpense({ variables: { updateExpenseId: expenseId, ...editForm } })
                await refetch()
                setExpenseId(null)
            }

        } catch (err) {
            console.error(err.message)
        }
    }

    const beginAdd = () => {
        setIsAdding(true)
        setIsEditing(false)
        setExpenseId(null)
    }

    const beginEdit = (expense) => {
        if (isAdding) {
            setAddForm(dummyExpObj)
            setIsAdding(false)
        }
        setExpenseId(expense.id)
        setIsEditing(true)
    }

    const handleCancel = () => {
        if (isAdding) {
            setAddForm(dummyExpObj)
            setIsAdding(false)
        } if (isEditing) {
            setIsEditing(false)
            setExpenseId(null)
        }
    }

    const handleDeleteExpense = async (id) => {
        try {
            const ok = window.confirm('Are you sure you want to delete this expense?')
            if (!ok) return
            await deleteExpense({ variables: { deleteExpenseId: id } })
            await refetch()
        } catch (err) {
            console.error(err.message)
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error.message}</p>

    return (
        <div className={styles.expense}>
            <div className={styles.head}>
                <h1>Expenses</h1>
                <div >
                    <input type='month' value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />&nbsp;
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="ALL">All</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
                        ))}
                    </select>
                </div>

            </div>

            <div className={styles.tableContainer}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Amount ({currencyData?.user.currency})</th>
                            <th style={{ borderRight: 'none' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.id} className={styles.expenseRow}>
                                {expense.id === expenseId ? (
                                    <>
                                        <td><input style={{ width: '100px' }} type='text' placeholder='Expense Name' name='name' value={editForm.name} onChange={handleChange} required /></td>
                                        <td>
                                            <select name='category' value={editForm.category} onChange={handleChange}>
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td><input style={{ width: '100px' }} type='number' placeholder='Amount' name='amount' value={editForm.amount} onChange={handleChange} required /></td>
                                        <td style={{ borderRight: 'none' }}>
                                            <input type='date' placeholder='Date' name='date' value={editForm.date} onChange={handleChange} required />

                                        </td>
                                        <td className={styles.actionCell}>
                                            <div className={styles.editRowActions}>
                                                <button onClick={handleSubmit}>✅</button>
                                                <button onClick={(handleCancel)}>❌</button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{expense.name}</td>
                                        <td>{expense.category.charAt(0) + expense.category.slice(1).toLowerCase()}</td>
                                        <td>{expense.amount.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}</td>
                                        <td style={{ borderRight: 'none' }}>{new Date(Number(expense.date) + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                        <td className={styles.actionCell}>
                                            <div className={styles.rowActions}>
                                                <button onClick={() => beginEdit(expense)}>✏️</button>
                                                <button onClick={() => handleDeleteExpense(expense.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </>
                                )}

                            </tr>
                        ))}
                        {isAdding ? (
                            <tr>
                                <td><input style={{ width: '100px' }} type='text' placeholder='Expense Name' name='name' value={addForm.name} onChange={handleChange} required /></td>
                                <td>
                                    <select name='category' value={addForm.category} onChange={handleChange}>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                </td>
                                <td><input style={{ width: '100px' }} type='number' placeholder='Amount' name='amount' value={addForm.amount} onChange={handleChange} required /></td>
                                <td style={{ borderRight: 'none' }}>
                                    <input type='date' placeholder='Date' name='date' value={addForm.date} onChange={handleChange} required />
                                </td>
                                <td className={styles.actionCell}>
                                    <div className={styles.editRowActions}>
                                        <button onClick={handleSubmit}>✅</button>
                                        <button onClick={handleCancel}>❌</button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={5}>
                                    <button onClick={beginAdd}>➕</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <h2>Total Expense This Month: {totalData?.totalMonthlyExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencyData?.user.currency}</h2>
        </div>
    )
}

export default Expenses