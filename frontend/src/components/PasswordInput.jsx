import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ label, className = '', ...inputProps }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label && <label className="label-text">{label}</label>}
      <div className="relative">
        <input
          {...inputProps}
          type={visible ? 'text' : 'password'}
          className={`input-field pr-10 ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;