import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto py-4">
      <div className="container mx-auto px-4 md:px-8 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} MarketBoost AI. Dibangun khusus untuk membantu menaikkan ratting dan penjualan produk Anda.</p>
      </div>
    </footer>
  );
};