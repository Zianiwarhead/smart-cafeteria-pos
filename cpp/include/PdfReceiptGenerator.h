#ifndef PDF_RECEIPT_GENERATOR_H
#define PDF_RECEIPT_GENERATOR_H

#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <iomanip>
#include "Order.h"

class PdfReceiptGenerator {
public:
    static bool generatePdf(const Order& order, const std::string& outputPath) {
        // Dimensions in PostScript points: 1 mm = 2.83465 pt
        // 80mm width standard thermal roll = 226.77 pt
        const double pageWidth = 226.77;
        const double baseHeight = 480.0;
        const double dynamicHeight = baseHeight + (order.getItems().size() * 24.0);

        std::ostringstream stream;

        // Graphic commands & text commands
        auto escapePdf = [](const std::string& s) {
            std::string out;
            for (char c : s) {
                if (c == '(' || c == ')' || c == '\\') out += '\\';
                out += c;
            }
            return out;
        };

        // Text helper
        auto drawText = [&](const std::string& font, double size, double x, double y, const std::string& text) {
            stream << "BT\n";
            stream << "/" << font << " " << std::fixed << std::setprecision(1) << size << " Tf\n";
            stream << std::fixed << std::setprecision(2) << x << " " << y << " Td\n";
            stream << "(" << escapePdf(text) << ") Tj\n";
            stream << "ET\n";
        };

        auto drawCenteredText = [&](const std::string& font, double size, double y, const std::string& text) {
            // In Courier, character width is roughly 0.6 * fontSize
            double textWidth = text.length() * (size * 0.60);
            double x = std::max(6.0, (pageWidth - textWidth) / 2.0);
            drawText(font, size, x, y, text);
        };

        auto drawDashedLine = [&](double y) {
            stream << "q\n";
            stream << "0.5 w\n";
            stream << "[2 2] 0 d\n";
            stream << "10 " << std::fixed << std::setprecision(2) << y << " m " 
                   << (pageWidth - 10) << " " << y << " l S\n";
            stream << "Q\n";
        };

        double curY = dynamicHeight - 26.0;

        // 1. Header
        drawCenteredText("F2", 13.0, curY, "SMART CAFETERIA");
        curY -= 13.0;
        drawCenteredText("F1", 7.5, curY, "STUDENT DINING PRE-ORDER SYSTEM");
        curY -= 11.0;
        drawCenteredText("F1", 7.5, curY, "NAIROBI CAMPUS // STATION 04");
        curY -= 16.0;

        // 2. Queue Call Ticket Box (filled black rect, white text)
        double boxY = curY - 11.0;
        stream << "q\n";
        stream << "0.1 0.1 0.1 rg\n";
        stream << "12 " << std::fixed << std::setprecision(2) << boxY << " " << (pageWidth - 24) << " 20 re f\n";
        stream << "Q\n";

        // White text inside box
        stream << "q\n1 1 1 rg\n";
        std::ostringstream ticketText;
        ticketText << "QUEUE TICKET: #" << std::setw(3) << std::setfill('0') << order.getQueueTicket();
        drawCenteredText("F2", 9.5, boxY + 6.0, ticketText.str());
        stream << "Q\n";

        curY -= 38.0;
        drawDashedLine(curY + 6.0);

        // 3. Metadata
        drawText("F1", 7.5, 12, curY, "DATE: " + order.getTimestamp().substr(0, 10));
        drawText("F1", 7.5, 120, curY, "TIME: " + (order.getTimestamp().length() > 11 ? order.getTimestamp().substr(11) : ""));
        curY -= 12.0;

        drawText("F1", 7.5, 12, curY, "ORDER REF: " + order.getOrderId());
        const std::string paymentLabel = order.getPaymentMethod() == "M-Pesa" ? "M-PESA: " : "CASH REF: ";
        drawText("F2", 7.5, 115, curY, paymentLabel + order.getTransactionCode());
        curY -= 12.0;

        drawText("F1", 7.5, 12, curY, "STUDENT:   " + order.getCustomerName());
        curY -= 12.0;

        drawText("F1", 7.5, 12, curY, "PHONE:     " + order.getPhone());
        curY -= 12.0;

        std::string dispType = (order.getOrderType() == OrderType::WALKIN ? "WALK-IN (LIVE QUEUE)" : "PRE-ORDER (SCHEDULED)");
        drawText("F2", 7.5, 12, curY, "DISPATCH:  " + dispType);
        curY -= 14.0;

        drawDashedLine(curY + 6.0);

        // 4. Items Table Header
        drawText("F2", 7.5, 12, curY, "QTY ITEM");
        drawText("F2", 7.5, 160, curY, "PRICE (KES)");
        curY -= 12.0;
        drawDashedLine(curY + 6.0);

        // 5. Items Lines
        for (const auto& line : order.getItems()) {
            std::string n = line.item->getName();
            if (n.length() > 20) n = n.substr(0, 18) + "..";
            std::ostringstream ss;
            ss << line.quantity << "x " << n;
            drawText("F1", 7.5, 12, curY, ss.str());

            std::ostringstream pss;
            pss << std::fixed << std::setprecision(2) << line.getTotal();
            drawText("F1", 7.5, 170, curY, pss.str());
            curY -= 13.0;
        }

        drawDashedLine(curY + 6.0);

        // 6. Financial Summary
        std::ostringstream subSs;
        subSs << "KES " << std::fixed << std::setprecision(2) << order.getSubtotal();
        drawText("F1", 7.5, 12, curY, "SUBTOTAL:");
        drawText("F1", 7.5, 155, curY, subSs.str());
        curY -= 11.0;

        std::ostringstream vatSs;
        vatSs << "KES " << std::fixed << std::setprecision(2) << order.getTax();
        drawText("F1", 7.0, 12, curY, "VAT 16% (INCL):");
        drawText("F1", 7.0, 155, curY, vatSs.str());
        curY -= 13.0;

        std::ostringstream totSs;
        totSs << "KES " << std::fixed << std::setprecision(2) << order.getTotal();
        drawText("F2", 9.0, 12, curY, "TOTAL PAID:");
        drawText("F2", 9.0, 150, curY, totSs.str());
        curY -= 14.0;

        drawDashedLine(curY + 6.0);

        // 7. Simulated Barcode
        curY -= 6.0;
        drawCenteredText("F1", 6.5, curY, "*" + order.getTransactionCode() + "*");
        curY -= 7.0;

        // Draw vertical vector barcode lines
        stream << "q\n";
        double barcodeX = 28.0;
        const int numBars = 34;
        for (int i = 0; i < numBars; ++i) {
            double barWeight = (i % 3 == 0 || i % 7 == 0) ? 1.6 : 0.7;
            stream << barWeight << " w\n";
            stream << std::fixed << std::setprecision(2)
                   << (barcodeX + i * 4.8) << " " << (curY - 18.0) << " m "
                   << (barcodeX + i * 4.8) << " " << curY << " l S\n";
        }
        stream << "Q\n";
        curY -= 26.0;

        // 8. Footer notes
        std::ostringstream waitSs;
        waitSs << "~ EST. PREP TIME: " << order.getEstimatedWait() << " MINS ~";
        drawCenteredText("F1", 6.8, curY, waitSs.str());
        curY -= 9.0;
        drawCenteredText("F1", 6.8, curY, "PRESENT TICKET AT DISPATCH COUNTER");
        curY -= 8.5;
        drawCenteredText("F2", 7.0, curY, "THANK YOU FOR DINING WITH US!");

        std::string streamContent = stream.str();

        // Build valid PDF 1.4 Object Structure
        std::ostringstream pdf;
        pdf << "%PDF-1.4\n";

        std::vector<size_t> xrefOffsets;
        xrefOffsets.push_back(0); // Object 0 is dummy

        // Object 1: Catalog
        xrefOffsets.push_back(pdf.tellp());
        pdf << "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

        // Object 2: Pages
        xrefOffsets.push_back(pdf.tellp());
        pdf << "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";

        // Object 3: Page
        xrefOffsets.push_back(pdf.tellp());
        pdf << "3 0 obj\n"
            << "<< /Type /Page /Parent 2 0 R\n"
            << "   /MediaBox [0 0 " << std::fixed << std::setprecision(2) << pageWidth << " " << dynamicHeight << "]\n"
            << "   /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >>\n"
            << "   /Contents 6 0 R\n"
            << ">>\nendobj\n";

        // Object 4: Courier Normal
        xrefOffsets.push_back(pdf.tellp());
        pdf << "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n";

        // Object 5: Courier Bold
        xrefOffsets.push_back(pdf.tellp());
        pdf << "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>\nendobj\n";

        // Object 6: Stream Contents
        xrefOffsets.push_back(pdf.tellp());
        pdf << "6 0 obj\n<< /Length " << streamContent.length() << " >>\nstream\n"
            << streamContent
            << "\nendstream\nendobj\n";

        // Cross-reference table
        size_t startXref = pdf.tellp();
        pdf << "xref\n";
        pdf << "0 7\n";
        pdf << "0000000000 65535 f \n";
        for (size_t i = 1; i < xrefOffsets.size(); ++i) {
            pdf << std::setw(10) << std::setfill('0') << xrefOffsets[i] << " 00000 n \n";
        }

        // Trailer
        pdf << "trailer\n<< /Size 7 /Root 1 0 R >>\n";
        pdf << "startxref\n" << startXref << "\n%%EOF\n";

        std::ofstream outFile(outputPath, std::ios::binary);
        if (!outFile.is_open()) return false;
        std::string pdfStr = pdf.str();
        outFile.write(pdfStr.data(), pdfStr.size());
        outFile.close();
        return true;
    }
};

#endif // PDF_RECEIPT_GENERATOR_H
