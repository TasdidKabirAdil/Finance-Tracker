function Modal({ children, onClose }) {
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  };

  const containerStyle = {
    backgroundColor: 'rgba(66, 65, 65)',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    minWidth: '300px',
    position: 'relative'
  };

  const closeStyle = {
    position: 'absolute',
    top: '0.5rem',
    right: '0.75rem',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        <button onClick={onClose} style={closeStyle}>&times;</button>
        {children}
      </div>
    </div>
  );
}


export default Modal
