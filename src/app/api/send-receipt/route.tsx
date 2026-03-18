import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ReceiptEmail } from '@/components/emails/receipt-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transactionId, customerEmail, customerName, total, items, method, currency, storeName } = body;

    console.log(`[API] Attempting to send receipt to ${customerEmail}...`);

    const { data, error } = await resend.emails.send({
      from: 'Retail Master <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Your receipt for transaction #${transactionId}`,
      react: (
        <ReceiptEmail
          customerName={customerName}
          transactionId={transactionId}
          items={items}
          total={total}
          method={method}
          currency={currency}
          storeName={storeName}
          date={new Date().toLocaleDateString()}
        />
      ),
    });

    if (error) {
      console.error("[API] Resend Error:", error);
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Receipt sent successfully to ${customerEmail}`,
      data 
    });
  } catch (error: any) {
    console.error("[API] Email API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to send email" 
    }, { status: 500 });
  }
}
