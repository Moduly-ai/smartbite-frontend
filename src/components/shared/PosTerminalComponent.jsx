import React from 'react';

const PosTerminalComponent = ({ 
  terminals, 
  terminalData, 
  onInputChange, 
  totalEftpos 
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">POS Terminals</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {terminals.map((terminal, index) => {
          if (!terminal.enabled) return null;
          
          const terminalKey = `terminal${index + 1}`;
          
          return (
            <div key={terminalKey} className="space-y-2">
              <label className="form-label">
                {terminal.name} ($)
              </label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={terminalData[terminalKey] || ''}
                onChange={(e) => onInputChange(`eftpos.${terminalKey}`, e.target.value)}
                placeholder="0.00"
              />
              <div className="text-xs text-gray-500">
                Terminal {index + 1}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Total EFTPOS:</strong> ${(totalEftpos || 0).toFixed(2)}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Sum of all enabled POS terminals
        </p>
      </div>
    </div>
  );
};

export default PosTerminalComponent;