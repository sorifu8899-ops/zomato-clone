@echo off
echo ==========================================
echo Starting Zomato Clone Project...
echo Express Server will run on http://localhost:5000
echo Vite React Client will run on http://localhost:5173
echo ==========================================
echo.

:: Start the Express backend server in a new command window
start "Zomato Backend Server" cmd /k "cd server && npm start"

:: Start the Vite React client dev server in a new command window
start "Zomato Frontend Client" cmd /k "cd client && npm run dev"

echo Both services are booting up in separate terminals.
echo Press any key to exit this launcher window...
pause > null
