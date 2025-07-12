import { useMutation, useQuery } from "@apollo/client"
import { ADD_SAVING_GOAL, UPDATE_SAVING_GOAL, REQ_SUGGESTION } from "../graphql/mutations/savingGoalMutations"
import { GET_GOAL } from "../graphql/queries/savingGoalQuery"
import { GET_USER } from "../graphql/queries/userQueries"
import Modal from "../components/Modal"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { QsIcon, SparkIcon } from "../components/Icons"
import styles from '../styles/SavingGoal.module.css'
import Spinner from "../components/Spinner"

function SavingGoal({ editMode = false }) {
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = editMode || location.pathname.includes('/edit')
    const id = localStorage.getItem('id')
    const targetMonth = new Date().toISOString().slice(0, 7)
    const { data: userData } = useQuery(GET_USER, { variables: { userId: id } })
    const monthlyIncome = userData?.user.estimatedMonthlyIncome

    const categories =
        ['MISC', 'RENT', 'TRANSPORT', 'FOOD', 'SUBSCRIPTION',
            'UTILITY', 'GAMES', 'ENTERTAINMENT', 'SHOPPING', 'GIFT', 'HEALTHCARE', 'INSURANCE']
    const [addSavingGoal] = useMutation(ADD_SAVING_GOAL)
    const [updateSavingGoal] = useMutation(UPDATE_SAVING_GOAL)
    const [suggestSavingGoals, { data, loading }] = useMutation(REQ_SUGGESTION)
    const { data: savingGoalData, loading: loadingSavingGoal } = useQuery(GET_GOAL, { variables: { userId: id, month: targetMonth } })

    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({
        savingAmount: '',
        MISC: '',
        FOOD: '',
        RENT: '',
        TRANSPORT: '',
        SUBSCRIPTION: '',
        UTILITY: '',
        GAMES: '',
    })

    useEffect(() => {
        if (isEdit && savingGoalData?.savingGoal) {
            const goal = savingGoalData.savingGoal;
            const formValues = {
                savingAmount: goal.savingAmount,
                ...goal.categoricalThresholds.reduce((acc, cur) => {
                    acc[cur.category] = cur.amount;
                    return acc;
                }, {})
            }
            setForm(prev => ({ ...prev, ...formValues }));
        }
    }, [savingGoalData, isEdit]);

    const handleSuggestClick = async () => {
        if (form.savingAmount === '') {
            return alert("Enter Savings amount to get suggestions")
        }
        await suggestSavingGoals({ variables: { userId: id, monthlyIncome, savingAmount: parseFloat(form.savingAmount) } })
        setShowModal(true)
    }

    const handleSuggestAppend = (e) => {
        e.preventDefault();

        if (!data?.suggestSavingGoals?.suggestedThresholds) return;

        const suggested = data.suggestSavingGoals.suggestedThresholds;
        const mappedSuggestions = suggested.reduce((acc, cur) => {
            acc[cur.category] = cur.amount;
            return acc;
        }, {});

        setForm(prev => ({
            ...prev,
            ...mappedSuggestions
        }));

        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const categoricalThresholds = categories
            .map((cat) => ({
                category: cat,
                amount: parseFloat(form[cat]),
            }))
            .filter((t) => !isNaN(t.amount) && t.amount > 0);

        try {
            if (isEdit) {
                await updateSavingGoal({ variables: { updateSavingGoalId: savingGoalData?.savingGoal.id, month: targetMonth, savingAmount: parseFloat(form.savingAmount), categoricalThresholds } })
                alert('Saving goals has been succesfully updated')
            } else {
                await addSavingGoal({ variables: { userId: id, month: targetMonth, savingAmount: parseFloat(form.savingAmount), categoricalThresholds } })
                alert('Saving goals has been succesfully added')
            }
            navigate('/savings')
        } catch (err) {
            console.error(err.message)
        }
    }

    if (loadingSavingGoal) return <Spinner />

    return (
        <div className={styles.homeContainer}>
            <h1>Monthly Saving Goals Setup</h1><br />
            <div className={styles.goalContainer}>
                <div className={styles.savingGoal}>

                    <div className={styles.aiBtnContainer}>
                        <button className={styles.aiBtn} onClick={handleSuggestClick} disabled={loading}>{loading ? "Loading..." : (
                            <div className={styles.btnContent}>
                                <p>Ai Suggestions</p>
                                <span className={styles.icon}><SparkIcon size={20} /></span>
                            </div>
                        )}</button>

                        <div className={styles.tooltipWrapper}>
                            <QsIcon size={16} color="white" />
                            <span className={styles.tooltipText}>
                                Get Personalized categorical budget suggestions based on your spendings
                            </span>
                        </div>
                    </div>

                    <form className={styles.goalForm} onSubmit={handleSubmit}>
                        <div>
                            <h1>Saving Goal Amount</h1><br />
                            <input type="number" name="savingAmount" value={form.savingAmount} placeholder="Saving Goal Amount" min="0" step='any' onChange={handleChange} required />
                        </div>
                        <h1>Categorical Budgets</h1>
                        <div className={styles.categoryInput}>
                            {categories.map((cat) => (
                                <div key={cat}>
                                    <label>{cat.charAt(0) + cat.slice(1).toLowerCase()}: </label>
                                    <input type="number" name={cat} value={form[cat]} placeholder={cat} onChange={handleChange} min="0" step='any' />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: 'center' }}>
                            <button className={styles.submitBtn} type="submit">Set Goal</button>
                        </div>
                    </form>

                    {showModal && (
                        <Modal onClose={() => setShowModal(false)}>
                            <div className={styles.modal}>
                                {data?.suggestSavingGoals && (
                                    <>
                                        <h2>{data.suggestSavingGoals.recommendationNote}</h2>
                                        {data.suggestSavingGoals.suggestedThresholds.map((threshold, index) => (
                                            <div key={index} className={styles.modalCatDisplay}>
                                                <p>{threshold.category.charAt(0) + threshold.category.slice(1).toLowerCase()}:</p>
                                                <p>{threshold.amount} {userData?.user.currency}</p>
                                            </div>
                                        ))}
                                    </>
                                )}
                                <div className={styles.modalFooter}>
                                    <p>Would you like to set this as your thresholds for each category?</p>
                                    <div>
                                        <button onClick={handleSuggestAppend}>Confirm</button>
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

export default SavingGoal