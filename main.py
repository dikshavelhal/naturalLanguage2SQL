import os
import re
import sqlite3
import logging
import pandas as pd
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from langchain.chat_models import init_chat_model
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_community.utilities import SQLDatabase
from functools import lru_cache

if os.getenv("VERCEL") is None:
    load_dotenv()
# Set API keys securely (consider using environment variables)
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

UPLOAD_FOLDER = "databases"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DB_PATH = "C:/Users/lenovo/Desktop/nl2sql - Copy/backend/database/iris.db"

  # Default database

# Initialize LLM
llm = init_chat_model(
    "mistral-large-latest",
    model_provider="mistralai",
    api_key=MISTRAL_API_KEY
)

query_prompt_template = hub.pull("langchain-ai/sql-query-system-prompt")

def extract_sql_query(llm_response):
    """Extracts SQL query from LLM response using regex."""
    match = re.search(r"```sql\n(.*?)\n```", llm_response, re.DOTALL)
    if match:
        return match.group(1).strip()

    sql_lines = [line for line in llm_response.split("\n") if "SELECT" in line.upper()]
    return sql_lines[0].strip() if sql_lines else None

def convert_csv_to_db(csv_path, db_path):
    """Converts a CSV file to an SQLite database."""
    try:
        df = pd.read_csv(csv_path)
        df.columns = [col.replace(" ", "_") for col in df.columns]

        conn = sqlite3.connect(db_path)
        df.to_sql("UploadedTable", conn, if_exists="replace", index=True, index_label="id")
        conn.close()
    except Exception as e:
        logging.error(f"Error converting CSV to DB: {e}")

@lru_cache(maxsize=5)
def get_table_metadata(db_path):
    """Caches table metadata to reduce redundant queries."""
    try:
        db = SQLDatabase.from_uri(f"sqlite:///{db_path}")
        return db.get_table_info()
    except Exception as e:
        logging.error(f"Error fetching table metadata: {e}")
        return ""

@app.route("/api/upload_db", methods=["POST"])
def upload_db():
    """Handles file uploads for database or CSV."""
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = secure_filename(file.filename)
    file_ext = os.path.splitext(filename)[1].lower()

    global DB_PATH

    try:
        if file_ext == ".db":
            db_filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(db_filepath)
            DB_PATH = db_filepath  # Switch to new database

        elif file_ext == ".csv":
            csv_filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(csv_filepath)

            db_filepath = os.path.join(UPLOAD_FOLDER, filename.replace(".csv", ".db"))
            convert_csv_to_db(csv_filepath, db_filepath)
            DB_PATH = db_filepath  # Switch to new database

        else:
            return jsonify({"error": "Invalid file type. Only .db and .csv are supported."}), 400

        get_table_metadata.cache_clear()  # Clear cached metadata
        return jsonify({"message": "Database uploaded successfully", "db_path": DB_PATH})

    except Exception as e:
        logging.error(f"File upload error: {e}")
        return jsonify({"error": "File upload failed"}), 500

@app.route("/api/query", methods=["POST"])
def process_query():
    """Processes user queries and generates SQL queries using LLM."""
    data = request.json
    user_query = data.get("query", "")

    if not user_query.strip():
        return jsonify({"error": "Query is empty"}), 400

    try:
        db = SQLDatabase.from_uri(f"sqlite:///{DB_PATH}")
        table_info = get_table_metadata(DB_PATH)

        prompt = query_prompt_template.invoke(
            {
                "dialect": db.dialect,
                "top_k": 10,
                "table_info": table_info,
                "input": user_query,
            }
        )

        structured_llm = llm | StrOutputParser()
        llm_response = structured_llm.invoke(prompt)
        sql_query = extract_sql_query(llm_response)

        if not sql_query or not sql_query.upper().startswith("SELECT"):
            return jsonify({"error": "The query does not make sense or cannot be converted to SQL."}), 400

        logging.info(f"Generated SQL Query: {sql_query}")

        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        cursor = conn.cursor()

        try:
            cursor.execute(sql_query)
            result = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            conn.close()
            formatted_result = [dict(zip(columns, row)) for row in result]
        except Exception as e:
            conn.close()
            logging.error(f"SQL Execution Error: {e}")
            return jsonify({"error": f"Error executing query: {str(e)}"}), 500

        return jsonify({"sql_query": sql_query, "data": formatted_result})

    except Exception as e:
        logging.error(f"Query Processing Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)

