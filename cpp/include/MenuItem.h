#ifndef MENU_ITEM_H
#define MENU_ITEM_H

#include <string>
#include <vector>
#include <memory>

enum class ItemCategory {
    FOOD,
    DRINK,
    COMBO
};

// Base class: MenuItem (Demonstrating Encapsulation & Polymorphism)
class MenuItem {
protected:
    std::string id;
    std::string code;
    std::string name;
    std::string description;
    double basePrice;      // In KES (Kenyan Shillings)
    int prepTimeMinutes;
    int stockLevel;
    ItemCategory category;

public:
    MenuItem(const std::string& id, const std::string& code, const std::string& name,
             const std::string& desc, double price, int prepTime, int stock, ItemCategory cat)
        : id(id), code(code), name(name), description(desc), basePrice(price),
          prepTimeMinutes(prepTime), stockLevel(stock), category(cat) {}

    virtual ~MenuItem() = default;

    // Encapsulation: Read-only access to critical financial and identifier state
    std::string getId() const { return id; }
    std::string getCode() const { return code; }
    std::string getName() const { return name; }
    std::string getDescription() const { return description; }
    int getStock() const { return stockLevel; }
    ItemCategory getCategory() const { return category; }

    // Controlled stock mutation with validation
    bool decrementStock(int quantity) {
        if (quantity <= 0 || stockLevel < quantity) return false;
        stockLevel -= quantity;
        return true;
    }

    void restock(int quantity) {
        if (quantity > 0) stockLevel += quantity;
    }

    // Virtual pricing method overridden by derived classes (Polymorphism)
    virtual double calculateFinalPrice() const {
        return basePrice;
    }

    virtual int getEffectivePrepTime() const {
        return prepTimeMinutes;
    }

    virtual std::string getCategoryLabel() const = 0;
};

// Derived Class 1: FoodItem
class FoodItem : public MenuItem {
private:
    bool isVegetarian;

public:
    FoodItem(const std::string& id, const std::string& code, const std::string& name,
             const std::string& desc, double price, int prepTime, int stock, bool veg = false)
        : MenuItem(id, code, name, desc, price, prepTime, stock, ItemCategory::FOOD),
          isVegetarian(veg) {}

    std::string getCategoryLabel() const override {
        return isVegetarian ? "Vegetarian Food" : "Hot Food";
    }
};

// Derived Class 2: DrinkItem
class DrinkItem : public MenuItem {
private:
    bool isChilled;
    int volumeMl;

public:
    DrinkItem(const std::string& id, const std::string& code, const std::string& name,
              const std::string& desc, double price, int prepTime, int stock, bool chilled = true, int ml = 500)
        : MenuItem(id, code, name, desc, price, prepTime, stock, ItemCategory::DRINK),
          isChilled(chilled), volumeMl(ml) {}

    std::string getCategoryLabel() const override {
        return isChilled ? "Chilled Beverage" : "Hot Beverage";
    }

    int getVolume() const { return volumeMl; }
};

// Derived Class 3: ComboDeal (Specialized bundle pricing logic)
class ComboDeal : public MenuItem {
private:
    double bundleDiscountPercentage;

public:
    ComboDeal(const std::string& id, const std::string& code, const std::string& name,
              const std::string& desc, double price, int prepTime, int stock, double discountPct = 15.0)
        : MenuItem(id, code, name, desc, price, prepTime, stock, ItemCategory::COMBO),
          bundleDiscountPercentage(discountPct) {}

    // Polymorphism: Calculates bundled discount pricing
    double calculateFinalPrice() const override {
        // Base price already incorporates bundle discount in KES
        return basePrice;
    }

    std::string getCategoryLabel() const override {
        return "Value Combo Meal";
    }

    double getDiscountPercentage() const { return bundleDiscountPercentage; }
};

#endif // MENU_ITEM_H
