import unittest
import json
from flask import Flask, session
from app import app, get_db_connection  # Adjust the import based on your app structure

class FlaskAppTests(unittest.TestCase):
    def setUp(self):
        # Set up the test client and the app context
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['MYSQL_DATABASE_DB'] = 'testdb'  # Use your test database
        self.client = self.app.test_client()

        # Create a test database and tables if necessary
        self.create_test_db()

    def tearDown(self):
        # Clean up after each test
        self.drop_test_db()

    def create_test_db(self):
        # Create your test database and tables here
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS User (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), password VARCHAR(255))")
        cursor.execute("CREATE TABLE IF NOT EXISTS Entries (id INT AUTO_INCREMENT PRIMARY KEY, content TEXT, user_id INT, time DATETIME)")
        conn.commit()
        cursor.close()
        conn.close()

    def drop_test_db(self):
        # Drop your test database and tables here
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS Entries")
        cursor.execute("DROP TABLE IF EXISTS User")
        conn.commit()
        cursor.close()
        conn.close()

    def test_register(self):
        response = self.client.post('/register', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn(b'Registration successful', response.data)

    def test_login(self):
        # First, register a user
        self.client.post('/register', json={
            'email': 'test@example.com',
            'password': 'password123'
        })

        # Now, try to log in
        response = self.client.post('/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Login successful!', response.data)

    def test_login_fail(self):
        response = self.client.post('/login', json={
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, 401)
        self.assertIn(b'User not found. Please register first', response.data)

    def test_entries(self):
        # Register and log in a user
        self.client.post('/register', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        self.client.post('/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })

        # Create an entry
        response = self.client.post('/entries', json={
            'content': 'This is a test entry.'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn(b'Entry created successfully!', response.data)

        # Get entries
        response = self.client.get('/entries')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'This is a test entry.', response.data)

    def test_logout(self):
        # Register and log in a user
        self.client.post('/register', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        self.client.post('/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })

        # Log out
        response = self.client.post('/logout')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'You have been logged out', response.data)
if __name__ == '__main__':
    unittest.main()