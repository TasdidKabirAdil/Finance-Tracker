import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import styles from '../styles/Charts.module.css'
import { useState } from 'react'

const CATEGORY_COLOR = {
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


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

export default function CategoryCharts({ categoryData, monthlyData }) {
  const labels = categoryData.map(d => d.category)
  const values = categoryData.map(d => d.amount)

  const backgroundColors = categoryData.map(d =>
    CATEGORY_COLOR[d.category] ||
    COLORS[labels.indexOf(d.category) % COLORS.length]
  )

  const monthLabels = monthlyData.map(d => d.month)
  const monthValues = monthlyData.map(d => d.amount)

  const [isBar, setIsBar] = useState(true)

  // Bar chart config
  const barData = {
    labels,
    datasets: [{
      label: 'Expense',
      data: values,
      backgroundColor: backgroundColors
    }]
  }
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(255,255,255,0.1)',
          drawBorder: false
        },
        ticks: { color: '#ccc' }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(255,255,255,0.1)',
          drawBorder: false
        },
        ticks: { color: '#ccc' }
      }
    }
  }

  // Pie chart config
  const pieData = {
    labels,
    datasets: [{
      label: 'Expense',
      data: values,
      backgroundColor: backgroundColors,
      borderColor: '#222',
      borderWidth: 1
    }]
  }
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#ccc' }
      },
      title: {
        display: true,
        color: '#fff',
        font: { size: 16 }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    }
  }

  const mixedData = {
    labels: monthLabels,
    datasets: [
      {
        type: 'bar',
        label: 'Monthly Expense',
        data: monthValues,
        backgroundColor: '#009191',
        order: 2
      },
      {
        type: 'line',
        label: 'Trend',
        data: monthValues,
        borderColor: '#85193C',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#85193C',
        pointRadius: 4,
        order: 1
      }
    ]
  }

  const mixedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#ccc' } },
      title: { display: true, color: '#fff' },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#ccc' } },
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#ccc' } }
    }
  }

  return (
    <div className={styles.chartsContainer}>
      <div className={styles.wrapper}>
        <div className={styles.chartTitle}>
          <h2>Categorical Spending</h2>
          <div className={styles.chartBtns}>
            <button onClick={() => setIsBar(true)} className={`${isBar ? styles.isActive : styles.inActive}`}>Bar</button>
            <button onClick={() => setIsBar(false)} className={`${!isBar ? styles.isActive : styles.inActive}`}>Pie</button>
          </div>
        </div>
        <div className={styles.categoryChart}>
          {isBar ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <Pie data={pieData} options={pieOptions} />
          )}
        </div>
      </div>
      <div className={styles.wrapper}>
        <h2 style={{ padding: '5px 0' }}>Monthly Expense Trend</h2>
        <div style={{ minHeight: '310px' }}><Bar data={mixedData} options={mixedOptions} /></div>
      </div>
    </div>
  )
}

