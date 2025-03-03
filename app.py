from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jarofjoy.db'  # Local SQLite database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SECRET_KEY'] = 'your_secret_key'

db = SQLAlchemy(app)

# Define User and Entry models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    entries = db.relationship('Entry', backref='user', lazy=True)

class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    time = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Create the database tables
with app.app_context():
    db.create_all()

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
    
    return render_template('home.html', logged_in=logged_in, streak=streak)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password)

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            flash('Email already registered. Please use a different email.', 'danger')
        else:
            new_user = User(email=email, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful! You can now log in.', 'success')
            return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Login failed. Check your email and/or password.', 'danger')

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

        new_entry = Entry(content=content, user_id=user_id)
        db.session.add(new_entry)
        db.session.commit()

        flash('Entry created successfully!', 'success')
        return redirect(url_for('entries'))

    return render_template('entries.html')

@app.route('/random_entry', methods=['GET'])
def random_entry():
    if 'user_id' not in session:
        flash('You need to log in first.', 'danger')
        return redirect(url_for('login'))

    user_id = session['user_id']
    entry = Entry.query.filter_by(user_id=user_id).order_by(db.func.random()).first()

    if not entry:
        flash('You have no entries to display.', 'warning')
        return redirect(url_for('entries'))

    db.session.delete(entry)
    db.session.commit()

    return render_template('random_entry.html', random_entry=entry)

@app.route('/view_entries', methods=['GET'])
def view_entries():
    if 'user_id' not in session:
        flash('You need to log in first.', 'danger')
        return redirect(url_for('login'))

    user_id = session['user_id']
    order_param = request.args.get('order_by', 'DESC').upper()

    if order_param == "ASC":
        entries = Entry.query.filter_by(user_id=user_id).order_by(Entry.time.asc()).all()
    else:
        entries = Entry.query.filter_by(user_id=user_id).order_by(Entry.time.desc()).all()

    return render_template('view_entries.html', entries=entries, current_order=order_param)

if __name__ == '__main__':
    app.run(debug=True)