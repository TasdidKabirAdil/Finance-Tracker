import styles from '../styles/Home.module.css'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import { MoneyIcon, CardReportIcon, DartIcon, LockIcon, ArrowIcon } from '../components/Icons'

function Home() {
    const navigate = useNavigate()

    const handleDemoLogin = () => {
        navigate('/login', {
            state: {
                demo: true,
                email: 'demo@kaneflow.com',
                password: 'demo1234'
            }
        })
    }

    return (
        <>
            <div className={styles.landing}>
                <div className={styles.landingInner}>
                    <div className={styles.titleText}>
                        <h2>KaneFlow.</h2>
                        <h1>Empower your <br/> financial journey with <br/> KaneFlow</h1>
                        <h3>Personalized insights and guidance to help you <br /> achieve optimal expense.</h3>
                        <button className={styles.registerBtn} onClick={() => navigate('/login')}>Sign in here</button>
                    </div>
                    <div className={styles.showcase}>
                        <div className={styles.wrapper}>
                            <div className={styles.left}>
                                <div className={styles.showcaseImg1}>
                                    <img src='/public/showcase1.png'></img>
                                </div>

                                <div className={styles.showcaseImg2}>
                                    <img src='/public/showcase2.png'></img>
                                </div>
                            </div>

                            <div className={styles.showcaseImg3}>
                                <img src='/public/showcase3.png'></img>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.midSec}>
                <div className={styles.desc}>
                    <h3>KaneFlow is a smart personal finance app built to help you take control of your money,
                        track spending habits, and reach your financial goals with confidence.
                        Whether you're managing daily expenses, saving for the future, or reviewing your monthly trends,
                        KaneFlow gives you the tools and insights you need to stay on track. Designed for simplicity and clarity,
                        KaneFlow adapts to your unique financial journey — so you can focus on what matters most.</h3>
                </div>
                <div className={styles.cardHolder}>
                    <div className={styles.container}>
                        <div className={styles.cardWrapper}>
                            <div className={styles.card}>
                                <MoneyIcon size={100} />
                                <h1>Smart Expense Logging</h1>
                                <p>Easily record your daily expenses with category tagging and insightful notes to stay in control of your spending.</p>
                            </div>
                            <div className={styles.card}>
                                <CardReportIcon size={100} color='#4bb692' />
                                <h1>Visual Monthly Reports</h1>
                                <p>Get clear breakdowns of where your money goes each month with charts, trends, and category-wise insights.</p>
                            </div>
                            <div className={styles.card}>
                                <DartIcon size={100} color='#4bb692' />
                                <h1>Goal-Based Saving Tracker</h1>
                                <p>Set personal saving goals and monitor your progress with motivational nudges and milestone markers.</p>
                            </div>
                            <div className={styles.card}>
                                <LockIcon size={100} color='#4bb692' />
                                <h1>Secure Personal Dashboard</h1>
                                <p>Access your financial overview in one place with secure login and real-time data updates across all features.</p>
                            </div>
                        </div>
                        <div className={styles.btnHolder}>
                            <button className={styles.registerBtn} style={{ marginBottom: '40px'}} onClick={() => navigate('/register')}>Get Started</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.guideSec}>
                <div className={styles.container}>
                    <div className={styles.heading}>
                        <div className={styles.iconHolder}><ArrowIcon size={100} color='#003333' /> &nbsp; &nbsp; &nbsp;</div>
                        <h1>How it works</h1>
                    </div>

                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.initial}><p>1</p></div>
                            <div className={styles.content}>
                                <h1>Step 1</h1>
                                <p>Create your account and set up your financial profile with income, goals, and key spending categories.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.initial}><p>2</p></div>
                            <div className={styles.content}>
                                <h1>Step 2</h1>
                                <p>Log daily expenses and savings effortlessly while KaneFlow tracks and visualizes your habits in real time.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.initial}><p>3</p></div>
                            <div className={styles.content}>
                                <h1>Step 3</h1>
                                <p>Review monthly reports, optimize spending, and stay motivated with clear goals and progress tracking.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.imgContainer}>
                        <img src='/public/dashboard.png'></img>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button className={styles.demoBtn} onClick={handleDemoLogin}>Try Out Demo</button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Home