import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useNavigate, useLocation } from 'react-router-dom'

import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { QsIcon, SparkIcon } from '../components/Icons'

import { GET_USER } from '../graphql/queries/userQueries'
import { GET_GOAL } from '../graphql/queries/savingGoalQuery'
import {
    ADD_SAVING_GOAL,
    UPDATE_SAVING_GOAL,
    REQ_SUGGESTION,
} from '../graphql/mutations/savingGoalMutations'

import styles from '../styles/SavingGoal.module.css'

// Constants
const CATEGORIES = [
    'MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION',
    'UTILITY', 'GAMES', 'ENTERTAINMENT', 'SHOPPING',
    'GIFT', 'HEALTHCARE', 'INSURANCE',
]

// Builds the array payload for mutations
const buildThresholds = (form) =>
    CATEGORIES.map((cat) => ({
        category: cat,
        amount: parseFloat(form[cat]) || 0,
    }))
        .filter((t) => t.amount > 0)

// Component
export default function SavingGoal({ editMode = false }) {
    // Hooks
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = editMode || location.pathname.includes('/edit')
    const userId = localStorage.getItem('id')
    const targetMonth = new Date().toISOString().slice(0, 7)

    // Fetch user & existing goal
    const { data: userData } = useQuery(GET_USER, { variables: { userId } })
    const monthlyIncome = userData?.user.estimatedMonthlyIncome

    const { data: savingGoalData, loading: loadingGoal } = useQuery(
        GET_GOAL,
        { variables: { userId, month: targetMonth }, skip: !isEdit }
    )

    // Mutations
    const [addSavingGoal] = useMutation(ADD_SAVING_GOAL)
    const [updateSavingGoal] = useMutation(UPDATE_SAVING_GOAL)
    const [suggestSavingGoals, { data: suggestionData, loading: suggesting }] =
        useMutation(REQ_SUGGESTION)

    // State
    const initialForm = CATEGORIES.reduce(
        (acc, cat) => ({ ...acc, [cat]: '' }),
        { savingAmount: '' }
    )
    const [form, setForm] = useState(initialForm)
    const [showModal, setShowModal] = useState(false)

    // Effect: load existing goal when editing
    useEffect(() => {
        if (isEdit && savingGoalData?.savingGoal) {
            const { savingAmount, categoricalThresholds } =
                savingGoalData.savingGoal
            const loaded = categoricalThresholds.reduce(
                (acc, cur) => ({ ...acc, [cur.category]: cur.amount }),
                {}
            )
            setForm(prev => ({
                ...prev,
                savingAmount,
                ...loaded
            }));
        }
    }, [isEdit, savingGoalData])

    // Handlers
    const handleChange = ({ target: { name, value } }) =>
        setForm((prev) => ({ ...prev, [name]: value }))

    const handleSuggestClick = () => {
        if (!form.savingAmount) {
            return alert('Enter a saving amount to get suggestions')
        }
        suggestSavingGoals({
            variables: {
                userId,
                monthlyIncome,
                savingAmount: parseFloat(form.savingAmount),
            },
        }).then(() => setShowModal(true))
    }

    const handleSuggestConfirm = (e) => {
        e.preventDefault()
        const suggested = suggestionData?.suggestSavingGoals
            .suggestedThresholds || []
        const newValues = suggested.reduce(
            (acc, cur) => ({ ...acc, [cur.category]: cur.amount }),
            {}
        )
        setForm((prev) => ({ ...prev, ...newValues }))
        setShowModal(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const thresholds = buildThresholds(form)

        try {
            if (isEdit) {
                await updateSavingGoal({
                    variables: {
                        updateSavingGoalId: savingGoalData.savingGoal.id,
                        month: targetMonth,
                        savingAmount: parseFloat(form.savingAmount),
                        categoricalThresholds: thresholds,
                    },
                })
                alert('Saving goals successfully updated')
            } else {
                await addSavingGoal({
                    variables: {
                        userId,
                        month: targetMonth,
                        savingAmount: parseFloat(form.savingAmount),
                        categoricalThresholds: thresholds,
                    },
                })
                alert('Saving goals successfully added')
            }
            navigate('/savings')
        } catch (error) {
            console.error(error)
        }
    }

    if (loadingGoal) return <Spinner />

    // Render
    return (
        <div className={styles.homeContainer}>
            <h1>Monthly Saving Goals Setup</h1>

            <div className={styles.goalContainer}>
                <div className={styles.savingGoal}>
                    {/* AI Suggest Button */}
                    <div className={styles.aiBtnContainer}>
                        <button
                            className={styles.aiBtn}
                            onClick={handleSuggestClick}
                            disabled={suggesting}
                        >
                            {suggesting ? 'Loading...' : (
                                <div className={styles.btnContent}>
                                    <p>AI Suggestions</p>
                                    <span className={styles.icon}>
                                        <SparkIcon size={20} />
                                    </span>
                                </div>
                            )}
                        </button>
                        <div className={styles.tooltipWrapper}>
                            <QsIcon size={16} color="white" />
                            <span className={styles.tooltipText}>
                                Get personalized budget suggestions based on your spendings
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form className={styles.goalForm} onSubmit={handleSubmit}>
                        <div>
                            <h2>Saving Goal Amount</h2>
                            <input
                                type="number"
                                name="savingAmount"
                                value={form.savingAmount}
                                placeholder="Saving Goal Amount"
                                min="0"
                                step="any"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <h2>Categorical Budgets</h2>
                        <div className={styles.categoryInput}>
                            {CATEGORIES.map((cat) => (
                                <div key={cat}>
                                    <label>{cat.charAt(0) + cat.slice(1).toLowerCase()}:</label>
                                    <input
                                        type="number"
                                        name={cat}
                                        value={form[cat]}
                                        placeholder={cat}
                                        onChange={handleChange}
                                        min="0"
                                        step="any"
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button className={styles.submitBtn} type="submit">
                                {isEdit ? 'Update Goal' : 'Set Goal'}
                            </button>
                        </div>
                    </form>

                    {/* Suggestions Modal */}
                    {showModal && (
                        <Modal onClose={() => setShowModal(false)}>
                            <div className={styles.modal}>
                                {suggestionData?.suggestSavingGoals && (
                                    <>
                                        <h2>
                                            {suggestionData.suggestSavingGoals.recommendationNote}
                                        </h2>
                                        {suggestionData.suggestSavingGoals.suggestedThresholds.map(
                                            (t, i) => (
                                                <div key={i} className={styles.modalCatDisplay}>
                                                    <p>
                                                        {t.category.charAt(0) +
                                                            t.category.slice(1).toLowerCase()}
                                                        :
                                                    </p>
                                                    <p>
                                                        {t.amount} {userData?.user.currency}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
                                <div className={styles.modalFooter}>
                                    <p>
                                        Would you like to set these as your category thresholds?
                                    </p>
                                    <div>
                                        <button onClick={handleSuggestConfirm}>Confirm</button>
                                        <button onClick={() => setShowModal(false)}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    )
}