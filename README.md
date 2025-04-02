# Natural Language to SQL (NL2SQL)

## Overview
This project converts natural language queries into SQL queries using a Python backend (Flask) and a Vite-powered React frontend. It supports database uploads in `.db` and `.csv` formats, allowing users to interact with structured data intuitively.

## Features
- Convert user queries into SQL statements using AI.
- Upload SQLite databases (`.db`) or CSV files.
- Execute SQL queries and return structured results.
- Uses LangChain and Mistral AI for query interpretation.
- Built with Flask (Python) for the backend and Vite + React for the frontend.

## Tech Stack
### **Frontend:**
- Vite
- React
- Tailwind CSS

### **Backend:**
- Flask
- LangChain
- Mistral AI
- SQLite
- Pandas

## Setup Instructions
### **1. Clone the Repository**
```sh
git clone <repository_url>
cd nl2sql-project
```

### **2. Backend Setup**
```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### **3. Frontend Setup**
```sh
cd frontend
npm install
npm run dev
```

## Usage
- Start the backend and frontend as mentioned above.
- Upload a `.db` or `.csv` file.
- Enter a natural language query in the frontend UI.
- The backend will process it and return a valid SQL query with results.

## Screenshots
![image](https://github.com/user-attachments/assets/506794f1-6871-4750-8178-54461dbd290c)
![image](https://github.com/user-attachments/assets/e7300e53-1379-459a-8abc-21756ae29230)
![image](https://github.com/user-attachments/assets/cfb9a6a4-1815-4a27-a132-e0209063f1f8)




## Future Improvements
- Support for additional database engines.
- Enhanced AI model for better SQL query generation.
- User authentication and query history tracking.



