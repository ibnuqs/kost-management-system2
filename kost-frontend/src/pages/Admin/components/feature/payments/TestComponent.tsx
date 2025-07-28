// File: src/pages/Admin/components/feature/payments/TestComponent.tsx
import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
      <h3 className="text-red-800 font-bold">TEST COMPONENT VISIBLE!</h3>
      <p className="text-red-700">Jika ini muncul, berarti import berhasil</p>
    </div>
  );
};

export default TestComponent;