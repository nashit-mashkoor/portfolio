'use client';

import { motion } from 'framer-motion';

interface Props {
  totalExplored: number;
  isZoomed: boolean;
  onZoomOut: () => void;
}

export default function Navbar({ totalExplored, isZoomed, onZoomOut }: Props) {
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 20,
        borderBottom: '1px solid rgba(0, 245, 212, 0.08)',
        background: 'rgba(2, 4, 8, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isZoomed ? (
          <button
            onClick={onZoomOut}
            style={{
              background: 'none',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              color: '#00f5d4',
              fontSize: '0.7rem',
              padding: '0.3rem 0.7rem',
              borderRadius: '4px',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00f5d4';
              e.currentTarget.style.background = 'rgba(0, 245, 212, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 245, 212, 0.3)';
              e.currentTarget.style.background = 'none';
            }}
          >
            BACK
          </button>
        ) : (
          <span style={{
            color: '#00f5d4',
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}>
            NASHIT
          </span>
        )}
      </div>

      <div style={{
        color: '#00f5d4',
        fontSize: '0.65rem',
        letterSpacing: '0.15em',
        opacity: 0.5,
      }}>
        {isZoomed ? 'ESC to exit' : `${totalExplored} explored`}
      </div>
    </motion.nav>
  );
}
