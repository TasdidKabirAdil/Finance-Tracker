// Hooks & navigation
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// GraphQL queries and mutations
import { GET_GOAL } from "../graphql/queries/savingGoalQuery";
import { GET_USER } from "../graphql/queries/userQueries";
import { GET_CATEGORY_EXPENSE, GET_TOTAL_EXPENSE, GET_EXPENSES } from "../graphql/queries/expenseQueries";
import { DELETE_SAVING_GOAL } from "../graphql/mutations/savingGoalMutations";
import { useMutation, useQuery } from "@apollo/client";

// Components & styles
import { EditIcon, DeleteIcon } from "../components/Icons";
import SavingsChart from '../components/SavingsChart';
import Spinner from "../components/Spinner";
import styles from '../styles/SavingProgress.module.css';

function SavingProgress() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('id');
    const targetMonth = new Date().toISOString().slice(0, 7);

    // Format current month + year (e.g. "July 2025")
    function formatMonthYear() {
        const date = new Date();
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    // Fetch data using GraphQL
    const { data: userData } = useQuery(GET_USER, { variables: { userId } });
    const { data: savingGoalData, loading: loadingSavingGoal, refetch: refetchSavingGoal } = useQuery(GET_GOAL, { variables: { userId, month: targetMonth } });
    const { data: categoryExpenseData, loading: loadingCategory, refetch: refetchCategory } = useQuery(GET_CATEGORY_EXPENSE, { variables: { userId, targetMonth } });
    const { data: totalExpenseData, loading: loadingTotal, refetch: refetchTotal } = useQuery(GET_TOTAL_EXPENSE, { variables: { userId, targetMonth } });
    const { data: expensesData, loading: loadingExpenses, refetch: refetchExpenses } = useQuery(GET_EXPENSES, { variables: { userId } });

    const isLoading = loadingSavingGoal || loadingCategory || loadingTotal || loadingExpenses;
    const [deleteSavingGoal] = useMutation(DELETE_SAVING_GOAL);

    // Calculate total available threshold
    const totalSpent = totalExpenseData?.totalMonthlyExpense;
    const totalThreshold = userData?.user && savingGoalData?.savingGoal
        ? userData.user.estimatedMonthlyIncome - savingGoalData.savingGoal.savingAmount
        : 0;

    // Return a color based on how close spending is to the threshold
    const barColor = (pct) => {
        if (pct > 0.9) return "over";
        if (pct > 0.7) return "warning";
        return "ok";
    };

    // Filter expenses for the selected category and current month
    const filteredExpenses = (category) => {
        const today = new Date();
        return expensesData?.expenses.filter((exp) => {
            const expDate = new Date(parseInt(exp.date, 10) + new Date().getTimezoneOffset() * 60000);
            return category === exp.category &&
                expDate.getFullYear() === today.getFullYear() &&
                expDate.getMonth() === today.getMonth();
        });
    };

    const [expandedCategory, setExpandedCategory] = useState(null);
    const [mounted, setMounted] = useState(false);

    // Toggle expanded category accordion
    const toggleCategory = (category) => {
        setExpandedCategory((prev) => (prev === category ? null : category));
    };

    // Refetch data when dependencies change
    useEffect(() => {
        refetchSavingGoal();
        refetchCategory();
        refetchTotal();
        refetchExpenses();
    }, [savingGoalData, categoryExpenseData, totalExpenseData, expensesData]);

    // Track component mount (for progress animation)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Split category thresholds into two columns
    const cats = savingGoalData?.savingGoal?.categoricalThresholds || [];
    const mid = Math.ceil(cats.length / 2);
    const firstHalf = cats.slice(0, mid);
    const secondHalf = cats.slice(mid);

    // Handle delete saving goal action
    const handleDeleteGoal = async () => {
        try {
            const goalId = savingGoalData?.savingGoal.id;
            const ok = window.confirm('Are you sure you want to delete saving goals?');
            if (!ok) return;
            await deleteSavingGoal({ variables: { deleteSavingGoalId: goalId } });
            alert("Saving Goal has been deleted");
            refetchSavingGoal();
            refetchCategory();
            refetchTotal();
        } catch (err) {
            console.error(err.message);
        }
    };

    // Show loading spinner while fetching
    if (isLoading) return <Spinner />;

    return (
        <div className={styles.homeContainer}>
            {savingGoalData?.savingGoal ? (
                <>
                    {/* Page Header */}
                    <div className={styles.pageHeading}>
                        <h1>{formatMonthYear()}, Saving Goals</h1>
                        <button className={styles.editBtn} onClick={() => navigate('/saving-goal/edit')}>
                            <EditIcon size={20} />
                        </button>
                        <button className={styles.deleteBtn} onClick={handleDeleteGoal}>
                            <DeleteIcon size={20} />
                        </button>
                    </div>

                    {/* Progress Section */}
                    <div className={styles.savingsWrapper}>
                        <div className={styles.mainProgress}>
                            <div className={styles.progressHeading}>
                                <p>Total Budget</p>
                                <p>${totalSpent?.toFixed(2)} / ${totalThreshold.toFixed(2)}</p>
                            </div>

                            <div className={styles.progressBarContainer}>
                                <div
                                    className={`${styles.progressBar} ${styles[barColor(totalSpent / totalThreshold)]}`}
                                    style={{ width: mounted ? `${Math.min((totalSpent / totalThreshold) * 100, 100)}%` : "0%" }}
                                ></div>
                            </div>

                            <span>{((totalSpent / totalThreshold) * 100).toFixed(2)}% used</span>
                        </div>

                        {/* Category Breakdown */}
                        <div className={styles.overview}>
                            <div className={styles.wrapper}>
                                <h1>Categorical Budget</h1><br />
                                <SavingsChart savingGoalData={savingGoalData} categoryExpenseData={categoryExpenseData} />
                            </div>

                            <div className={styles.categorySplit}>
                                {/* First Column */}
                                <div className={styles.categoryHolder}>
                                    {firstHalf.map(({ category, amount: threshold }) => {
                                        const spent = categoryExpenseData?.categoryExpense.find((c) => c.category === category)?.amount || 0;
                                        const percentage = Math.min((spent / threshold) * 100, 100);
                                        const isExpanded = expandedCategory === category;
                                        const categoryExpenses = filteredExpenses(category);

                                        return (
                                            <div
                                                className={styles.categoryProgress}
                                                key={category}
                                                onClick={() => toggleCategory(category)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className={styles.categoryHeading}>
                                                    <p>{category.charAt(0) + category.slice(1).toLowerCase()}</p>
                                                    <p>${spent.toFixed(2)} / ${threshold.toFixed(2)}</p>
                                                </div>

                                                <div className={styles.progressBarContainer}>
                                                    <div
                                                        className={`${styles.progressBar} ${styles[barColor(spent / threshold)]}`}
                                                        style={{ width: mounted ? `${percentage}%` : "0%" }}
                                                    ></div>
                                                </div>

                                                <span>{percentage.toFixed(2)}% used</span>

                                                {isExpanded && (
                                                    <div className={styles.accordionContent}>
                                                        {categoryExpenses?.length > 0 ? (
                                                            categoryExpenses.map((exp) => {
                                                                const expDate = new Date(parseInt(exp.date, 10));
                                                                const formattedDate = new Date(Number(expDate) + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

                                                                return (
                                                                    <div key={exp.id} className={styles.expenseRow}>
                                                                        <p>{formattedDate}: &nbsp;</p>
                                                                        <p>{exp.name}&nbsp; — &nbsp;</p>
                                                                        <p>${exp.amount.toFixed(2)}</p>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className={styles.noExpenses}>No expenses this month.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Second Column (same logic) */}
                                <div className={styles.categoryHolder}>
                                    {secondHalf.map(({ category, amount: threshold }) => {
                                        const spent = categoryExpenseData?.categoryExpense.find((c) => c.category === category)?.amount || 0;
                                        const percentage = Math.min((spent / threshold) * 100, 100);
                                        const isExpanded = expandedCategory === category;
                                        const categoryExpenses = filteredExpenses(category);

                                        return (
                                            <div
                                                className={styles.categoryProgress}
                                                key={category}
                                                onClick={() => toggleCategory(category)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className={styles.categoryHeading}>
                                                    <p>{category.charAt(0) + category.slice(1).toLowerCase()}</p>
                                                    <p>${spent.toFixed(2)} / ${threshold.toFixed(2)}</p>
                                                </div>

                                                <div className={styles.progressBarContainer}>
                                                    <div
                                                        className={`${styles.progressBar} ${styles[barColor(spent / threshold)]}`}
                                                        style={{ width: mounted ? `${percentage}%` : "0%" }}
                                                    ></div>
                                                </div>

                                                <span>{percentage.toFixed(2)}% used</span>

                                                {isExpanded && (
                                                    <div className={styles.accordionContent}>
                                                        {categoryExpenses?.length > 0 ? (
                                                            categoryExpenses.map((exp) => {
                                                                const expDate = new Date(parseInt(exp.date, 10));
                                                                const formattedDate = new Date(Number(expDate) + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

                                                                return (
                                                                    <div key={exp.id} className={styles.expenseRow}>
                                                                        <p>{formattedDate}: &nbsp;</p>
                                                                        <p>{exp.name}&nbsp; — &nbsp;</p>
                                                                        <p>${exp.amount.toFixed(2)}</p>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className={styles.noExpenses}>No expenses this month.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                // If no saving goal is set
                <div className={styles.savingBtnHolder}>
                    <button className={styles.addGoalButton} onClick={() => navigate('/saving-goal')}>Setup Goal</button><br />
                    <p>Setup your monthly saving goals here</p>
                </div>
            )}
        </div>
    );
}

export default SavingProgress;
