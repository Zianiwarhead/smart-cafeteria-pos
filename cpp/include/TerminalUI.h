#ifndef TERMINAL_UI_H
#define TERMINAL_UI_H

#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <thread>
#include <chrono>
#include <cstdlib>
#include <sstream>
#include "PhosphorTheme.h"
#include "MenuItem.h"
#include "Order.h"
#include "QueueManager.h"
#include "AnalyticsEngine.h"
#include "DataManager.h"

#ifdef _WIN32
#include <windows.h>
#include <conio.h>
#else
#include <termios.h>
#include <unistd.h>
#endif

class TerminalUI {
private:
    PhosphorTheme theme;
    DataManager dataManager;
    QueueManager queueManager;
    AnalyticsEngine analyticsEngine;
    std::vector<std::shared_ptr<MenuItem>> menu;
    std::shared_ptr<User> currentUser;

    void enableVirtualTerminal() {
#ifdef _WIN32
        HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
        if (hOut != INVALID_HANDLE_VALUE) {
            DWORD dwMode = 0;
            if (GetConsoleMode(hOut, &dwMode)) {
                dwMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;
                SetConsoleMode(hOut, dwMode);
            }
        }
#endif
    }

public:
    TerminalUI()
        : theme(PhosphorType::P1_GREEN),
          dataManager("cpp/data"),
          queueManager(38, 7, 2.5),
          analyticsEngine("cpp/data/orders.txt") {
        enableVirtualTerminal();
        menu = dataManager.loadMenu();
    }

    void cyclePhosphorTheme() {
        int next = (static_cast<int>(theme.getType()) + 1) % 6;
        theme.setTheme(static_cast<PhosphorType>(next));
    }

    void drawBoxHeader(const std::string& title, int width = 78) {
        std::cout << theme.dimCode() << "+";
        for (int i = 0; i < width - 2; ++i) std::cout << "-";
        std::cout << "+\n";

        std::cout << "| " << theme.highlightCode() << theme.bold() << title << theme.reset() << theme.dimCode();
        int pad = width - 4 - static_cast<int>(title.length());
        for (int i = 0; i < pad; ++i) std::cout << " ";
        std::cout << "|\n";

        std::cout << "+";
        for (int i = 0; i < width - 2; ++i) std::cout << "-";
        std::cout << "+\n" << theme.reset();
    }

