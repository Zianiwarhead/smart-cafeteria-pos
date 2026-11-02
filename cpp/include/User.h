#ifndef USER_H
#define USER_H

#include <string>

enum class UserRole {
    CUSTOMER,
    ADMIN
};

// Base Class: Demonstrating Encapsulation & Abstraction
class User {
protected:
    std::string username;
    std::string passwordHash;
    UserRole role;
    std::string fullName;
    std::string phone;

public:
    User(const std::string& u, const std::string& p, UserRole r, const std::string& name, const std::string& ph)
        : username(u), passwordHash(p), role(r), fullName(name), phone(ph) {}

    virtual ~User() = default;

    // Encapsulated getters
    std::string getUsername() const { return username; }
    UserRole getRole() const { return role; }
    std::string getFullName() const { return fullName; }
    std::string getPhone() const { return phone; }

    bool authenticate(const std::string& inputPassword) const {
        return passwordHash == inputPassword;
    }

    // Pure virtual method for polymorphism / role-based behavior
    virtual bool canAccessAdminPanel() const = 0;
    virtual std::string getRoleTitle() const = 0;
};

// Derived Class 1: Customer (Inheritance)
class Customer : public User {
private:
    int loyaltyPoints;

public:
    Customer(const std::string& u, const std::string& p, const std::string& name, const std::string& ph, int points = 0)
        : User(u, p, UserRole::CUSTOMER, name, ph), loyaltyPoints(points) {}

    bool canAccessAdminPanel() const override {
        return false; // Enforced security: Customers cannot access inventory/analytics
    }

    std::string getRoleTitle() const override {
        return "Campus Student / Customer";
    }

    int getLoyaltyPoints() const { return loyaltyPoints; }
    void addLoyaltyPoints(int pts) { loyaltyPoints += pts; }
};

// Derived Class 2: Admin (Inheritance)
class Admin : public User {
private:
    std::string employeeId;

public:
    Admin(const std::string& u, const std::string& p, const std::string& name, const std::string& ph, const std::string& empId = "ADM-01")
        : User(u, p, UserRole::ADMIN, name, ph), employeeId(empId) {}

    bool canAccessAdminPanel() const override {
        return true;
    }

    std::string getRoleTitle() const override {
        return "Cafeteria Administrator";
    }

    std::string getEmployeeId() const { return employeeId; }
};

#endif // USER_H
