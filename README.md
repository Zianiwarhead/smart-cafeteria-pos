# Smart Cafeteria POS — C++ Terminal App

This project is primarily a local C++17 terminal application for cafeteria orders, queue tickets, receipts, and inventory. It uses a green phosphor terminal theme and prints item details and drink ingredients in the menu.

The React interface in the repository is a visual prototype. The supported cafeteria workflow is the C++ terminal app.

## Build and run

### Windows

Open PowerShell or Command Prompt in this repository and run:

```bat
build.bat
run.bat
```

The build script uses `g++` from PATH or checks common MSYS2 locations (`C:\msys64\mingw64\bin` and `C:\msys64\ucrt64\bin`).

### Linux, macOS, or MSYS2

```sh
make
./smart_cafeteria
```

Keep the terminal's current directory at the repository root so the app can find `cpp/data/`.

## Terminal features

- Walk-in and scheduled orders
- Kenyan shilling pricing, cash change calculation, and simulated M-Pesa checkout
- Printable text and PDF receipts
- Persistent order history and stock levels
- Admin sales report export and inventory restocking

M-Pesa checkout is a local simulation. It does not contact Safaricom or transfer money. The four-digit PIN prompt is only a demo confirmation.

## Admin access

There is no shared demo password in the repository. Set a private `CAFETERIA_ADMIN_PIN` environment variable before starting the program to unlock analytics and restocking.

PowerShell:

```powershell
$env:CAFETERIA_ADMIN_PIN = "choose-a-private-pin"
.\run.bat
```

Command Prompt:

```bat
set CAFETERIA_ADMIN_PIN=choose-a-private-pin
run.bat
```

Linux/macOS:

```sh
export CAFETERIA_ADMIN_PIN='choose-a-private-pin'
./smart_cafeteria
```

## Local data files

- `cpp/data/menu.txt` — Menu, descriptions, prices, and starting inventory.
- `cpp/data/inventory.txt` — Persistent local stock counts (created at runtime and ignored by Git).
- `cpp/data/orders.txt` — Local order history.
- `cpp/data/receipts/` — Text and PDF receipts generated at runtime.
- `cpp/data/daily_sales_report.csv` — Admin export.

Order logs and generated receipts are local runtime data and are excluded from future Git commits. Existing public sample records have been cleared from the current source tree.