    void renderMainMenuScreen() {
        std::cout << PhosphorTheme::clearScreen();
        std::cout << theme.bgCode() << theme.fgCode();

        // 1980s IBM 3270 CRT Header
        std::cout << "==============================================================================\n";
        std::cout << " IBM 3278-MOD2 // SMART CAFETERIA PRE-ORDER SYSTEM // CRT TERMINAL\n";
        std::cout << " THEME: " << theme.highlightCode() << theme.getName() << theme.fgCode()
                  << "  [P] CYCLE PHOSPHOR COLOR\n";
        std::cout << "==============================================================================\n";

        // Live Queue Simulation Bar
        std::cout << theme.dimCode() << " QUEUE: " << theme.fgCode()
                  << "NOW SERVING: #" << queueManager.getNowServingTicket()
                  << " | WAITING: " << queueManager.getPhysicalQueueLength() << " STUDENTS"
                  << " | EST WAIT: ~" << static_cast<int>(queueManager.calculateEstimatedWaitMinutes()) << " MINS\n";
        std::cout << " STATUS: " << queueManager.renderQueueProgressBar(25);
        if (queueManager.isPeakHourTraffic()) {
            std::cout << theme.highlightCode() << " [! PEAK LUNCH HOUR: 11:30 AM - 2:00 PM !]" << theme.fgCode();
        }
        std::cout << "\n------------------------------------------------------------------------------\n";

        // Menu Listing
        std::cout << theme.bold() << " CODE  ITEM DESCRIPTION                       PREP   STOCK  PRICE (KES)\n" << theme.reset() << theme.fgCode();
        std::cout << "------------------------------------------------------------------------------\n";

        for (size_t i = 0; i < menu.size(); ++i) {
            const auto& item = menu[i];
            std::string name = item->getName();
            if (name.length() > 34) name = name.substr(0, 32) + "..";

            std::cout << " [" << theme.highlightCode() << item->getCode() << theme.fgCode() << "] "
                      << theme.bold() << std::left << std::setw(34) << name << theme.reset() << theme.fgCode() << " "
                      << "~" << item->getEffectivePrepTime() << "m   "
                      << std::right << std::setw(4) << item->getStock() << "   "
                      << "KES " << std::right << std::setw(6) << std::fixed << std::setprecision(2) << item->calculateFinalPrice()
                      << "\n";

            if (!item->getDescription().empty()) {
                const std::string label = item->getCategory() == ItemCategory::DRINK ? "Ingredients: " : "Details: ";
                const std::string continuationIndent = "          ";
                std::istringstream words(item->getDescription());
                std::string word;
                std::string line = label;
                bool firstLine = true;
                while (words >> word) {
                    const size_t maxLineLength = firstLine ? 70 : 68;
                    if (!line.empty() && line.size() + 1 + word.size() > maxLineLength) {
                        std::cout << theme.dimCode() << (firstLine ? "       └─ " : continuationIndent)
                                  << line << theme.reset() << theme.fgCode() << "\n";
                        line.clear();
                        firstLine = false;
                    }
                    if (!line.empty()) line += " ";
                    line += word;
                }
                if (!line.empty()) {
                    std::cout << theme.dimCode() << (firstLine ? "       └─ " : continuationIndent)
                              << line << theme.reset() << theme.fgCode() << "\n";
                }
            }
        }

        std::cout << "------------------------------------------------------------------------------\n";
        std::cout << " [1] WALK-IN ORDER   [2] SCHEDULED PRE-ORDER   [A] ADMIN ANALYTICS   [Q] QUIT\n";
        std::cout << "==============================================================================\n";
        std::cout << theme.highlightCode() << "ENTER COMMAND > " << theme.reset();
    }

    void simulateSteppedPrinterFeed(const Order& order) {
        std::cout << PhosphorTheme::clearScreen();
        std::cout << theme.fgCode() << theme.bold();
        std::cout << "==============================================================================\n";
        std::cout << " IBM 4610 THERMAL RECEIPT DISPENSER // STEPPED PAPER FEED SIMULATION\n";
        std::cout << "==============================================================================\n\n";

        std::string dispatchStr = (order.getOrderType() == OrderType::WALKIN ? "WALK-IN (LIVE QUEUE)          " : "PRE-ORDER (SCHEDULED PICKUP)   ");
        std::vector<std::string> lines = {
            "      /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\",
            "      |        SMART CAFETERIA PRE-ORDER SYSTEM        |",
            "      |           CAMPUS DINING DISPENSER 04           |",
            "      +------------------------------------------------+",
            std::string("      | DATE: ") + order.getTimestamp() + "              |",
            std::string("      | ORDER REF: ") + order.getOrderId() + "                         |",
            std::string("      | PAYMENT REF: ") + order.getTransactionCode() + "                      |",
            std::string("      | CUSTOMER: ") + order.getCustomerName() + "                    |",
            std::string("      | DISPATCH: ") + dispatchStr + " |",
            std::string("      | TICKET NUMBER: #") + std::to_string(order.getQueueTicket()) + "                             |",
            "      +------------------------------------------------+",
            "      | QTY  ITEM                      PRICE (KES)     |",
            "      +------------------------------------------------+"
        };

        for (const auto& line : order.getItems()) {
            std::string n = line.item->getName();
            if (n.length() > 20) n = n.substr(0, 18) + "..";
            std::ostringstream ss;
            ss << "      | " << line.quantity << "x   " << std::left << std::setw(23) << n
               << " KES " << std::right << std::setw(6) << std::fixed << std::setprecision(2) << line.getTotal() << " |";
            lines.push_back(ss.str());
        }

        std::ostringstream tot;
        tot << "      | TOTAL PAID VIA " << order.getPaymentMethod() << ":        KES "
            << std::right << std::setw(6) << std::fixed << std::setprecision(2) << order.getTotal() << " |";
        lines.push_back("      +------------------------------------------------+");
        lines.push_back(tot.str());
        lines.push_back("      | * BARCODE: |||| | ||||| || |||| ||||| *        |");
        lines.push_back("      | PLEASE PRESENT PAPER AT THE DISPATCH COUNTER   |");
        lines.push_back("      \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/");

        // Stepped line feed mechanical animation
        for (size_t i = 0; i < lines.size(); ++i) {
            std::cout << theme.highlightCode() << lines[i] << "\n" << theme.reset();
            std::this_thread::sleep_for(std::chrono::milliseconds(120)); // Stepped paper feed delay
        }

        std::cout << "\n" << theme.highlightCode() << ">> CUTTER BLADE ENGAGED: THERMAL RECEIPT DETACHED!\n" << theme.fgCode();
        std::cout << ">> PDF Receipt generated: " << theme.highlightCode() << "cpp/data/receipts/receipt_" << order.getTransactionCode() << ".pdf\n" << theme.fgCode();
        std::cout << ">> Text voucher saved:    cpp/data/receipts/receipt_" << order.getTransactionCode() << ".txt\n";
        std::cout << ">> Immutable log appended: cpp/data/orders.txt\n\n";
        std::cout << "Press ENTER to return to menu...";
        std::cin.ignore();
        std::cin.get();
    }

