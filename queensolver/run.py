from flask import Flask, request, jsonify
from flask_cors import CORS
from z3 import Solver, Bool, Sum, If, Not, Implies, sat
import json
import datetime
from db import insert_record, get_records_by_date  # new import

app = Flask(__name__)
CORS(app)

# Global in-memory storage for saved data
saved_data = {}  # { date_str: [ { board_size, colored_regions, solution, date }, ... ] }

def get_solution(board_size, colored_regions):
    solver = Solver()
    board = [[Bool(f"cell_{r}_{c}") for c in range(board_size)] for r in range(board_size)]
    # Row constraints
    for r in range(board_size):
        solver.add(Sum([If(board[r][c], 1, 0) for c in range(board_size)]) == 1)
    # Column constraints    
    for c in range(board_size):
        solver.add(Sum([If(board[r][c], 1, 0) for r in range(board_size)]) == 1)
    # Region constraints
    for color, region in colored_regions.items():
        solver.add(Sum([If(board[r][c], 1, 0) for r, c in region]) == 1)
    # Queen attack constraints
    for r in range(board_size):
        for c in range(board_size):
            if r > 0:
                solver.add(Implies(board[r][c], Not(board[r - 1][c])))
            if r < board_size - 1:
                solver.add(Implies(board[r][c], Not(board[r + 1][c])))
            if c > 0:
                solver.add(Implies(board[r][c], Not(board[r][c - 1])))
            if c < board_size - 1:
                solver.add(Implies(board[r][c], Not(board[r][c + 1])))
            if r > 0 and c > 0:
                solver.add(Implies(board[r][c], Not(board[r - 1][c - 1])))
            if r > 0 and c < board_size - 1:
                solver.add(Implies(board[r][c], Not(board[r - 1][c + 1])))
            if r < board_size - 1 and c > 0:
                solver.add(Implies(board[r][c], Not(board[r + 1][c - 1])))
            if r < board_size - 1 and c < board_size - 1:
                solver.add(Implies(board[r][c], Not(board[r + 1][c + 1])))
    if solver.check() == sat:
        model = solver.model()
        solution = [[bool(model.evaluate(board[r][c])) for c in range(board_size)] for r in range(board_size)]
        return solution
    return None

@app.route('/solve', methods=['GET'])
def solve_queens_game():
    try:
        board_size = int(request.args.get('board_size'))
        if board_size < 6 or board_size > 15:
            return jsonify({'error': 'Board size must be between 6 and 15'}), 400
        colored_regions = json.loads(request.args.get('colored_regions'))
        # Debug: Print received regions
        print("Received regions:", colored_regions)
        # Validate regions
        total_cells = sum(len(region) for region in colored_regions.values())
        if total_cells != board_size * board_size:
            return jsonify({'error': f'Invalid regions. Expected {board_size * board_size} cells, got {total_cells}'}), 400
        solution = get_solution(board_size, colored_regions)
        if solution is not None:
            return jsonify({'solution': solution})
        else:
            return jsonify({'solution': None})
    except Exception as e:
        print("Error:", str(e))  # Debugging line
        return jsonify({'error': str(e)}), 400

@app.route('/save', methods=['POST'])
def save_game():
    try:
        data = request.get_json()
        board_size = int(data.get('board_size'))
        colored_regions = data.get('colored_regions')
        # Compute solution using the helper
        solution = get_solution(board_size, colored_regions)
        # Use provided date or default to today's date
        provided_date = data.get('date')
        # Fix: Use provided_date if it exists and is not empty (after stripping spaces)
        date_to_use = provided_date.strip() if provided_date and provided_date.strip() != "" else datetime.datetime.today().strftime("%Y-%m-%d")
        # Insert record into SQLite DB
        insert_record(board_size, colored_regions, solution, date_to_use)
        record = {
            'board_size': board_size,
            'colored_regions': colored_regions,
            'solution': solution,
            'date': date_to_use
        }
        return jsonify({'message': 'Game saved', 'record': record})
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 400

@app.route('/data', methods=['GET'])
def get_saved_data():
    try:
        date_str = request.args.get('date')
        records = get_records_by_date(date_str)
        return jsonify({'records': records})
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)