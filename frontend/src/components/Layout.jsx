import Navbar from './Navbar'
import { useLocation, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { MenuIcon } from './Icons'
import styles from '../styles/Layout.module.css'

const SIDEBAR_KEY = 'app_sidebar_collapsed';

const Layout = () => {
    const location = useLocation()
    const token = localStorage.getItem('token')
    const [collapsed, setCollapsed] = useState(() => {
        const saved = window.localStorage.getItem(SIDEBAR_KEY);
        return window.innerWidth < 701 ? false : saved === 'true';
    })

    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 701);
    const [scrolled, setScrolled] = useState(false);

    const gridColumns = !token
        ? '1fr'
        : isMobile
            ? '1fr'
            : collapsed
                ? '65px 1fr'
                : '250px 1fr'

    const segments = location.pathname.split('/')
    const pageName = segments[1] ? segments[1].charAt(0).toUpperCase() + segments[1].slice(1) : ''

    useEffect(() => {
        window.localStorage.setItem(SIDEBAR_KEY, collapsed);
    }, [collapsed]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const nowMobile = window.innerWidth < 701;
            setIsMobile(nowMobile);
            if (nowMobile) {
                if (collapsed !== false) {
                    setCollapsed(false);
                }
            } else {
                if (mobileOpen) {
                    setMobileOpen(false);
                }
            }
        }

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [collapsed, mobileOpen]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : 'auto'
        return () => { document.body.style.overflow = 'auto' }
    }, [mobileOpen])

    return (
        <div id='layout' className={styles.layout} style={{ gridTemplateColumns: gridColumns }}>
            {token && <Navbar collapsed={collapsed} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />}
            <div>
                {token && !mobileOpen &&
                    <div className={styles.header}>
                        <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(prev => !prev)}><MenuIcon size={20} color='white' /></button>
                        <button className={styles.menuBtn} onClick={() => setCollapsed(prev => !prev)}><MenuIcon size={20} color='white' /></button>
                        <a href='/'>Home</a>
                        {pageName && (<a href='#'> <span>&nbsp; » &nbsp;</span>{pageName}</a>)}
                    </div>}
                <main className={styles.defaultMain}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Layout
