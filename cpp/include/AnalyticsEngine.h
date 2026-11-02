#ifndef ANALYTICS_ENGINE_H
#define ANALYTICS_ENGINE_H

#include <string>
#include <vector>
#include <map>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <iostream>

struct AnalyticsSummary {
    int totalTransactions;
    double totalRevenueKes;
    int preordersCount;
    int walkinCount;
    double averageBasketKes;
    std::string topItem;
    int topItemCount;
};

// Demonstrating Abstraction: Statistical log parsing hidden behind simple generateReport()
class AnalyticsEngine {
private:
    std::string ordersFilePath;

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
    AnalyticsEngine(const std::string& path = "data/orders.txt") : ordersFilePath(path) {}

    AnalyticsSummary generateReport() {
        AnalyticsSummary summary{0, 0.0, 0, 0, 0.0, "N/A", 0};
        std::ifstream file(ordersFilePath);
        if (!file.is_open()) {
            file.open("cpp/data/orders.txt");
        }
        if (!file.is_open()) return summary;

        std::map<std::string, int> itemFrequency;
        std::string line;
        while (std::getline(file, line)) {
            if (line.empty() || line[0] == '#') continue;
            auto parts = split(line, '|');
            if (parts.size() >= 12) {
                summary.totalTransactions++;
                std::string type = parts[3];
                std::string itemsStr = parts[7];
                double total = std::stod(parts[10]);

                summary.totalRevenueKes += total;
                if (type == "PREORDER") summary.preordersCount++;
                else summary.walkinCount++;

                // Parse item codes e.g. C01(1);D01(2)
                auto items = split(itemsStr, ';');
                for (const auto& it : items) {
                    size_t openP = it.find('(');
                    size_t closeP = it.find(')');
                    if (openP != std::string::npos && closeP != std::string::npos) {
                        std::string code = it.substr(0, openP);
                        int qty = std::stoi(it.substr(openP + 1, closeP - openP - 1));
                        itemFrequency[code] += qty;
                    }
                }
            }
        }
        file.close();

        if (summary.totalTransactions > 0) {
            summary.averageBasketKes = summary.totalRevenueKes / summary.totalTransactions;
        }

        // Determine top item
        for (const auto& pair : itemFrequency) {
            if (pair.second > summary.topItemCount) {
                summary.topItemCount = pair.second;
                summary.topItem = pair.first;
            }
        }

        return summary;
    }

    // Export daily_sales_report.csv
    bool exportDailySalesCsv(const std::string& exportPath = "daily_sales_report.csv") {
        std::ifstream in(ordersFilePath);
        if (!in.is_open()) {
            in.open("cpp/data/orders.txt");
        }
        if (!in.is_open()) return false;

        std::ofstream out(exportPath);
        if (!out.is_open()) {
            out.open("cpp/" + exportPath);
        }
        if (!out.is_open()) return false;

        out << "Order_ID,Transaction_Code,Timestamp,Order_Type,Pickup_Slot,Customer_Name,Phone,Items,Subtotal_KES,VAT_KES,Total_KES,Payment_Method\n";

        std::string line;
        while (std::getline(in, line)) {
            if (line.empty() || line[0] == '#') continue;
            auto parts = split(line, '|');
            if (parts.size() >= 12) {
                for (size_t i = 0; i < parts.size(); ++i) {
                    out << "\"" << parts[i] << "\"";
                    if (i + 1 < parts.size()) out << ",";
                }
                out << "\n";
            }
        }
        in.close();
        out.close();
        return true;
    }
};

#endif // ANALYTICS_ENGINE_H
