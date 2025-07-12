const Spinner = () => {
    return (
        <>
            <style>{`
                .custom-spinner-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }

                .custom-spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid rgba(255, 255, 255, 0.3);
                    border-top: 5px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            <div className="custom-spinner-container">
                <div className="custom-spinner"></div>
            </div>
        </>
    )
}

export default Spinner
