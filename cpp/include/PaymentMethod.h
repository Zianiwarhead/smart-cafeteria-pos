#ifndef PAYMENT_METHOD_H
#define PAYMENT_METHOD_H

#include <string>
#include <random>
#include <sstream>
#include <iomanip>

struct PaymentResult {
    bool success;
    std::string transactionCode;
    std::string message;
    double changeGiven;
};

// Base Class: PaymentMethod (Demonstrating Polymorphism & Abstraction)
class PaymentMethod {
protected:
    std::string methodName;

public:
    PaymentMethod(const std::string& name) : methodName(name) {}
    virtual ~PaymentMethod() = default;

    std::string getMethodName() const { return methodName; }

    // Pure virtual method: All subclasses implement their distinct processing logic
    virtual PaymentResult process(double amountDue) = 0;
};

// Derived Class 1: CashPayment (Handles cash change calculation)
class CashPayment : public PaymentMethod {
private:
    double cashTendered;

public:
    CashPayment(double tendered)
        : PaymentMethod("Cash"), cashTendered(tendered) {}

    PaymentResult process(double amountDue) override {
        PaymentResult res;
        if (cashTendered < amountDue) {
            res.success = false;
            res.changeGiven = 0.0;
            res.message = "Insufficient cash tendered! Shortage: KES " + std::to_string(amountDue - cashTendered);
            res.transactionCode = "FAILED-CASH";
            return res;
        }

        res.success = true;
        res.changeGiven = cashTendered - amountDue;
        
        // Generate pseudo cash register receipt reference
        static int cashReceiptId = 100;
        res.transactionCode = "CSH-" + std::to_string(++cashReceiptId);
        res.message = "Cash payment accepted. Change returned: KES " + std::to_string(res.changeGiven);
        return res;
    }
};

// Derived Class 2: MobileMoneyPayment (STK Push simulation & 10-char M-Pesa code)
class MobileMoneyPayment : public PaymentMethod {
private:
    std::string phoneNumber;
    std::string enteredPin;

public:
    MobileMoneyPayment(const std::string& phone, const std::string& pin)
        : PaymentMethod("M-Pesa"), phoneNumber(phone), enteredPin(pin) {}

    // Generates authentic Safaricom 10-character alphanumeric transaction code (e.g. QFH38X92L)
    static std::string generateMpesaCode() {
        const char letters[] = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const char digits[] = "23456789";
        std::string code = "";
        
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> lDist(0, sizeof(letters) - 2);
        std::uniform_int_distribution<> dDist(0, sizeof(digits) - 2);

        for (int i = 0; i < 3; i++) code += letters[lDist(gen)];
        for (int i = 0; i < 2; i++) code += digits[dDist(gen)];
        for (int i = 0; i < 3; i++) code += letters[lDist(gen)];
        for (int i = 0; i < 2; i++) code += digits[dDist(gen)];

        return code;
    }

    PaymentResult process(double amountDue) override {
        PaymentResult res;
        res.changeGiven = 0.0;

        // Validation check for Safaricom Kenyan mobile format (07... or 01...)
        if (phoneNumber.length() < 10) {
            res.success = false;
            res.message = "Invalid phone number format! Requires Safaricom 10-digit number.";
            res.transactionCode = "ERR-PHONE";
            return res;
        }

        // STK Push PIN validation simulation
        if (enteredPin.length() != 4) {
            res.success = false;
            res.message = "M-Pesa STK push rejected: PIN must be 4 digits.";
            res.transactionCode = "ERR-PIN";
            return res;
        }

        // Payment authorized
        res.success = true;
        res.transactionCode = generateMpesaCode();
        res.message = "M-Pesa STK Push confirmed by " + phoneNumber + " for KES " + std::to_string(amountDue);
        return res;
    }
};

#endif // PAYMENT_METHOD_H
