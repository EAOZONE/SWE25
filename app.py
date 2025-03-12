import time

import mysql.connector
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

app = Flask(__name__)
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

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password)

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Check if the email already exists
            cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
            existing_user = cursor.fetchone()

            if existing_user:
                flash('Email already registered. Please use a different email.', 'danger')
            else:
                cursor.execute("INSERT INTO User (email, password) VALUES (%s, %s)", (email, hashed_password))
                conn.commit()
                flash('Registration successful! You can now log in.', 'success')
                return redirect(url_for('login'))
        except mysql.connector.Error as err:
            flash(f'Error: {err}', 'danger')
        finally:
            cursor.close()
            conn.close()

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM User WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Login failed. Check your email and/or password.', 'danger')

        cursor.close()
        conn.close()

    return render_template('login.html')

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    flash('You have been logged out.', 'success')
    return redirect(url_for('home'))

@app.route('/delete', methods=['POST'])
def delete():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    user_id = session['user_id']
    print(user_id)
    cursor.execute("DELETE FROM User WHERE id = %s", (user_id,))
    conn.commit()
    flash('You have been deleted.', 'success')
    cursor.close()
    conn.close()
    session.pop('user_id', None)
    return redirect(url_for('home'))


@app.route('/entries', methods=['POST', 'GET'])
def entries():
    if 'user_id' not in session:
        flash('You need to log in first.', 'danger')
        return redirect(url_for('login'))

    if request.method == 'POST':
        content = request.form['content']
        user_id = session['user_id']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Entries (content, user_id, time) VALUES (%s, %s, NOW())", (content, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        flash('Entry created successfully!', 'success')
        return redirect(url_for('entries'))

    return render_template('entries.html')

@app.route('/random_entry', methods=['GET'])
def random_entry():
    if 'user_id' not in session:
        flash('You need to log in first.', 'danger')
        return redirect(url_for('login'))

    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) as entry_count FROM Entries WHERE user_id = %s", (user_id,))
    result = cursor.fetchone()

    if result['entry_count'] == 0:
        flash('You have no entries to display.', 'warning')
        return redirect(url_for('entries'))
    # Fetch a random entry for the logged-in user
    cursor.execute("SELECT * FROM Entries WHERE user_id = %s ORDER BY RAND() LIMIT 1", (user_id,))
    entry = cursor.fetchone()
    content = entry['content']
    time = entry['time']
    cursor.execute("DELETE FROM Entries WHERE content= %s AND time = %s AND user_id = %s", (content, time, user_id))
    conn.commit()
    cursor.close()
    conn.close()

    return render_template('random_entry.html', random_entry=entry)

@app.route('/view_entries', methods=['GET'])
def view_entries():
    if 'user_id' not in session:
        flash('You need to log in first.', 'danger')
        return redirect(url_for('login'))

    user_id = session['user_id']
    order_param = request.args.get('order_by', 'DESC').upper()

    if order_param == "ASC":
        order_by = "ASC"
    else:
        order_by = "DESC"

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM Entries WHERE user_id = %s ORDER BY time " + order_by
    cursor.execute(query, (user_id,))

    entries = cursor.fetchall()
    cursor.close()
    conn.close()

    return render_template('view_entries.html', entries=entries, current_order=order_by)

if __name__ == '__main__':
    app.run(debug=True)