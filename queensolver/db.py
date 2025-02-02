import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'records.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            board_size INTEGER,
            colored_regions TEXT,
            solution TEXT,
            date TEXT
        )
    ''')
    conn.commit()
    conn.close()

def insert_record(board_size, colored_regions, solution, date):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO records (board_size, colored_regions, solution, date)
        VALUES (?, ?, ?, ?)
    ''', (board_size, json.dumps(colored_regions), json.dumps(solution), date))
    conn.commit()
    conn.close()

def get_records_by_date(date):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        SELECT board_size, colored_regions, solution, date FROM records WHERE date = ?
    ''', (date,))
    rows = c.fetchall()
    conn.close()
    records = []
    for board_size, colored_regions, solution, date in rows:
        records.append({
            'board_size': board_size,
            'colored_regions': json.loads(colored_regions),
            'solution': json.loads(solution),
            'date': date
        })
    return records

init_db()
