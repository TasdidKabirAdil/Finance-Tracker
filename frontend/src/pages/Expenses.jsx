// Hooks and GraphQL
import { useQuery, useMutation } from '@apollo/client'
import { useState, useEffect } from 'react'
import { ADD_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE } from '../graphql/mutations/expenseMutations'
import { GET_EXPENSES, GET_EXPENSE } from '../graphql/queries/expenseQueries'
import { GET_USER_CURRENCY } from '../graphql/queries/userQueries'

// Icons & Components
import { AddIcon, EditIcon, DeleteIcon, TickIcon, CrossIcon } from '../components/Icons'
import { CustomSelect1, CustomSelect2 } from '../components/CustomSelect'
import styles from '../styles/Expenses.module.css'
import Spinner from '../components/Spinner'

function Expenses() {
    // Get user ID from localStorage
    const id = localStorage.getItem('id')

    // Expense category options and their colors
    const categories = ['MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION', 'UTILITY', 'GAMES', 'ENTERTAINMENT', 'SHOPPING', 'GIFT', 'HEALTHCARE', 'INSURANCE']
    const categoryColor = {
        MISC: '#0088FE', FOOD: '#FF9B45', RENT: '#FFC107', TRANSPORT: '#F7374F',
        SUBSCRIPTION: '#85193C', UTILITY: '#3F7D58', GAMES: '#284367ff',
        ENTERTAINMENT: '#471396', SHOPPING: '#604652', GIFT: '#CF0F47',
        HEALTHCARE: '#5EABD6', INSURANCE: '#06923E',
    }

    // Category options with color and label formatting
    const options = categories.map((cat) => ({
        value: cat,
        label: cat.charAt(0) + cat.slice(1).toLowerCase(),
        color: categoryColor[cat],
    }))

    // Sorting/filter dropdown options
    const catSortOptions = [{ value: '', label: 'Category' }, { value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]
    const amountSortOptions = [{ value: '', label: 'Amount' }, { value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]
    const dateSortOptions = [{ value: '', label: 'Date' }, { value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]
    const filterOptions = [{ value: 'ALL', label: 'All' }, ...categories.map((cat) => ({ value: cat, label: cat.charAt(0) + cat.slice(1).toLowerCase() }))]

    // Local ISO date helper
    const getLocalDateString = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - (offset * 60 * 1000));
        return localDate.toISOString()
    }

    // Template object for new expenses
    const dummyExpObj = { name: '', category: 'MISC', amount: 0, date: getLocalDateString().slice(0, 10) }

    // State management
    const [expenseId, setExpenseId] = useState(null)
    const [addForm, setAddForm] = useState(dummyExpObj)
    const [editForm, setEditForm] = useState(dummyExpObj)
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [monthFilter, setMonthFilter] = useState(getLocalDateString().slice(0, 7))
    const [categoryFilter, setCategoryFilter] = useState('ALL')
    const [categorySort, setCategorySort] = useState('')
    const [dateSort, setDateSort] = useState('')
    const [amountSort, setAmountSort] = useState('')

    // GraphQL queries & mutations
    const { data: expensesData, loading: loadingExpenses, refetch: refetchExpenses } = useQuery(GET_EXPENSES, { variables: { userId: id } })
    const { data: expenseData } = useQuery(GET_EXPENSE, { variables: { expenseId } })
    const { data: currencyData } = useQuery(GET_USER_CURRENCY, { variables: { userId: id } })

    const [addExpense] = useMutation(ADD_EXPENSE)
    const [editExpense] = useMutation(UPDATE_EXPENSE)
    const [deleteExpense] = useMutation(DELETE_EXPENSE)

    const isLoading = loadingExpenses

    // Apply filters
    const filteredExpenses = expensesData?.expenses.filter((exp) => {
        const expDate = new Date(parseInt(exp.date, 10)).toISOString().slice(0, 7)
        const matchesMonth = monthFilter ? monthFilter === expDate : true
        const matchesCategory = categoryFilter === 'ALL' || categoryFilter === exp.category
        return matchesMonth && matchesCategory
    })

    // Apply sorting
    const sortedExpenses = [...(filteredExpenses || [])].sort((a, b) => {
        if (categorySort) {
            const valA = a.category.toLowerCase()
            const valB = b.category.toLowerCase()
            if (valA < valB) return categorySort === 'asc' ? -1 : 1
            if (valA > valB) return categorySort === 'asc' ? 1 : -1
        }

        if (dateSort) {
            const valA = new Date(parseInt(a.date))
            const valB = new Date(parseInt(b.date))
            if (valA < valB) return dateSort === 'asc' ? -1 : 1
            if (valA > valB) return dateSort === 'asc' ? 1 : -1
        }

        if (amountSort) {
            if (a.amount < b.amount) return amountSort === 'asc' ? -1 : 1
            if (a.amount > b.amount) return amountSort === 'asc' ? 1 : -1
        }

        return 0
    })

    // Set edit form state when single expense data is fetched
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

    // Refresh expenses when list changes
    useEffect(() => {
        refetchExpenses()
    }, [expensesData])

    // Handle input changes for both forms
    const handleChange = (e) => {
        const { name, value } = e.target
        const formattedValue = name === 'amount' ? parseFloat(value) : value
        isAdding ? setAddForm({ ...addForm, [name]: formattedValue }) : setEditForm({ ...editForm, [name]: formattedValue })
    }

    // Handle form submit for add or edit
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (isAdding) {
                await addExpense({ variables: { userId: id, ...addForm } })
                await refetchExpenses()
                setAddForm(dummyExpObj)
                setIsAdding(false)
            } else if (isEditing) {
                await editExpense({ variables: { updateExpenseId: expenseId, ...editForm } })
                await refetchExpenses()
                setExpenseId(null)
            }
        } catch (err) {
            console.error(err.message)
        }
    }

    // Trigger add form
    const beginAdd = () => {
        setIsAdding(true)
        setIsEditing(false)
        setExpenseId(null)
    }

    // Trigger edit form
    const beginEdit = (expense) => {
        if (isAdding) {
            setAddForm(dummyExpObj)
            setIsAdding(false)
        }
        setExpenseId(expense.id)
        setIsEditing(true)
    }

    // Cancel current form (add/edit)
    const handleCancel = () => {
        if (isAdding) {
            setAddForm(dummyExpObj)
            setIsAdding(false)
        }
        if (isEditing) {
            setIsEditing(false)
            setExpenseId(null)
        }
    }

    // Delete an expense with confirmation
    const handleDeleteExpense = async (id) => {
        try {
            const ok = window.confirm('Are you sure you want to delete this expense?')
            if (!ok) return
            await deleteExpense({ variables: { deleteExpenseId: id } })
            await refetchExpenses()
        } catch (err) {
            console.error(err.message)
        }
    }

    // Loading state
    if (isLoading) return <Spinner />

    return (
        <div className={styles.homeContainer}>
            <h1>Expenses</h1>
            <p className={styles.firstP}>Log your spendings here</p>
            <div className={styles.expenseWrapper}>
                <div className={styles.head}>
                    <div className={styles.filters}>
                        <p>Sort By:</p>

                        <div className={styles.filterContainer1}>
                            <div>
                                <CustomSelect2
                                    options={catSortOptions}
                                    value={categorySort}
                                    onChange={setCategorySort}
                                />
                            </div>

                            <div>
                                <CustomSelect2
                                    options={dateSortOptions}
                                    value={dateSort}
                                    onChange={setDateSort}
                                />
                            </div>

                            <div>
                                <CustomSelect2
                                    options={amountSortOptions}
                                    value={amountSort}
                                    onChange={setAmountSort}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.filters}>
                        <p>Filter By: </p>
                        <div className={styles.filterContainer2}>
                            <input
                                type='month'
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className={styles.monthInput}
                            />

                            <CustomSelect2
                                options={filterOptions}
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                            />
                        </div>
                    </div>
                </div>


                <div className={styles.tableContainer}>
                    <table className={styles.styledTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Amount ({currencyData?.user.currency})</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenses.map((expense) => (
                                <tr key={expense.id} className={expense.id !== expenseId ? styles.expenseRow : ''}>
                                    {expense.id === expenseId ? (
                                        <>
                                            <td className={styles.editRow}><input type='text' placeholder='Expense Name' name='name' value={editForm.name} onChange={handleChange} required /></td>
                                            <td className={styles.editRow}>
                                                <CustomSelect1
                                                    options={options}
                                                    value={editForm.category}
                                                    onChange={(selectedValue) =>
                                                        handleChange({ target: { name: 'category', value: selectedValue } })
                                                    }
                                                    categoryColor={categoryColor}
                                                />
                                            </td>
                                            <td className={styles.editRow}><input type='number' placeholder='Amount' name='amount' value={editForm.amount} onChange={handleChange} required /></td>
                                            <td className={styles.editRow}>
                                                <input type='date' placeholder='Date' name='date' value={editForm.date} onChange={handleChange} required />
                                            </td>
                                            <td className={styles.actionCell}>
                                                <div className={styles.editRowActions}>
                                                    <button className={styles.tickBtn} onClick={handleSubmit}>
                                                        <TickIcon size={15} />
                                                    </button>
                                                    <button className={styles.crossBtn} onClick={handleCancel}>
                                                        <CrossIcon size={16} color='white' />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{expense.name}</td>
                                            <td>
                                                <span className={styles.catPill} style={{ backgroundColor: categoryColor[expense.category] }}>
                                                    {expense.category.charAt(0) + expense.category.slice(1).toLowerCase()}
                                                </span>
                                            </td>
                                            <td>{expense.amount.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}</td>
                                            <td style={{ borderRight: 'none' }}>{new Date(Number(expense.date) + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                            <td className={styles.actionCell}>
                                                <div className={styles.rowActions}>
                                                    <button className={styles.editBtn} onClick={() => beginEdit(expense)}>
                                                        <EditIcon size={15} />
                                                    </button>
                                                    <button className={styles.deleteBtn} onClick={() => handleDeleteExpense(expense.id)}>
                                                        <DeleteIcon size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}

                                </tr>
                            ))}
                            {isAdding ? (
                                <tr>
                                    <td className={styles.editRow}><input type='text' placeholder='Expense Name' name='name' value={addForm.name} onChange={handleChange} required /></td>
                                    <td className={styles.editRow}>
                                        <CustomSelect1
                                            options={options}
                                            value={addForm.category}
                                            onChange={(selectedValue) =>
                                                handleChange({ target: { name: 'category', value: selectedValue } })
                                            }
                                            categoryColor={categoryColor}
                                        />
                                    </td>
                                    <td className={styles.editRow}><input type='number' placeholder='Amount' name='amount' value={addForm.amount} onChange={handleChange} required /></td>
                                    <td className={styles.editRow}>
                                        <input type='date' placeholder='Date' name='date' value={addForm.date} onChange={handleChange} required />
                                    </td>
                                    <td className={styles.actionCell}>
                                        <div className={styles.editRowActions}>
                                            <button className={styles.tickBtn} onClick={handleSubmit}>
                                                <TickIcon size={15} />
                                            </button>
                                            <button className={styles.crossBtn} onClick={handleCancel}>
                                                <CrossIcon size={15} color='white' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        <div className={styles.tooltipWrapper}>
                                            <button className={styles.addBtn} onClick={beginAdd}>
                                                <AddIcon size={15} />
                                            </button>
                                            <span className={styles.tooltipText}>Add Expense</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Expenses