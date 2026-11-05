#ifndef DATA_MANAGER_H
#define DATA_MANAGER_H

#include <string>
#include <vector>
#include <memory>
#include <fstream>
#include <sstream>
#include <iostream>
#include "User.h"
#include "MenuItem.h"
#include "Order.h"
#include "PdfReceiptGenerator.h"

class DataManager {
private:
    std::string dataDir;

    std::vector<std::string> split(const std::string& s, char delimiter) {
        std::vector<std::string> tokens;
        std::string token;
        std::istringstream tokenStream(s);
        while (std::getline(tokenStream, token, delimiter)) {
            tokens.push_back(token);
        }
        return tokens;
    }

public:
    DataManager(const std::string& dir = "data") : dataDir(dir) {}

    // 1. Load users from users.txt
    std::vector<std::shared_ptr<User>> loadUsers() {
        std::vector<std::shared_ptr<User>> users;
        std::ifstream file(dataDir + "/users.txt");
        if (!file.is_open()) {
            file.open("cpp/data/users.txt");
        }
        if (!file.is_open()) return users;

        std::string line;
        while (std::getline(file, line)) {
            if (line.empty() || line[0] == '#') continue;
            auto parts = split(line, '|');
            if (parts.size() >= 5) {
                std::string u = parts[0];
                std::string p = parts[1];
                std::string role = parts[2];
                std::string name = parts[3];
                std::string phone = parts[4];

                if (role == "admin") {
                    users.push_back(std::make_shared<Admin>(u, p, name, phone));
                } else {
                    users.push_back(std::make_shared<Customer>(u, p, name, phone));
                }
            }
        }
        file.close();
        return users;
    }

    // 2. Load menu items from menu.txt
    std::vector<std::shared_ptr<MenuItem>> loadMenu() {
        std::vector<std::shared_ptr<MenuItem>> menu;
        std::ifstream file(dataDir + "/menu.txt");
        if (!file.is_open()) {
            file.open("cpp/data/menu.txt");
        }
        if (!file.is_open()) return menu;

        std::string line;
        while (std::getline(file, line)) {
            if (line.empty() || line[0] == '#') continue;
            auto parts = split(line, '|');
            if (parts.size() >= 8) {
                std::string id = parts[0];
                std::string code = parts[1];
                std::string cat = parts[2];
                std::string name = parts[3];
                double price = std::stod(parts[4]);
                int prep = std::stoi(parts[5]);
                int stock = std::stoi(parts[6]);
                std::string desc = parts[7];

                if (cat == "combo") {
                    menu.push_back(std::make_shared<ComboDeal>(id, code, name, desc, price, prep, stock));
                } else if (cat == "drink") {
                    menu.push_back(std::make_shared<DrinkItem>(id, code, name, desc, price, prep, stock));
                } else {
                    menu.push_back(std::make_shared<FoodItem>(id, code, name, desc, price, prep, stock));
                }
            }
        }
        file.close();
        return menu;
    }

    // Persist current stock levels while keeping the menu's other fields intact.
    bool saveMenuStock(const std::vector<std::shared_ptr<MenuItem>>& menu) {
        std::string path = dataDir + "/menu.txt";
        std::ifstream input(path);
        if (!input.is_open()) {
            path = "cpp/data/menu.txt";
            input.open(path);
        }
        if (!input.is_open()) return false;

        std::vector<std::string> lines;
        std::string line;
        while (std::getline(input, line)) {
            if (!line.empty() && line[0] != '#') {
                auto parts = split(line, '|');
                if (parts.size() >= 8) {
                    for (const auto& item : menu) {
                        if (item && parts[1] == item->getCode()) {
                            parts[6] = std::to_string(item->getStock());
                            line.clear();
                            for (size_t i = 0; i < parts.size(); ++i) {
                                if (i) line += '|';
                                line += parts[i];
                            }
                            break;
                        }
                    }
                }
            }
            lines.push_back(line);
        }
        input.close();

        std::ofstream output(path, std::ios::trunc);
        if (!output.is_open()) return false;
        for (const auto& savedLine : lines) output << savedLine << "\\n";
        return output.good();
    }

