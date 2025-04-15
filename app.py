import mysql.connector
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_cors import CORS # type: ignore
import time
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['MYSQL_DATABASE_HOST'] = 'jarofjoy2025.c10agqm2ctie.us-east-2.rds.amazonaws.com'
app.config['MYSQL_DATABASE_USER'] = 'admin'
app.config['MYSQL_DATABASE_PASSWORD'] = 'wpjkdErnJ8oK3aM9ojK7'
app.config['MYSQL_DATABASE_DB'] = 'jarofjoy'
app.config['SECRET_KEY'] = 'your_secret_key'

# Create a MySQL connection
def get_db_connection():
    return mysql.connector.connect(
        host=app.config['MYSQL_DATABASE_HOST'],
        user=app.config['MYSQL_DATABASE_USER'],
        password=app.config['MYSQL_DATABASE_PASSWORD'],
        database=app.config['MYSQL_DATABASE_DB']
    )

def get_streak(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT time FROM Entries WHERE user_id = %s ORDER BY time DESC", (user_id,))
    entries = cursor.fetchall()
    cursor.close()
    conn.close()

    if not entries:
        return 0  # no entries

    streak = 0
    counted_days = set() #to avoid double counting
    prev_day = datetime.today().date()
    for entry in entries:
        print(entry['time'])
        entry_date = datetime.strptime(str(entry['time']), "%Y-%m-%d %H:%M:%S").date()

        if entry_date in counted_days:  # skip if already counted
            continue

        if entry_date == prev_day:  # consecutive days
            streak += 1
        elif entry_date == prev_day - timedelta(days=1):  # cont streak
            streak += 1
        else:  # break streak
            break
        counted_days.add(entry_date)
        prev_day = entry_date  # move to the next day

    return streak

@app.route('/')
def home():
    logged_in = 'user_id' in session
    streak = 0
    if logged_in:
        user_id = session['user_id']
        streak = get_streak(user_id)
    return render_template('home.html', logged_in=logged_in, streak=streak)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password are required to register"}), 400
    
    email = data['email']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor()
   
    cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        conn.close()
        return jsonify({"error": "Email already registered"}), 400
    
    
    hashed_password = generate_password_hash(password)
    cursor.execute("INSERT INTO User (email, password) VALUES (%s, %s)", (email, hashed_password))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Registration successful"}), 201

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user is None:
            print("User not found)")
            return jsonify({"error": "User not found. Please register first"}), 401

        if not check_password_hash(user["password"], password):
            print("Incorrect password")
            return jsonify({"error": "Incorrect password. Please try again."}), 401
    
        session["user_id"] = user["id"]
        session.permanent = True
  
        return jsonify({"message": "Login successful!", "user_id": user["id"]}), 200

        
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "You have been logged out"}), 200

@app.route('/entries', methods=['POST', 'GET'])
def entries():
    if 'user_id' not in session:
        return jsonify({"error": "You need to log in first."}), 401

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    if request.method == 'POST':
        data = request.json
        content = data.get("content")
        user_id = session['user_id']

        if not content:
            return jsonify ({"error": "Content is required" })
     
        cursor.execute("INSERT INTO Entries (content, user_id, time) VALUES (%s, %s, NOW())", (content, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Entry created successfully!"}), 201
    
    elif request.method == 'GET':
        cursor.execute("SELECT * FROM Entries WHERE user_id = %s ORDER BY time DESC", (session['user_id'],))
        entries = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(entries), 200
    
    return jsonify({"error": "Invalid request method"}), 405

@app.route('/random_entry', methods=['GET'])
def random_entry():
    if 'user_id' not in session:
        return jsonify({"error": "You need to log in first"}), 401
      
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try: 
        cursor.execute("SELECT COUNT(*) as entry_count FROM Entries WHERE user_id = %s", (user_id,))
        result = cursor.fetchone()

        if result['entry_count'] == 0:
            return jsonify({"error": "No entries found"}), 404
          
    # fetch a random entry
        cursor.execute("SELECT * FROM Entries WHERE user_id = %s ORDER BY RAND() LIMIT 1", (user_id,))
        entry = cursor.fetchone()
        if not entry:
            return jsonify({"error": "Failed to retrieve entry"}), 500
        
        return jsonify(entry), 200
    
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()
    
@app.route('/view_entries', methods=['GET'])
def view_entries():
    if 'user_id' not in session:
        jsonify({"error": "You need to log in first"}), 401

    user_id = session['user_id']
    order_param = request.args.get('order_by', 'DESC').upper()

    if order_param == "ASC":
        order_by = "ASC"
    else:
        order_by = "DESC"

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try: 
        query = "SELECT * FROM Entries WHERE user_id = %s ORDER BY time " + order_by
        cursor.execute(query, (user_id,))
        entries = cursor.fetchall()
        return jsonify(entries), 200
    
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/streak', methods=['GET'])
def fetch_streak():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    user_id = session['user_id']
    streak = get_streak(user_id)
    return jsonify({"streak": streak})

@app.route('/delete', methods=['POST'])
def delete():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    user_id = session['user_id']
    print(user_id)
    cursor.execute("DELETE FROM User WHERE id = %s", (user_id,))
    cursor.execute("DELETE FROM Entries WHERE user_id = %s", (user_id,))
    conn.commit()
    flash('You have been deleted.', 'success')
    cursor.close()
    conn.close()
    session.pop('user_id', None)
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)