import type { Invoice } from '@/lib/types';

export function InvoicePdfTemplate({ invoice }: { invoice: Invoice }) {
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '40px',
      backgroundColor: '#ffffff',
      color: '#000000',
      lineHeight: '1.6',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 30px 0', fontWeight: 'bold' }}>Invoice</h1>
      </div>

      {/* Invoice Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '40px',
        fontSize: '14px',
      }}>
        <div>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#666' }}>Invoice Number</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#666' }}>Client</p>
            <p style={{ margin: 0 }}>{invoice.client}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#666' }}>Issue Date</p>
            <p style={{ margin: 0 }}>{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#666' }}>Due Date</p>
            <p style={{ margin: 0 }}>{formatDate(invoice.dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Status</p>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{invoice.status}</p>
      </div>

      {/* Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '40px',
        fontSize: '14px',
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Description</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Quantity</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Unit Price</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px', textAlign: 'left' }}>{item.description}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>${Number(item.unitPrice).toFixed(2)}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '40px',
      }}>
        <div style={{ width: '200px', fontSize: '14px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid #ddd',
            marginBottom: '10px',
          }}>
            <span>Subtotal</span>
            <span>${invoice.amount.toFixed(2)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 'bold',
          }}>
            <span>Total</span>
            <span>${invoice.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        fontSize: '12px',
        color: '#666',
      }}>
        <p style={{ margin: 0 }}>Thank you for your business!</p>
      </div>
    </div>
  );
}
