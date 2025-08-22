import React from 'react';

const RegisterComponent = ({ 
  registerNumber, 
  registerName, 
  registerData, 
  onInputChange, 
  breakdown, 
  reserveAmount = 400 
}) => {
  const total = breakdown?.total || 0;
  const bankingAmount = Math.max(0, total - reserveAmount);

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{registerName}</h3>
        <p className="text-sm text-gray-600">Register {registerNumber}</p>
      </div>

      {/* Notes */}
      <div>
        <h4 className="text-lg font-medium mb-4">Notes</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: '$100', key: 'hundreds' },
            { label: '$50', key: 'fifties' },
            { label: '$20', key: 'twenties' },
            { label: '$10', key: 'tens' },
            { label: '$5', key: 'fives' }
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input
                type="number"
                className="form-input"
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
                value={registerData[key] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    onInputChange(`register${registerNumber}.${key}`, val);
                  }
                }}
                placeholder="0"
                onWheel={e => e.target.blur()}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
          <strong>Notes Total: ${(breakdown?.notes || 0).toFixed(2)}</strong>
        </div>
      </div>

      {/* Loose Coins */}
      <div>
        <h4 className="text-lg font-medium mb-4">Loose Coins</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: '$2', key: 'twos' },
            { label: '$1', key: 'dollars' },
            { label: '50¢', key: 'fifties' },
            { label: '20¢', key: 'twenties' },
            { label: '10¢', key: 'tens' },
            { label: '5¢', key: 'fives' }
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input
                type="number"
                step="1"
                className="form-input"
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
                value={registerData.loose?.[key] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    onInputChange(`register${registerNumber}.loose.${key}`, val);
                  }
                }}
                placeholder="0"
                onWheel={e => e.target.blur()}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
          <strong>Loose Coins Total: ${(breakdown?.loose || 0).toFixed(2)}</strong>
        </div>
      </div>

      {/* Coin Bags/Rolls */}
      <div>
        <h4 className="text-lg font-medium mb-4">Coin Bags/Rolls</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: '$1 Roll ($20)', key: 'dollars' },
            { label: '$2 Roll ($50)', key: 'twos' },
            { label: '50¢ Roll ($10)', key: 'fifties' },
            { label: '20¢ Roll ($4)', key: 'twenties' },
            { label: '10¢ Roll ($4)', key: 'tens' },
            { label: '5¢ Roll ($2)', key: 'fives' }
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input
                type="number"
                className="form-input"
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
                value={registerData.coinBags?.[key] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    onInputChange(`register${registerNumber}.coinBags.${key}`, val);
                  }
                }}
                placeholder="0"
                onWheel={e => e.target.blur()}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 bg-orange-50 rounded text-sm">
          <strong>Coin Rolls Total: ${(breakdown?.coinBags || 0).toFixed(2)}</strong>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-green-800">
              <strong>{registerName} Total Cash:</strong>
            </p>
            <p className="text-2xl font-bold text-green-900">
              ${total.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-green-700">
              <strong>Available for Banking:</strong>
            </p>
            <p className="text-2xl font-bold text-green-800">
              ${bankingAmount.toFixed(2)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              (Reserve: ${reserveAmount.toFixed(2)})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponent;