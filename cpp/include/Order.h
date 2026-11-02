#ifndef ORDER_H
#define ORDER_H

#include <string>
#include <vector>
#include <memory>
#include <chrono>
#include <iomanip>
#include <sstream>
#include "MenuItem.h"
#include "PaymentMethod.h"

struct OrderLineItem {
    std::shared_ptr<MenuItem> item;
    int quantity;
    double unitPrice;

    double getTotal() const {
        return quantity * unitPrice;
    }
};

enum class OrderType {
    WALKIN,
    PREORDER
};

// Base Class: Order (Demonstrating Encapsulation & Polymorphism)
class Order {
protected:
    std::string orderId;
    std::string transactionCode;
    OrderType orderType;
    std::string customerName;
    std::string phone;
    std::vector<OrderLineItem> items;
    double subtotal;
    double tax;           // 16% Kenyan VAT
    double totalAmount;   // In KES
    bool isPaid;
    std::string paymentMethodName;
    std::string timestamp;
    int estimatedWaitMinutes;
    int queueTicketNumber;

public:
    Order(const std::string& id, OrderType type, const std::string& name, const std::string& ph, int ticket)
        : orderId(id), orderType(type), customerName(name), phone(ph),
          subtotal(0.0), tax(0.0), totalAmount(0.0), isPaid(false),
          estimatedWaitMinutes(5), queueTicketNumber(ticket) {
        
        // Capture system timestamp
        auto now = std::chrono::system_clock::now();
        std::time_t nowTime = std::chrono::system_clock::to_time_t(now);
        std::tm tmStruct;
#ifdef _WIN32
        localtime_s(&tmStruct, &nowTime);
#else
        localtime_r(&nowTime, &tmStruct);
#endif
        std::ostringstream ss;
        ss << std::put_time(&tmStruct, "%Y-%m-%d %H:%M:%S");
        timestamp = ss.str();
    }

    virtual ~Order() = default;

    // Encapsulation: Adding items calculates immutable financial state
    void addItem(std::shared_ptr<MenuItem> item, int quantity) {
        if (!item || quantity <= 0) return;
        OrderLineItem line{item, quantity, item->calculateFinalPrice()};
        items.push_back(line);
        recalculateTotals();
    }

    void recalculateTotals() {
        subtotal = 0.0;
        int prepAcc = 0;
        for (const auto& line : items) {
            subtotal += line.getTotal();
            prepAcc += line.item->getEffectivePrepTime() * line.quantity;
        }
        tax = subtotal * 0.16; // 16% VAT
        totalAmount = subtotal; // Cafeteria prices in Kenya are VAT-inclusive
        estimatedWaitMinutes = std::max(5, prepAcc);
    }

    // Encapsulated transaction validation
    bool finalizePayment(std::unique_ptr<PaymentMethod> method) {
        if (!method || isPaid || items.empty()) return false;
        PaymentResult res = method->process(totalAmount);
        if (res.success) {
            isPaid = true;
            transactionCode = res.transactionCode;
            paymentMethodName = method->getMethodName();
            
            // Decrement stock for ordered items
            for (auto& line : items) {
                line.item->decrementStock(line.quantity);
            }
            return true;
        }
        return false;
    }

    // Encapsulation: Read-only accessors
    std::string getOrderId() const { return orderId; }
    std::string getTransactionCode() const { return transactionCode; }
    OrderType getOrderType() const { return orderType; }
    std::string getCustomerName() const { return customerName; }
    std::string getPhone() const { return phone; }
    const std::vector<OrderLineItem>& getItems() const { return items; }
    double getSubtotal() const { return subtotal; }
    double getTax() const { return tax; }
    double getTotal() const { return totalAmount; }
    bool getIsPaid() const { return isPaid; }
    std::string getPaymentMethod() const { return paymentMethodName; }
    std::string getTimestamp() const { return timestamp; }
    int getEstimatedWait() const { return estimatedWaitMinutes; }
    int getQueueTicket() const { return queueTicketNumber; }

    // Pure virtual method: Order-specific queue slot validation (Polymorphism)
    virtual bool process() = 0;
    virtual std::string getDispatchSummary() const = 0;
};

// Derived Class 1: WalkInOrder (Live Queue)
class WalkInOrder : public Order {
private:
    int currentLiveQueueAhead;

public:
    WalkInOrder(const std::string& id, const std::string& name, const std::string& ph, int ticket, int queueAhead = 3)
        : Order(id, OrderType::WALKIN, name, ph, ticket), currentLiveQueueAhead(queueAhead) {}

    // Polymorphism: Calculates dynamic live wait-time based on queue length
    bool process() override {
        estimatedWaitMinutes = (currentLiveQueueAhead * 3) + estimatedWaitMinutes;
        return true;
    }

    std::string getDispatchSummary() const override {
        return "IMMEDIATE WALK-IN QUEUE (Serving in ~" + std::to_string(estimatedWaitMinutes) + " mins)";
    }
};

// Derived Class 2: PreOrder (Scheduled Queue slot validation)
class PreOrder : public Order {
private:
    std::string scheduledPickupSlot;
    bool isSlotValidated;

public:
    PreOrder(const std::string& id, const std::string& name, const std::string& ph, int ticket, const std::string& slot)
        : Order(id, OrderType::PREORDER, name, ph, ticket), scheduledPickupSlot(slot), isSlotValidated(false) {}

    // Polymorphism: Validates whether requested pre-order pickup window is available
    bool process() override {
        if (!scheduledPickupSlot.empty()) {
            isSlotValidated = true;
            // Pre-order guarantees rapid counter handoff: negligible wait time
            estimatedWaitMinutes = 2;
            return true;
        }
        return false;
    }

    std::string getDispatchSummary() const override {
        return "SCHEDULED PICKUP [" + scheduledPickupSlot + "] (Zero-Wait Shelf)";
    }

    std::string getPickupSlot() const { return scheduledPickupSlot; }
};

#endif // ORDER_H
