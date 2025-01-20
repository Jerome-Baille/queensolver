# Queen Solver Web Application

This project is a web application that solves the N-Queens problem. The frontend is built using React and the backend is implemented in Python using Flask.

## Features

- Solve the N-Queens problem for any given N
- Visualize the solution on a chessboard
- Responsive design

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/queen-solver-webapp.git
   cd queen-solver-webapp
   ```

2. Install the dependencies for the frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Install the dependencies for the backend:
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

## Usage

1. Start the backend server:
   ```bash
   cd backend
   python run.py
   ```

2. Start the frontend development server:
   ```bash
   cd ../frontend
   npm start
   ```

3. Open your web browser and navigate to `http://localhost:3000` to use the application.

## File Structure

- `frontend/`: Contains the React frontend code
  - `src/`: Source code for the React application
    - `App.jsx`: Main component of the React application
    - `components/`: Contains React components
    - `styles/`: Contains CSS files
- `backend/`: Contains the Flask backend code
  - `run.py`: Entry point for the Flask application
  - `routes/`: Contains route definitions
  - `static/`: Contains static files

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature-branch`)
6. Create a new Pull Request

## License

This project is licensed under the MIT License.