    // 3. Append to immutable transaction log orders.txt
    bool appendOrderLog(const Order& order) {
        std::string path = dataDir + "/orders.txt";
        std::ofstream file(path, std::ios::app);
        if (!file.is_open()) {
            path = "cpp/data/orders.txt";
            file.open(path, std::ios::app);
        }
        if (!file.is_open()) return false;

        std::ostringstream itemsSummary;
        for (size_t i = 0; i < order.getItems().size(); ++i) {
            const auto& line = order.getItems()[i];
            itemsSummary << line.item->getCode() << "(" << line.quantity << ")";
            if (i + 1 < order.getItems().size()) itemsSummary << ";";
        }

        std::string slot = "IMMEDIATE";
        if (order.getOrderType() == OrderType::PREORDER) {
            const PreOrder* po = dynamic_cast<const PreOrder*>(&order);
            if (po) slot = po->getPickupSlot();
        }

        file << order.getOrderId() << "|"
             << order.getTransactionCode() << "|"
             << order.getTimestamp() << "|"
             << (order.getOrderType() == OrderType::WALKIN ? "WALKIN" : "PREORDER") << "|"
             << slot << "|"
             << order.getCustomerName() << "|"
             << order.getPhone() << "|"
             << itemsSummary.str() << "|"
             << std::fixed << std::setprecision(2) << order.getSubtotal() << "|"
             << order.getTax() << "|"
             << order.getTotal() << "|"
             << order.getPaymentMethod() << "\n";

        file.close();
        return true;
    }

    // 4. Save downloadable individual receipt file in receipts/ (PDF & TXT)
    bool saveReceiptFile(const Order& order) {
        std::string dir = dataDir + "/receipts";
        std::string pdfPath = dir + "/receipt_" + order.getTransactionCode() + ".pdf";
        std::string txtPath = dir + "/receipt_" + order.getTransactionCode() + ".txt";

        // Generate authentic 80mm PDF receipt
        bool pdfOk = PdfReceiptGenerator::generatePdf(order, pdfPath);
        if (!pdfOk) {
            dir = "cpp/data/receipts";
            pdfPath = dir + "/receipt_" + order.getTransactionCode() + ".pdf";
            txtPath = dir + "/receipt_" + order.getTransactionCode() + ".txt";
            PdfReceiptGenerator::generatePdf(order, pdfPath);
        }

        // Also generate text receipt for legacy terminal viewer
        std::ofstream file(txtPath);
        if (!file.is_open()) return false;

        const std::string sep = "------------------------------------------\n";
        file << "==========================================\n";
        file << "     SMART CAFETERIA PRE-ORDER SYSTEM     \n";
        file << "        UNIVERSITY DINING HALL 01        \n";
        file << "==========================================\n";
        file << "DATE: " << order.getTimestamp() << "\n";
        file << "ORDER REF: " << order.getOrderId() << "\n";
        file << "M-PESA REF: " << order.getTransactionCode() << "\n";
        file << "CUSTOMER: " << order.getCustomerName() << " (" << order.getPhone() << ")\n";
        file << "DISPATCH: " << (order.getOrderType() == OrderType::WALKIN ? "WALKIN" : "PREORDER") << "\n";
        file << "QUEUE CALL: TICKET #" << std::setw(3) << std::setfill('0') << order.getQueueTicket() << "\n";
        file << sep;
        file << "QTY  ITEM DESCRIPTION             PRICE (KES)\n";
        file << sep;
        for (const auto& line : order.getItems()) {
            std::string name = line.item->getName();
            if (name.length() > 24) name = name.substr(0, 22) + "..";
            file << std::left << std::setw(4) << line.quantity << " "
                 << std::left << std::setw(25) << name << " "
                 << "KES " << std::right << std::setw(6) << std::fixed << std::setprecision(2) << line.getTotal() << "\n";
        }
        file << sep;
        file << "SUBTOTAL:                          KES " << std::right << std::setw(6) << order.getSubtotal() << "\n";
        file << "VAT 16% (INCL):                    KES " << std::right << std::setw(6) << order.getTax() << "\n";
        file << "TOTAL PAID VIA " << order.getPaymentMethod() << ":             KES " << std::right << std::setw(6) << order.getTotal() << "\n";
        file << sep;
        file << "EST. WAIT TIME: " << order.getEstimatedWait() << " MINUTES\n";
        file << "==========================================\n";
        file << "     THANK YOU FOR DINING WITH US!       \n";
        file << "    PLEASE PRESENT AT DISPATCH COUNTER   \n";
        file << "==========================================\n";

        file.close();
        return true;
    }
};

#endif // DATA_MANAGER_H
