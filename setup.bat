@echo off

REM Create a virtual environment
python -m venv venv

REM Activate the virtual environment
venv\Scripts\activate

REM Install the required packages
pip install -r requirements.txt