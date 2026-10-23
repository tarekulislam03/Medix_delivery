import React from 'react';
import BottomSheet from './BottomSheet';
import PhoneLogin from './PhoneLogin';

export default function PhoneOtpSheet({ isOpen, onClose, onVerified, defaultMode = 'login', initialPhone = '', initialName = '' }) {
  const handleSuccess = (authData) => {
    onVerified?.(authData);
    onClose?.();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Medix Account"
    >
      <div className="pb-3">
        <PhoneLogin
          onSuccess={handleSuccess}
          onCancel={onClose}
          defaultMode={defaultMode}
          initialPhone={initialPhone}
          initialName={initialName}
        />
      </div>
    </BottomSheet>
  );
}
