import Navbar from './Navbar'
import Footer from './Footer'
import { useLocation, Outlet } from 'react-router-dom' 
import styles from '../styles/Layout.module.css'

const Layout = () => {
    const location = useLocation()
    let mainClass = styles.defaultMain

    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/reset-password') || location.pathname == '/register') {
        mainClass = styles.loginMain
    }
    return (
        <>
            <Navbar />
            <main className={mainClass}>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default Layout
