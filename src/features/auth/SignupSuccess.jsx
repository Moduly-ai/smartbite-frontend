import React, { useState } from 'react';

const Field = ({ label, value, copyable = false, secret = false }) => {
  const [copied, setCopied] = useState(false);
  const display = secret ? value : value;

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(value ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={display ?? ''}
          className="flex-1 form-input bg-gray-50"
        />
        {copyable && (
          <button
            type="button"
            onClick={doCopy}
            className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm text-gray-700"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
};

const SignupSuccess = ({ result, onContinue, onBackToLogin }) => {
  const user = result?.user;
  const creds = result?.data?.credentials || {};

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Account Created</h2>
            <p className="mt-1 text-sm text-gray-600">Save your credentials below. You are now signed in.</p>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 mb-6">
            Important: Save your PIN in a safe place. You’ll need it to sign in. For security, this page may not be shown again.
          </div>

          <Field label="Owner Name" value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()} />
          <Field label="Email" value={user?.email} copyable />
          <Field label="User ID" value={creds.userId} copyable />
          <Field label="Generated PIN" value={creds.pin} copyable />

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onBackToLogin}
              className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Back to Login
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="flex-1 py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccess;
