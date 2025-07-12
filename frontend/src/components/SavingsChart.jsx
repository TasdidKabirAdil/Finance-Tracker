import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import styles from '../styles/SavingProgress.module.css'

ChartJS.register(ArcElement, Tooltip, Legend);

const centerTextPlugin = {
    id: "centerText",
    beforeDraw: chart => {
        const { ctx, width, height, data } = chart;
        ctx.save();

        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
        const label = "Remaining";
        const value = `$${total.toFixed(2)}`;

        const labelFontSize = Math.min(width, height) / 16;
        const valueFontSize = Math.min(width, height) / 9;

        // Y positions
        const centerY = height / 2.5;
        const gap = 20;

        // Draw label
        ctx.font = `bold ${labelFontSize}px sans-serif`;
        ctx.fillStyle = "#aaa";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, width / 2, centerY - gap);

        // Draw value
        ctx.font = `bold ${valueFontSize}px sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.fillText(value, width / 2, centerY + gap);

        ctx.restore();
    }
};

const CATEGORY_COLORS = {
    MISC: '#0088FE',
    FOOD: '#FF9B45',
    RENT: '#FFC107',
    TRANSPORT: '#F7374F',
    SUBSCRIPTION: '#85193C',
    UTILITY: '#3F7D58',
    GAMES: '#284367ff',
    ENTERTAINMENT: '#471396',
    SHOPPING: '#604652',
    GIFT: '#CF0F47',
    HEALTHCARE: '#5EABD6',
    INSURANCE: '#06923E',
}


export default function SavingsChart({ savingGoalData, categoryExpenseData }) {
    const cats = savingGoalData?.savingGoal.categoricalThresholds;
    const thresholds = cats.map(c => c.amount);
    const spent = cats.map(({ category }) =>
        categoryExpenseData?.categoryExpense.find(x => x.category === category)?.amount || 0
    );
    // remaining = threshold – spent
    const remaining = thresholds.map((t, i) => Math.max(t - spent[i], 0));

    const labels = cats.map(c =>
        c.category.charAt(0).toUpperCase() + c.category.slice(1).toLowerCase()
    );

    const backgroundColor = cats.map(c =>
        CATEGORY_COLORS[c.category] || "#888888"
    );

    const data = {
        labels,
        datasets: [{
            data: remaining,
            backgroundColor,
            borderColor: "white",
            borderRadius: 6,
            borderWidth: 2,
        }]
    };

    const options = {
        cutout: "65%",
        responsive: true,
        maintainAspectRatio: false,
        hoverOffset: 8,
        animation: {
            animateRotate: true,
            duration: 600,
            easing: "easeOutQuart"
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#ccc",
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 12,
                    padding: 10
                }
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: ctx => {
                        const idx = ctx.dataIndex;
                        const used = thresholds[idx] - remaining[idx];
                        const pct = ((used / thresholds[idx]) * 100).toFixed(1);
                        return `${ctx.label}: $${used.toFixed(2)} (${pct}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className={styles.donutWrapper}>
            <Doughnut
                data={data}
                options={options}
                plugins={[centerTextPlugin]}
            />
        </div>
    );
}
