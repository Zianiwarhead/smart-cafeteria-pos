#ifndef QUEUE_MANAGER_H
#define QUEUE_MANAGER_H

#include <vector>
#include <memory>
#include <string>
#include <sstream>
#include "Order.h"

// Demonstrating Abstraction: Hides complex queue calculations behind a clean interface
class QueueManager {
private:
    int currentServingTicket;
    int activePhysicalQueueCount;
    double averagePrepTimePerCustomer; // In minutes

public:
    QueueManager(int startTicket = 38, int initialQueue = 7, double avgTime = 2.5)
        : currentServingTicket(startTicket), activePhysicalQueueCount(initialQueue),
          averagePrepTimePerCustomer(avgTime) {}

    int getNowServingTicket() const {
        return currentServingTicket;
    }

    int getPhysicalQueueLength() const {
        return activePhysicalQueueCount;
    }

    double calculateEstimatedWaitMinutes() const {
        return activePhysicalQueueCount * averagePrepTimePerCustomer;
    }

    bool isPeakHourTraffic() const {
        return activePhysicalQueueCount >= 6;
    }

    void advanceQueue() {
        currentServingTicket++;
        if (activePhysicalQueueCount > 1) {
            activePhysicalQueueCount--;
        }
    }

    void addCustomerToQueue() {
        activePhysicalQueueCount++;
    }

    // Visual queue progress bar for ANSI terminal
    std::string renderQueueProgressBar(int barWidth = 20) const {
        int filled = (activePhysicalQueueCount * barWidth) / 15;
        if (filled > barWidth) filled = barWidth;
        std::ostringstream ss;
        ss << "[";
        for (int i = 0; i < barWidth; ++i) {
            if (i < filled) ss << "=";
            else if (i == filled) ss << ">";
            else ss << " ";
        }
        ss << "] " << activePhysicalQueueCount << " queued";
        return ss.str();
    }
};

#endif // QUEUE_MANAGER_H
