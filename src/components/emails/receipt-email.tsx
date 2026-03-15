import * as React from 'react';

interface ReceiptEmailProps {
  customerName: string;
  transactionId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  method: string;
  date: string;
}

export const ReceiptEmail: React.FC<Readonly<ReceiptEmailProps>> = ({
  customerName,
  transactionId,
  items,
  total,
  method,
  date,
}) => (
  <div style={{
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f9fafb',
    padding: '40px 20px',
    color: '#111827'
  }}>
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#7c3aed',
        padding: '32px',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>Retail Master</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>Transaction Receipt</p>
      </div>

      {/* Body */}
      <div style={{ padding: '32px' }}>
        <h2 style={{ marginTop: 0, fontSize: '18px', fontWeight: '700' }}>Hi {customerName},</h2>
        <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
          Thank you for your purchase! Here are the details of your transaction.
        </p>

        {/* Transaction Summary */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: '#f3f4f6',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Transaction ID</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>#{transactionId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{date}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Payment Method</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827', textTransform: 'capitalize' }}>{method}</span>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', marginTop: '32px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>ITEM</th>
              <th style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>QTY</th>
              <th style={{ textAlign: 'right', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>PRICE</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ paddingTop: '12px', paddingBottom: '12px', borderBottom: index === items.length - 1 ? 'none' : '1px solid #f3f4f6', fontSize: '14px', fontWeight: '600' }}>{item.name}</td>
                <td style={{ paddingTop: '12px', paddingBottom: '12px', borderBottom: index === items.length - 1 ? 'none' : '1px solid #f3f4f6', fontSize: '14px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ paddingTop: '12px', paddingBottom: '12px', borderBottom: index === items.length - 1 ? 'none' : '1px solid #f3f4f6', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '2px solid #f3f4f6',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginRight: '16px' }}>TOTAL PAID</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#7c3aed' }}>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid #f3f4f6'
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
          &copy; {new Date().getFullYear()} Retail Master. All rights reserved.
        </p>
      </div>
    </div>
  </div>
);
