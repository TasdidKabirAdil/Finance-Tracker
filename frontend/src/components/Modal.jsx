import { SparkIcon2 } from "./Icons";
import styles from '../styles/SavingGoal.module.css'

function Modal({ children, onClose }) {
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    padding: '0 5%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  };

  const modalStyle = {
    position: 'relative',
    backgroundColor: 'none',
    backdropFilter: 'blur(10px)',
    maxWidth: '450px',
    minWidth: '300px',
    width: '100%',
    color: 'black',
    padding: '4rem 1.5rem 1.5rem',
    borderRadius: '15px',
    boxShadow: '0 10px 15px black',
    textAlign: 'center',
    placeItems: 'center',
  };

  const bubbleStyle = {
    position: 'absolute',
    top: '-50px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009191',
    boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
  };

  const closeStyle = {
    position: 'absolute',
    top: '0.5rem',
    right: '0.75rem',
    color: '#009191',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* top bubble for your SVG */}
        <div style={bubbleStyle}>
          <span className={styles.modalIcon}><SparkIcon2 size={60} /></span>
        </div>

        {/* close button */}
        <button onClick={onClose} style={closeStyle}>
          &times;
        </button>

        {/* modal content */}
        {children}
      </div>
    </div>
  );
}

export default Modal;
