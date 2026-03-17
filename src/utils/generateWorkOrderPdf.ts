/**
 * Generate a styled HTML-based PDF for a work order using browser print.
 */
export function generateWorkOrderPdf(order: {
  order_number: string;
  supplier_name: string;
  supplier_number: string;
  description: string;
  work_type: string;
  approved_amount: number;
  execution_date: string | null;
  status: string;
  ordering_user: string;
  notes: string;
  company_name: string;
  created_at: string;
}, statusLabel: string) {
  const date = order.execution_date
    ? new Date(order.execution_date).toLocaleDateString('he-IL')
    : 'לא נקבע';
  const createdDate = new Date(order.created_at).toLocaleDateString('he-IL');

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>הזמנת עבודה ${order.order_number}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; direction: rtl; padding: 40px; color: #1a1a1a; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; color: #2563eb; margin-bottom: 4px; }
    .header .order-num { font-size: 18px; color: #64748b; font-family: monospace; }
    .header .company { font-size: 14px; color: #94a3b8; margin-top: 8px; }
    .header .date-block { text-align: left; font-size: 13px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    table th { background: #f1f5f9; color: #475569; font-size: 13px; padding: 10px 16px; text-align: right; border: 1px solid #e2e8f0; }
    table td { padding: 12px 16px; font-size: 15px; border: 1px solid #e2e8f0; }
    .status { display: inline-block; padding: 4px 14px; border-radius: 12px; font-size: 13px; font-weight: bold; }
    .status-open { background: #fef3c7; color: #92400e; }
    .status-in_progress { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-closed { background: #f1f5f9; color: #475569; }
    .notes-section { margin-top: 16px; padding: 16px; border: 1px dashed #cbd5e1; border-radius: 8px; background: #fafafa; }
    .notes-section h3 { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .notes-section p { font-size: 14px; line-height: 1.6; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
    .signature-area { margin-top: 50px; display: flex; justify-content: space-between; }
    .signature-box { width: 200px; text-align: center; }
    .signature-line { border-top: 1px solid #1a1a1a; margin-bottom: 6px; }
    .signature-label { font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>הזמנת עבודה</h1>
      <div class="order-num">${order.order_number}</div>
      <div class="company">${order.company_name}</div>
    </div>
    <div class="date-block">
      <div>תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}</div>
      <div>תאריך יצירה: ${createdDate}</div>
    </div>
  </div>

  <table>
    <tr><th>שדה</th><th>פרטים</th></tr>
    <tr><td>שם ספק</td><td>${order.supplier_name} (${order.supplier_number})</td></tr>
    <tr><td>תיאור העבודה</td><td>${order.description}</td></tr>
    <tr><td>סוג עבודה</td><td>${order.work_type || '—'}</td></tr>
    <tr><td>סכום מאושר</td><td><strong>₪${order.approved_amount?.toLocaleString()}</strong></td></tr>
    <tr><td>תאריך ביצוע</td><td>${date}</td></tr>
    <tr><td>סטטוס</td><td><span class="status status-${order.status}">${statusLabel}</span></td></tr>
    <tr><td>מוציא הזמנה</td><td>${order.ordering_user}</td></tr>
  </table>

  ${order.notes ? `
  <div class="notes-section">
    <h3>הערות</h3>
    <p>${order.notes}</p>
  </div>` : ''}

  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">חתימת מזמין</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">חתימת ספק</div>
    </div>
  </div>

  <div class="footer">
    <span>הופק ממערכת ניהול צי רכב</span>
    <span>${order.order_number} | ${order.supplier_name}</span>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
