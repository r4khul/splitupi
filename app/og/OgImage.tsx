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
        fontFamily: '"Inter", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background architectural guides (Dashed lines matching the dashboard style) */}
      <div style={{ position: 'absolute', top: 0, left: 160, width: 1, height: 630, borderLeft: '1px dashed rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', top: 0, right: 160, width: 1, height: 630, borderLeft: '1px dashed rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, width: 1200, height: 1, borderTop: '1px dashed rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: 140, left: 0, width: 1200, height: 1, borderTop: '1px dashed rgba(255,255,255,0.06)' }} />
      
      {/* Aurora glow - Centered perfectly using left: 200 (since Satori doesn't support transform) */}
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          left: 200,
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(51, 109, 247, 0.18) 0%, transparent 65%)',
          zIndex: 0,
        }}
      />

      {/* Content wrapper with precise alignment inside the vertical grid boundaries */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 1200,
          height: 630,
          paddingLeft: 220,
          paddingRight: 220,
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        
        {/* Header / Logo (Vertically centered within the 140px header height) */}
        <div style={{ display: 'flex', alignItems: 'center', height: 140 }}>
          <img
            src={logoDataUri}
            width={40}
            height={40}
            style={{ borderRadius: 10, marginRight: 14 }}
          />
          <div style={{ 
            fontFamily: '"Instrument Serif", serif', 
            fontSize: 40, 
            color: '#f3f3f5',
            display: 'flex',
            fontWeight: 400,
          }}>
            split<span style={{ color: '#336df7' }}>UPI</span>
          </div>
        </div>

        {/* Main Content (Vertically centered within the 350px middle block) */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 350, gap: 18 }}>
          <div style={{ 
            fontFamily: '"Instrument Serif", serif',
            fontSize: 88, 
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
            fontSize: 30, 
            fontWeight: 400,
            color: '#aeb0b8',
            maxWidth: '90%',
            lineHeight: 1.45,
            display: 'flex',
          }}>
            {description}
          </div>
        </div>

        {/* Footer / Domain or details (Vertically centered within the 140px footer height) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#336df7' }} />
            <span style={{ color: '#74757d', fontSize: 20, fontFamily: '"Inter", sans-serif' }}>
              https://splitupi.rakhul.me
            </span>
          </div>
          <div style={{ display: 'flex', color: '#74757d', fontSize: 20, fontFamily: '"Inter", sans-serif' }}>
            Paid in seconds.
          </div>
        </div>

      </div>
    </div>
  );
}
