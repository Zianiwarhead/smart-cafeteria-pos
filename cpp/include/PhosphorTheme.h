#ifndef PHOSPHOR_THEME_H
#define PHOSPHOR_THEME_H

#include <string>
#include <sstream>

struct ColorRGB {
    int r, g, b;
};

enum class PhosphorType {
    P1_GREEN,       // Classic IBM PC / Apple II (#33FF33)
    P31_RADAR,      // Vibrant Radar / Scope (#7FFF00)
    P39_FOREST,     // Deep Persistence Forest (#4ADE80 / #006400)
    P3_AMBER,       // DEC VT220 / Wyse Amber (#FFB700)
    P12_ORANGE,     // Safety Tactical Orange (#FFA500)
    IBM_3279_COLOR  // Multi-Color 3279 Terminal
};

class PhosphorTheme {
private:
    PhosphorType type;
    std::string name;
    ColorRGB primary;
    ColorRGB dim;
    ColorRGB highlight;
    ColorRGB bgDark;

public:
    PhosphorTheme(PhosphorType t = PhosphorType::P1_GREEN) {
        setTheme(t);
    }

    void setTheme(PhosphorType t) {
        type = t;
        switch (t) {
            case PhosphorType::P1_GREEN:
                name = "P1 Phosphor (Classic IBM 3270 Green)";
                primary = {51, 255, 51};     // #33FF33
                dim = {25, 140, 25};
                highlight = {160, 255, 160};
                bgDark = {8, 14, 8};
                break;
            case PhosphorType::P31_RADAR:
                name = "P31 Phosphor (Vibrant Radar/Scope)";
                primary = {127, 255, 0};     // #7FFF00
                dim = {70, 145, 0};
                highlight = {200, 255, 120};
                bgDark = {10, 15, 6};
                break;
            case PhosphorType::P39_FOREST:
                name = "P39 Phosphor (Long-Persistence Forest)";
                primary = {74, 222, 128};    // #4ADE80
                dim = {0, 100, 0};          // #006400
                highlight = {187, 247, 208};
                bgDark = {4, 10, 5};
                break;
            case PhosphorType::P3_AMBER:
                name = "P3 Phosphor (Warm Amber VT220)";
                primary = {255, 183, 0};     // #FFB700
                dim = {150, 105, 0};
                highlight = {255, 230, 130};
                bgDark = {16, 11, 2};
                break;
            case PhosphorType::P12_ORANGE:
                name = "P12 Phosphor (Safety CRT Orange)";
                primary = {255, 165, 0};     // #FFA500
                dim = {160, 95, 0};
                highlight = {255, 210, 140};
                bgDark = {18, 8, 0};
                break;
            case PhosphorType::IBM_3279_COLOR:
                name = "IBM 3279 Color Display Station";
                primary = {51, 255, 51};     // Green primary
                dim = {0, 180, 216};        // Cyan highlights
                highlight = {255, 183, 0};   // Amber alerts
                bgDark = {5, 8, 12};
                break;
        }
    }

    PhosphorType getType() const { return type; }
    std::string getName() const { return name; }
    ColorRGB getPrimary() const { return primary; }
    ColorRGB getDim() const { return dim; }
    ColorRGB getHighlight() const { return highlight; }
    ColorRGB getBg() const { return bgDark; }

    // ANSI 24-bit Truecolor escape strings
    std::string fgCode() const {
        std::ostringstream ss;
        ss << "\033[38;2;" << primary.r << ";" << primary.g << ";" << primary.b << "m";
        return ss.str();
    }

    std::string dimCode() const {
        std::ostringstream ss;
        ss << "\033[38;2;" << dim.r << ";" << dim.g << ";" << dim.b << "m";
        return ss.str();
    }

    std::string highlightCode() const {
        std::ostringstream ss;
        ss << "\033[38;2;" << highlight.r << ";" << highlight.g << ";" << highlight.b << "m";
        return ss.str();
    }

    std::string bgCode() const {
        std::ostringstream ss;
        ss << "\033[48;2;" << bgDark.r << ";" << bgDark.g << ";" << bgDark.b << "m";
        return ss.str();
    }

    static std::string reset() {
        return "\033[0m";
    }

    static std::string bold() {
        return "\033[1m";
    }

    static std::string underline() {
        return "\033[4m";
    }

    static std::string clearScreen() {
        return "\033[2J\033[H";
    }
};

#endif // PHOSPHOR_THEME_H
