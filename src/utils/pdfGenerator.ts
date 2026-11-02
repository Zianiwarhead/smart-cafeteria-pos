import { jsPDF } from "jspdf";
import { OrderRecord } from "../types";

export function generateReceiptPdf(order: OrderRecord) {
  // 80mm thermal receipt roll width, dynamic height
  const receiptWidth = 80; // mm
  const baseHeight = 160; // mm
  const dynamicHeight = Math.max(170, baseHeight + order.items.length * 9);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [receiptWidth, dynamicHeight],
  });

  doc.setFont("courier", "normal");
  doc.setTextColor(20, 20, 20);

  let y = 10;
  const left = 5;
  const right = receiptWidth - 5;
  const centerX = receiptWidth / 2;

  // Header
  doc.setFontSize(13);
  doc.setFont("courier", "bold");
  doc.text("SMART CAFETERIA", centerX, y, { align: "center" });
  y += 5;

  doc.setFontSize(8);
  doc.setFont("courier", "normal");
  doc.text("STUDENT DINING PRE-ORDER SYSTEM", centerX, y, { align: "center" });
  y += 4;
  doc.text("NAIROBI CAMPUS // STATION 04", centerX, y, { align: "center" });
  y += 6;

  // Queue Call Box
  doc.setFillColor(25, 25, 25);
  doc.rect(left, y, receiptWidth - 10, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text(
    `QUEUE TICKET: #${order.queueNumber.toString().padStart(3, "0")}`,
    centerX,
    y + 5.5,
    { align: "center" }
  );
  y += 12;

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(7.5);
  doc.setFont("courier", "normal");

  const drawDashedLine = (posY: number) => {
    doc.setLineDashPattern([1, 1], 0);
    doc.line(left, posY, right, posY);
    doc.setLineDashPattern([], 0);
  };

  // Order Info
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, left, y);
  doc.text(`TIME: ${order.timestamp}`, right, y, { align: "right" });
  y += 4;

  doc.text(`ORDER ID: ${order.orderId}`, left, y);
  doc.text(`M-PESA: ${order.transactionCode}`, right, y, { align: "right" });
  y += 4;

  doc.text(`STUDENT: ${order.customerName}`, left, y);
  y += 4;

  doc.text(`PHONE:   ${order.phone}`, left, y);
  y += 4;

  doc.text(`TYPE:    ${order.type.toUpperCase()}`, left, y);
  if (order.type === "preorder") {
    doc.text(`SLOT: ${order.pickupSlot}`, right, y, { align: "right" });
  }
  y += 5;

  drawDashedLine(y);
  y += 4;

  // Items Header
  doc.setFont("courier", "bold");
  doc.text("QTY ITEM", left, y);
  doc.text("KES", right, y, { align: "right" });
  y += 3;
  drawDashedLine(y);
  y += 4;

  // Items List
  doc.setFont("courier", "normal");
  order.items.forEach((item) => {
    const qtyStr = `${item.quantity}x`;
    const nameStr = item.item.name.length > 22 ? item.item.name.substring(0, 20) + ".." : item.item.name;
    const priceStr = (item.quantity * item.item.price).toLocaleString();

    doc.text(`${qtyStr} ${nameStr}`, left, y);
    doc.text(priceStr, right, y, { align: "right" });
    y += 4;
  });

  drawDashedLine(y);
  y += 4;

  // Financial Breakdown
  doc.text("SUBTOTAL:", left, y);
  doc.text(`KES ${order.subtotal.toLocaleString()}`, right, y, { align: "right" });
  y += 4;

  doc.text("VAT 16% (INCL):", left, y);
  doc.text(`KES ${order.tax.toLocaleString()}`, right, y, { align: "right" });
  y += 4;

  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL PAID:", left, y);
  doc.text(`KES ${order.total.toLocaleString()}`, right, y, { align: "right" });
  y += 6;

  drawDashedLine(y);
  y += 5;

  // Barcode simulation
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text(`*${order.transactionCode}*`, centerX, y, { align: "center" });
  y += 3;

  // Draw simulated barcode lines
  const barcodeStart = left + 8;
  const barcodeWidth = receiptWidth - 26;
  const numBars = 36;
  const step = barcodeWidth / numBars;

  for (let i = 0; i < numBars; i++) {
    const barWeight = (i % 3 === 0 || i % 7 === 0) ? 0.6 : 0.25;
    doc.setLineWidth(barWeight);
    doc.line(barcodeStart + i * step, y, barcodeStart + i * step, y + 8);
  }
  y += 12;

  // Footer notes
  doc.setFontSize(7);
  doc.text(`~ EST. PREP TIME: ${order.estimatedWaitMinutes} MINS ~`, centerX, y, { align: "center" });
  y += 4;
  doc.text("PRESENT TICKET AT DISPATCH COUNTER", centerX, y, { align: "center" });
  y += 3.5;
  doc.text("THANK YOU FOR YOUR ORDER!", centerX, y, { align: "center" });

  doc.save(`receipt_${order.transactionCode}.pdf`);
}
