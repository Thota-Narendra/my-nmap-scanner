# Nmap Web Scanner 🌐🔍

A web-based network scanning tool built with **React** (frontend) and **Flask** (backend) to perform Nmap scans via a user-friendly interface. Users can specify targets, ports, and scan options, with results displayed in a table. 🚀

## Features ✨
- **Advanced Scans**: Supports OS Detection (`-O`) and Aggressive Scan (`-A`), with conflict prevention (e.g., no `-sn` with `-O`). 🛠️
- **Responsive UI**: Built with React and Tailwind CSS for a modern, dark-themed interface. 🎨
- **Error Handling**: Clear messages for scan failures (e.g., permission errors). ⚠️

## Tech Stack 🛠️
- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Flask, Python, Nmap
- **Dependencies**: `flask`, `flask-cors`, `react`, `react-dom`, `tailwindcss`

## Installation ⚙️
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/nmap-web-scanner.git
   cd nmap-web-scanner
   ```

2. **Install Nmap**:
   - Windows: Download from https://nmap.org/download.html and add to PATH.
   - Linux: `sudo apt install nmap`
   - macOS: `brew install nmap`

3. **Backend Setup**:
   ```bash
   pip install flask flask-cors
   python server.py
   ```
   - Run as Administrator on Windows for `-O` or `-A`. 🔐

4. **Frontend Setup**:
   ```bash
   npm install
   npm run dev
   ```

## Usage 📝
1. Enter a target (e.g., `scanme.nmap.org`). 🌍
2. Specify ports (e.g., `80,443`) or select Full/Fast/Top Ports.
3. Choose scan options (e.g., OS Detection). 🔎
4. Click "Start Scan" to view results. 📊

## Project Structure 📂
```
nmap-web-scanner/
├── index.html         # HTML entry point
├── src/
│   ├── App.jsx        # Main React component
│   ├── main.jsx       # React entry point
│   └── index.css      # Tailwind CSS styles
├── server.py          # Flask backend
├── package.json       # Node.js dependencies
├── .gitignore         # Ignored files
└── README.md          # Documentation
```

## Notes 📋
- Run `server.py` as Administrator for `-O` or `-A` due to raw socket requirements. 🔐
- Avoid combining `-sn` (Ping Scan) with `-O` or `-A`.

## License 📜
MIT License