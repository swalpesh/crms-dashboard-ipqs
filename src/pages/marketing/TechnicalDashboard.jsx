import React from 'react';
import TechnicalDashboardOverview from './Technicaldashboardoverview';

export default function TechnicalDashboard() {
  return (
    <div style={{ 
      width: '100%',             // Forces container to take full width
      minHeight: '100vh',        // Ensures it covers full height
      padding: '30px',           // Adds spacing around the edges
      boxSizing: 'border-box',   // Prevents padding from creating scrollbars
      background: 'radial-gradient(circle at 10% 20%, rgb(42, 28, 75) 0%, rgb(15, 10, 30) 90%)',
      color: 'white',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflowX: 'hidden'        // Prevents accidental horizontal scroll
    }}>
      {/* The overview component will now fill this 100% width container */}
      <TechnicalDashboardOverview />
    </div>
  );
}