/**
 * Composant ButtonBox ERP
 * Zone de boutons d'action contextuels
 */

import React from 'react';

interface ERPButtonBoxProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

const ERPButtonBox: React.FC<ERPButtonBoxProps> = ({ children, align = 'right' }) => {
  const alignClass = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  }[align];

  return (
    <div 
      className="erp-buttonbox"
      style={{ justifyContent: alignClass }}
    >
      {children}
    </div>
  );
};

export default ERPButtonBox;
