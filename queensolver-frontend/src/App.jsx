import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const colorToNameMapping = {
   "V": "#BBA3E1", // Soft Purple
   "O": "#FECA91", // Soft Orange
   "G": "#B3DFA0", // Soft Green
   "B": "#96BDFE", // Soft Blue
   "W": "#DFDFDF", // Soft Gray
   "C": "#E6F389", // Lime Green
   "P": "#AF7AC5", // Elegant Pink
   "R": "#FE7B5F", // Soft Red
   "E": "#F5F5DC", // Beige
   "L": "#A52A2A", // Velvet Brown
   "": "#3A3A4A"  // Default color
};

function App() {
   const [boardSize, setBoardSize] = useState(7);
   const [board, setBoard] = useState(Array(7).fill().map(() => Array(7).fill("")));
   const [solution, setSolution] = useState(null);
   const [currentColor, setCurrentColor] = useState("");
   const [loading, setLoading] = useState(false);

   const handleCellClick = (r, c) => {
      const newBoard = board.map((row, rowIndex) =>
         row.map((cell, colIndex) =>
            rowIndex === r && colIndex === c ? currentColor : cell
         )
      );
      setBoard(newBoard);
   };

   const handleSizeChange = (size) => {
      setBoardSize(size);
      setBoard(Array(size).fill().map(() => Array(size).fill("")));
      setSolution(null);
      // Add this line to update the CSS variable
      document.documentElement.style.setProperty('--board-size', size);
   };

   // Add this to set initial board size on component mount
   React.useEffect(() => {
      document.documentElement.style.setProperty('--board-size', boardSize);
   }, []);

   const handleSolve = async () => {
      setLoading(true);
      const boardStr = board.map(row => row.join("")).join("\n");
      const coloredRegions = convertToColoredRegions(boardStr);
      try {
         const response = await axios.get('https://queen-solver.jerome-baille.fr/solve', {
            params: {
               board_size: boardSize,
               colored_regions: JSON.stringify(coloredRegions)
            }
         });
         setSolution(response.data.solution);
      } catch (error) {
         console.error("Error solving the board:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleReset = () => {
      setBoard(Array(boardSize).fill().map(() => Array(boardSize).fill("")));
      setSolution(null); 
   };

   const handleFillBoard = () => {
      setBoard(Array(boardSize).fill().map(() => Array(boardSize).fill(currentColor)));
   };

   const convertToColoredRegions = (boardStr) => {
      const coloredRegions = {};
      const rows = boardStr.split("\n");
      rows.forEach((row, r) => {
         row.split("").forEach((colorKey, c) => {
            if (colorKey === "") {
               return;
            } else {
               if (!coloredRegions[colorKey]) {
                  coloredRegions[colorKey] = [];
               }
               coloredRegions[colorKey].push([r, c]);
            }
         });
      });
      return coloredRegions;
   };

   return (
      <>
         {loading && (
            <div className="loading-overlay">
               <div className="loading-spinner"></div>
            </div>
         )}
         <main className='main'>
            <div className="size-selector">
               <label>Board Size: </label>
               <select 
                  value={boardSize} 
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
               >
                  {Array.from({length: 15 - 5}, (_, i) => i + 6).map(size => (
                     <option key={size} value={size}>{size}x{size}</option>
                  ))}
               </select>
            </div>

            <div className="board-container">
               <div className="board">
                  {board.map((row, r) => (
                     <div key={r} className="board-row">
                        {row.map((cell, c) => (
                           <button
                              key={c}
                              className="board-cell"
                              style={{ backgroundColor: colorToNameMapping[cell] }}
                              onClick={() => handleCellClick(r, c)}
                           >
                              {solution && solution[r][c] ? <span className="queen-icon">♛</span> : ""}
                           </button>
                        ))}
                     </div>
                  ))}
               </div>
            </div>

            <div className="color-buttons">
               {["V", "O", "G", "B", "W", "C", "P", "R", "E", "L"].map(colorKey => (
                  <button
                     key={colorKey}
                     className={`color-button ${currentColor === colorKey ? 'selected' : ''}`}
                     style={{ backgroundColor: colorToNameMapping[colorKey] }}
                     onClick={() => setCurrentColor(colorKey)}
                  />
               ))}
               <button 
                  className="fill-board-button"
                  onClick={handleFillBoard}
                  disabled={!currentColor}
               >
                  Fill Board
               </button>
            </div>
         </main>
         <footer className='footer'>
            <div className="button-container">
               <button className="solve-button" onClick={handleSolve} disabled={loading}>
                  Solve
               </button>
               <button onClick={handleReset} disabled={loading}>Reset</button>
            </div>
         </footer>
      </>
   );
}

export default App;