    void handleOrderFlow(OrderType type) {
        std::string name, phone, slot = "12:30 PM (SLOT A)";
        std::cout << "\n" << theme.highlightCode() << "--- INITIATING " 
                  << (type == OrderType::WALKIN ? "WALK-IN" : "PRE-ORDER") << " ORDER ---\n" << theme.fgCode();

        std::cout << "Enter Customer / Student Name: ";
        std::cin.ignore();
        std::getline(std::cin, name);
        if (name.empty()) {
            std::cout << "Name is required. Order cancelled.\n";
            return;
        }

        std::cout << "Enter contact phone number (10-13 digits): ";
        std::getline(std::cin, phone);
        if (phone.empty()) {
            std::cout << "Phone number is required. Order cancelled.\n";
            return;
        }

        if (type == OrderType::PREORDER) {
            std::cout << "Select Scheduled Pickup Slot:\n";
            std::cout << " 1. 12:15 PM (Lunch Rush A)\n";
            std::cout << " 2. 12:30 PM (Slot B)\n";
            std::cout << " 3. 12:45 PM (Slot C)\n";
            std::cout << " 4. 01:00 PM (Slot D)\n";
            std::cout << "Choice [2]: ";
            std::string slotChoice;
            std::getline(std::cin, slotChoice);
            if (slotChoice == "1") slot = "12:15 PM (Rush A)";
            else if (slotChoice == "3") slot = "12:45 PM (Slot C)";
            else if (slotChoice == "4") slot = "01:00 PM (Slot D)";
            else slot = "12:30 PM (Slot B)";
        }

        // Create polymorphic Order object
        static int ticketCounter = 41;
        std::shared_ptr<Order> newOrder;
        std::string orderId = "ORD-0" + std::to_string(ticketCounter);

        if (type == OrderType::WALKIN) {
            newOrder = std::make_shared<WalkInOrder>(orderId, name, phone, ticketCounter, queueManager.getPhysicalQueueLength());
        } else {
            newOrder = std::make_shared<PreOrder>(orderId, name, phone, ticketCounter, slot);
        }
        ticketCounter++;

        // Add items to order
        bool adding = true;
        while (adding) {
            std::cout << "\nEnter Item Code to Add (e.g. C01, F01, D01) or [DONE]: ";
            std::string code;
            std::cin >> code;
            if (code == "DONE" || code == "done") break;

            std::shared_ptr<MenuItem> found = nullptr;
            for (auto& it : menu) {
                if (it->getCode() == code) {
                    found = it;
                    break;
                }
            }

            if (found) {
                std::cout << theme.dimCode() << "   └─ Includes: " << found->getDescription() << theme.reset() << theme.fgCode() << "\n";
                std::cout << "Enter Quantity for " << found->getName() << ": ";
                int qty;
                std::cin >> qty;
                if (qty > 0 && qty <= found->getStock()) {
                    newOrder->addItem(found, qty);
                    std::cout << theme.highlightCode() << ">> Added " << qty << "x " << found->getName() 
                              << " | Subtotal: KES " << newOrder->getTotal() << theme.fgCode() << "\n";
                } else {
                    std::cout << "Invalid quantity or insufficient stock!\n";
                }
            } else {
                std::cout << "Item code not found!\n";
            }
        }

        if (newOrder->getItems().empty()) {
            std::cout << "Order tray empty. Aborted.\n";
            std::this_thread::sleep_for(std::chrono::milliseconds(1000));
            return;
        }

        // Polymorphic order validation
        newOrder->process();

        // Payment Simulation
        std::cout << "\n" << theme.highlightCode() << "TOTAL AMOUNT DUE: KES " << newOrder->getTotal() << theme.fgCode() << "\n";
        std::cout << "Payment Methods:\n";
        std::cout << " 1. M-Pesa STK Push (Mobile Money)\n";
        std::cout << " 2. Cash at Register\n";
        std::cout << "Select Payment Method [1]: ";
        int payChoice;
        std::cin >> payChoice;

        std::unique_ptr<PaymentMethod> paymentMethod;
        if (payChoice == 2) {
            std::cout << "Enter Cash Tendered in KES: ";
            double tendered;
            std::cin >> tendered;
            paymentMethod = std::make_unique<CashPayment>(tendered);
        } else {
            std::cout << "\n>> Initiating Safaricom STK Push to " << phone << "...\n";
            std::this_thread::sleep_for(std::chrono::milliseconds(800));
            std::cout << ">> STK PROMPT RECEIVED ON MOBILE PHONE:\n";
            std::cout << "   'Do you want to pay KES " << newOrder->getTotal() << " to SMART CAFETERIA?'\n";
            std::cout << "Enter the 4-digit demo PIN (simulated payment only): ";
            std::string pin;
            std::cin >> pin;
            paymentMethod = std::make_unique<MobileMoneyPayment>(phone, pin);
        }

        // Finalize transaction
        bool success = newOrder->finalizePayment(std::move(paymentMethod));
        if (success) {
            std::cout << theme.highlightCode() << "\n[!] PAYMENT CONFIRMED! Transaction: " << newOrder->getTransactionCode() << theme.fgCode() << "\n";
            
            // Persist the order, receipt, and reduced inventory to local files.
            if (!dataManager.appendOrderLog(*newOrder)) {
                std::cout << "[!] Could not write the order log. Check cpp/data permissions.\n";
            }
            if (!dataManager.saveReceiptFile(*newOrder)) {
                std::cout << "[!] Could not write the receipt files. Check cpp/data/receipts permissions.\n";
            }
            if (!dataManager.saveMenuStock(menu)) {
                std::cout << "[!] Could not save inventory. Stock will reset on restart.\n";
            }
            queueManager.advanceQueue();

            std::this_thread::sleep_for(std::chrono::milliseconds(800));
            simulateSteppedPrinterFeed(*newOrder);
        } else {
            std::cout << "\n[X] PAYMENT FAILED! Order cancelled.\n";
            std::this_thread::sleep_for(std::chrono::milliseconds(2000));
        }
    }

