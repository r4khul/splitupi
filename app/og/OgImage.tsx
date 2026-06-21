import React from 'react';

type OgImageProps = {
  title: string;
  description: string;
  logoDataUri: string;
};

export default function OgImage({ title, description, logoDataUri }: OgImageProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#08080a",
        padding: "80px",
        fontFamily: '"Inter", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background architectural guides */}
      <div style={{ position: 'absolute', top: 0, left: 160, width: 1, height: '100%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', top: 0, right: 160, width: 1, height: '100%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', top: 160, left: 0, width: '100%', height: 1, background: 'rgba(255,255,255,0.04)' }} />
      
      {/* Aurora glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(51, 109, 247, 0.2) 0%, transparent 60%)',
          zIndex: 0,
        }}
      />

      {/* Content wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', zIndex: 10 }}>
        
        {/* Header / Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={logoDataUri}
            width={48}
            height={48}
            style={{ borderRadius: 12, marginRight: 16 }}
          />
          <div style={{ 
            fontFamily: '"Instrument Serif", serif', 
            fontSize: 48, 
            color: '#f3f3f5',
            display: 'flex',
            fontWeight: 400,
          }}>
            split<span style={{ color: '#336df7' }}>UPI</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 'auto', marginBottom: 'auto', zIndex: 10 }}>
          <div style={{ 
            fontFamily: '"Instrument Serif", serif',
            fontSize: 104, 
            fontWeight: 400,
            lineHeight: 1.05,
            color: '#f3f3f5',
            letterSpacing: '-0.02em',
            display: 'flex',
          }}>
            {title}
          </div>
          <div style={{ 
            fontFamily: '"Inter", sans-serif',
            fontSize: 36, 
            fontWeight: 400,
            color: '#aeb0b8',
            maxWidth: '85%',
            lineHeight: 1.4,
            display: 'flex',
          }}>
            {description}
          </div>
        </div>

        {/* Footer / Domain or details */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.11)', paddingTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#336df7' }} />
            <span style={{ color: '#74757d', fontSize: 22, fontFamily: '"Inter", sans-serif', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500 }}>
              splitupi.com
            </span>
          </div>
          <div style={{ display: 'flex', color: '#74757d', fontSize: 24, fontFamily: '"Inter", sans-serif' }}>
            Paid in seconds.
          </div>
        </div>

      </div>
    </div>
  );
}
