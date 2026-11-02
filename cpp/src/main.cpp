#include <iostream>
#include "TerminalUI.h"

int main() {
    try {
        TerminalUI app;
        app.run();
    } catch (const std::exception& ex) {
        std::cerr << "Fatal Error in Cafeteria Core: " << ex.what() << std::endl;
        return 1;
    }
    return 0;
}
