CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -Icpp/include
TARGET = smart_cafeteria

SRCS = cpp/src/main.cpp

all: $(TARGET)

$(TARGET): $(SRCS)
	$(CXX) $(CXXFLAGS) $(SRCS) -o $(TARGET)

clean:
	rm -f $(TARGET) $(TARGET).exe

run: $(TARGET)
	./$(TARGET)
