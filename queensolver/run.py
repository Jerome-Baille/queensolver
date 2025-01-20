from flask import Flask, request, jsonify
from flask_cors import CORS
from z3 import Solver, Bool, Sum, If, Not, Implies, sat
import json

app = Flask(__name__)
CORS(app)

@app.route('/solve', methods=['GET'])
def solve_queens_game():
    try:
        board_size = int(request.args.get('board_size'))
        
        # Validate board size
        if board_size < 6 or board_size > 15:
            return jsonify({'error': 'Board size must be between 6 and 15'}), 400
            
        colored_regions = json.loads(request.args.get('colored_regions'))
        
        # Debug: Print received regions
        print("Received regions:", colored_regions)
        
        # Validate regions
        total_cells = sum(len(region) for region in colored_regions.values())
        if total_cells != board_size * board_size:
            return jsonify({'error': f'Invalid regions. Expected {board_size * board_size} cells, got {total_cells}'}), 400

        solver = Solver()
        board = [[Bool(f"cell_{r}_{c}") for c in range(board_size)] for r in range(board_size)]
        
        # Row constraints
        for r in range(board_size):
            constraint = Sum([If(board[r][c], 1, 0) for c in range(board_size)]) == 1
            solver.add(constraint)
        
        # Column constraints    
        for c in range(board_size):
            constraint = Sum([If(board[r][c], 1, 0) for r in range(board_size)]) == 1
            solver.add(constraint)
        
        # Region constraints
        for color, region in colored_regions.items():
            solver.add(Sum([If(board[r][c], 1, 0) for r, c in region]) == 1)  # Changed <= to ==
        
        # Queen attack constraints
        for r in range(board_size):
            for c in range(board_size):
                # Check all 8 directions directly
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
            return jsonify({'solution': solution})
        else:
            print("Unsat Core:", solver.unsat_core())
            return jsonify({'solution': None})

    except Exception as e:
        print("Error:", str(e))  # Debugging line
        return jsonify({'error': str(e)}), 400

@app.route('/test')
def test():
    return jsonify({'message': 'success'})

if __name__ == '__main__':
    app.run(debug=True)