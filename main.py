from flask import Flask, render_template, request, redirect, url_for, session, flash
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

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

@app.route('/')
def home():
    logged_in = 'user_id' in session
    return render_template('home.html', logged_in=logged_in)

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
        cursor.execute("INSERT INTO Entries (content, user_id) VALUES (%s, %s)", (content, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        flash('Entry created successfully!', 'success')
        return redirect(url_for('entries'))

    return render_template('entries.html')
if __name__ == '__main__':
    app.run(debug=True)