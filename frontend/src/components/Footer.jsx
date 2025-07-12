import styles from '../styles/Footer.module.css'
import { useNavigate } from 'react-router-dom'
import { FacebookIcon, TwitterIcon, InstagramIcon } from './Icons'

const Footer = () => {
    const navigate = useNavigate()

    const handleDemoLogin = () => {
        navigate('/login', {
            state: {
                demo: true,
                email: 'demo@kaneflow.com',
                pass: 'demo1234'
            }
        })
    }

    return (
        <footer>
            <div className={styles.container}>
                <div className={styles.footerHolder}>
                    <div className={styles.top}>
                        <div className={styles.footerText}>
                            <h1>Ready to Take Control <br /> of Your Spending?</h1>
                            <p>Join thousands taking control of their finances with KaneFlow. <br />
                                Whether you're tracking expenses, saving smarter, or building better habits — <br />
                                KaneFlow is with you every step of the way</p>
                        </div>
                        <div className={styles.footerBtn}>
                            <button className={styles.demoBtn} onClick={handleDemoLogin}>Try Out Demo</button>
                        </div>
                    </div>
                    <div className={styles.bottom}>
                        <h2>KaneFlow.</h2>
                        <div className={styles.footerIcons}>
                            <a href='#'><FacebookIcon size={25} color='white' /></a>
                            <a href='#'><TwitterIcon size={25} color='white' /></a>
                            <a href='#'><InstagramIcon size={25} color='white' /></a>
                        </div>
                        <p>financetracker468@gmail.com</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
