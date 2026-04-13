/**
 * ESC/POS commands for thermal printers
 */
const ESC = '\x1B';
const GS = '\x1D';
const LF = '\x0A';

const COMMANDS = {
  RESET: `${ESC}@`,
  TEXT_CENTER: `${ESC}a1`,
  TEXT_LEFT: `${ESC}a0`,
  TEXT_RIGHT: `${ESC}a2`,
  TEXT_BOLD_ON: `${ESC}E1`,
  TEXT_BOLD_OFF: `${ESC}E0`,
  TEXT_SIZE_NORMAL: `${GS}!0`,
  TEXT_SIZE_DOUBLE: `${GS}!\x11`, // 2x height, 2x width
  TEXT_SIZE_LARGE: `${GS}!\x22`,  // 3x
  PAPER_FULL_CUT: `${GS}V\x42\x00`,
  INITIALIZE: `${ESC}@`,
};

export class USBPrinterDriver {
  private device: any | null = null;
  private endpointOut: number = 0;

  constructor(device: any) {
    this.device = device;
  }

  async connect(): Promise<boolean> {
    if (!this.device) return false;

    try {
      await this.device.open();
      await this.device.selectConfiguration(1);

      // Find the first interface with a bulk out endpoint
      const currentInterface = this.device.configuration?.interfaces[0];
      if (!currentInterface) throw new Error("No interface found on this device.");

      await this.device.claimInterface(currentInterface.interfaceNumber);

      const endpoint = currentInterface.alternate.endpoints.find(
        (e: any) => e.direction === "out" && e.type === "bulk"
      );

      if (!endpoint) throw new Error("No bulk data endpoint found. This device might not be an ESC/POS printer.");
      this.endpointOut = endpoint.endpointNumber;

      return true;
    } catch (err: any) {
      if (err.name === 'SecurityError' || err.message.includes('Access denied')) {
        throw new Error("ACCESS_DENIED");
      }
      console.error("USB Printer Connection Error:", err);
      throw err;
    }
  }

  async sendRaw(data: string | Uint8Array) {
    if (!this.device || !this.endpointOut) return;

    const bytes = typeof data === 'string' 
      ? new TextEncoder().encode(data)
      : data;

    await this.device.transferOut(this.endpointOut, bytes);
  }

  async printReceipt(data: {
    storeName: string;
    brand?: string;
    address?: string;
    transactionId: string;
    date: string;
    customerName: string;
    items: any[];
    total: number;
    tax: number;
    grandTotal: number;
    currency: string;
    cashierName: string;
    paymentMethod: string;
    footerText?: string;
    paperSize?: '80mm' | '58mm';
  }) {
    if (!this.device) return;

    const lineWidth = data.paperSize === '58mm' ? 32 : 42;
    const separator = "-".repeat(lineWidth);
    const thickSeparator = "=".repeat(lineWidth);

    try {
      if (!this.device.opened) {
        await this.connect();
      }

      const encoder = new TextEncoder();
      const send = (text: string) => this.sendRaw(encoder.encode(text));

      // 1. Initialize
      await this.sendRaw(COMMANDS.INITIALIZE);

      // 2. Header
      await this.sendRaw(COMMANDS.TEXT_CENTER);
      await this.sendRaw(COMMANDS.TEXT_BOLD_ON);
      // Removed TEXT_SIZE_LARGE to fix "too big" issue, using bold instead
      await send(`${data.storeName.toUpperCase()}${LF}`);
      await this.sendRaw(COMMANDS.TEXT_BOLD_OFF);
      
      if (data.brand) await send(`${data.brand.toUpperCase()}${LF}`);
      await send(`${LF}${thickSeparator}${LF}`);

      // 3. Info
      await this.sendRaw(COMMANDS.TEXT_LEFT);
      const leftPad = (label: string, value: string) => {
        const padding = lineWidth - label.length - value.length;
        return `${label}${" ".repeat(Math.max(0, padding))}${value}${LF}`;
      };

      await send(leftPad("DATE:", data.date.split(',')[0]));
      await send(leftPad("TXN :", data.transactionId.split('-').pop() || data.transactionId));
      await send(leftPad("CUST:", data.customerName.toUpperCase()));
      await send(leftPad("CASH:", data.cashierName.toUpperCase()));
      await send(`${separator}${LF}`);

      // 4. Items
      await this.sendRaw(COMMANDS.TEXT_BOLD_ON);
      await send(`ITEM${" ".repeat(lineWidth - 10)}PRICE${LF}`);
      await this.sendRaw(COMMANDS.TEXT_BOLD_OFF);
      await send(`${separator}${LF}`);

      for (const item of data.items) {
        // Name on its own line if it's long, or clipped
        const nameText = item.name.toUpperCase();
        await send(`${nameText.substring(0, lineWidth)}${LF}`);
        
        const qtyPrice = `${item.quantity} x ${item.price.toFixed(2)}`;
        const subtotal = (item.quantity * item.price).toFixed(2);
        const padding = lineWidth - qtyPrice.length - subtotal.length;
        await send(`${qtyPrice}${" ".repeat(Math.max(1, padding))}${subtotal}${LF}`);
      }
      await send(`${separator}${LF}`);

      // 5. Totals
      await send(leftPad("SUBTOTAL:", `${data.currency}${data.total.toFixed(2)}`));
      await send(leftPad("TAX:", `${data.currency}${data.tax.toFixed(2)}`));
      await this.sendRaw(COMMANDS.TEXT_BOLD_ON);
      await send(leftPad("TOTAL:", `${data.currency}${data.grandTotal.toFixed(2)}`));
      await this.sendRaw(COMMANDS.TEXT_BOLD_OFF);
      await send(`${thickSeparator}${LF}${LF}`);

      // 6. Footer
      await this.sendRaw(COMMANDS.TEXT_CENTER);
      await send(`PAID BY ${data.paymentMethod.toUpperCase()}${LF}${LF}`);
      if (data.footerText) {
        await send(`${data.footerText}${LF}`);
      }
      await send(`*** THANK YOU ***${LF}`);
      await send(`${LF}${LF}${LF}${LF}`); // Feed paper

      // 7. Cut
      await this.sendRaw(COMMANDS.PAPER_FULL_CUT);

    } catch (err) {
      console.error("Direct Print Error:", err);
      throw err;
    }
  }
}