    bool authenticateAdmin() {
        const char* configuredPin = std::getenv("CAFETERIA_ADMIN_PIN");
        if (!configuredPin || configuredPin[0] == 0) {
            std::cout << "\nAdmin analytics are locked. Set CAFETERIA_ADMIN_PIN in your terminal before launching.\n";
            std::this_thread::sleep_for(std::chrono::milliseconds(1800));
            return false;
        }
        std::string enteredPin;
        std::cout << "Admin PIN: ";
        std::cin >> enteredPin;
        if (enteredPin != configuredPin) {
            std::cout << "Incorrect admin PIN.\n";
            std::this_thread::sleep_for(std::chrono::milliseconds(1200));
            return false;
        }
        currentUser = std::make_shared<Admin>("admin", "", "Cafeteria Administrator", "");
        return true;
    }

    void handleAdminPanel() {
        // Encapsulation check: Role-based permissions
        if (!currentUser || !currentUser->canAccessAdminPanel()) {
            std::cout << "\nACCESS DENIED: Role-based permissions restriction.\n";
            std::this_thread::sleep_for(std::chrono::milliseconds(1500));
            return;
        }

        std::cout << PhosphorTheme::clearScreen();
        std::cout << theme.fgCode();
        drawBoxHeader("ADMINISTRATOR ANALYTICS & REVENUE ENGINE (OOP C++)", 78);

        AnalyticsSummary report = analyticsEngine.generateReport();
        std::cout << " LOGGED TRANSACTIONS: " << report.totalTransactions << "\n";
        std::cout << " TOTAL REVENUE:       KES " << std::fixed << std::setprecision(2) << report.totalRevenueKes << "\n";
        std::cout << " PRE-ORDER VOLUME:    " << report.preordersCount << " orders\n";
        std::cout << " WALK-IN VOLUME:      " << report.walkinCount << " orders\n";
        std::cout << " AVERAGE BASKET:      KES " << report.averageBasketKes << "\n";
        std::cout << " TOP RANKED ITEM:     [" << report.topItem << "] (" << report.topItemCount << " ordered)\n";
        std::cout << "------------------------------------------------------------------------------\n";

        std::cout << " [1] Export daily_sales_report.csv\n";
        std::cout << " [2] Restock Item Inventory\n";
        std::cout << " [B] Back to POS Terminal\n";
        std::cout << "Choice: ";
        char c;
        std::cin >> c;
        if (c == '1') {
            bool ok = analyticsEngine.exportDailySalesCsv("cpp/data/daily_sales_report.csv");
            if (ok) {
                std::cout << theme.highlightCode() << "\n>> Successfully exported cpp/data/daily_sales_report.csv!\n" << theme.fgCode();
            } else {
                std::cout << "\n>> Export error.\n";
            }
            std::cout << "Press ENTER to continue...";
            std::cin.ignore();
            std::cin.get();
        } else if (c == '2') {
            std::cout << "\nCurrent inventory:\n";
            for (const auto& item : menu) {
                std::cout << " " << item->getCode() << "  " << item->getName()
                          << " (" << item->getStock() << " in stock)\n";
            }
            std::string code;
            int quantity = 0;
            std::cout << "Item code to restock (or B to cancel): ";
            std::cin >> code;
            if (code == "B" || code == "b") return;
            std::cout << "Quantity to add: ";
            if (!(std::cin >> quantity) || quantity <= 0) {
                std::cin.clear();
                std::cin.ignore(10000, '\n');
                std::cout << "Enter a positive whole number.\n";
                return;
            }
            bool found = false;
            for (const auto& item : menu) {
                if (item->getCode() == code) {
                    item->restock(quantity);
                    found = true;
                    break;
                }
            }
            if (!found) {
                std::cout << "Item code not found.\n";
            } else if (!dataManager.saveMenuStock(menu)) {
                std::cout << "Could not save inventory to cpp/data/menu.txt.\n";
            } else {
                std::cout << "Inventory saved.\n";
            }
            std::cout << "Press ENTER to continue...";
            std::cin.ignore();
            std::cin.get();
        }
    }

    void run() {
        bool running = true;
        while (running) {
            renderMainMenuScreen();
            char choice;
            std::cin >> choice;

            if (choice == 'p' || choice == 'P') {
                cyclePhosphorTheme();
            } else if (choice == '1') {
                handleOrderFlow(OrderType::WALKIN);
            } else if (choice == '2') {
                handleOrderFlow(OrderType::PREORDER);
            } else if (choice == 'a' || choice == 'A') {
                if (authenticateAdmin()) {
                    handleAdminPanel();
                    currentUser.reset();
                }
            } else if (choice == 'q' || choice == 'Q') {
                running = false;
            }
        }
    }
};

#endif // TERMINAL_UI_H
