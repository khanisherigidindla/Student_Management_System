Open your terminal and run:

==> .venv\Scripts\activate

==> pip install -r Backend\requirements.txt

1) Start the Backend

py Backend\app.py


2) Open the Frontend

Open Frontend\index.html in your web browser.

Features

- View all students
- Add new students
- Edit existing students
- Delete students
- Auto-create database and table

 API Routes

 `/getstudents`         ==>  GET | Get all students 
| `/getstudent/<id>`    ==>  GET | Get student by ID |
| `/addstudents`        ==>  POST | Add new student |
| `/updatestudent/<id>` ==>  PUT | Update student |
| `/deletestudent/<id>` ==>  DELETE | Delete student |

 Database Config

Edit Backend/db.py to change database credentials:
- host: localhost
- user: root
- password: Khanish@123
- database: Students




Student Management System
Project Overview

This project is a full-stack Student Management System built using:

Flask (Python) for backend

MySQL as the database

HTML, CSS, and JavaScript for frontend

The application allows users to:

Add students

View students in a dashboard table

Update student details

Delete students

Store data permanently in MySQL

The system follows a 3-tier architecture:

Frontend (Browser UI)
→ HTTP Requests
Backend (Flask REST API)
→ SQL Queries
Database (MySQL Server)

Each layer has a single responsibility:

Frontend handles UI and user interaction.

Backend handles validation and business logic.

Database stores structured data.

Technologies Used

Backend:

Python

Flask

Flask-CORS

MySQL

mysql-connector-python

Frontend:

HTML5

CSS3 (custom styling)

Vanilla JavaScript (Fetch API)

Architecture:

RESTful API

JSON communication

Layered separation of concerns

Environment Setup
Step 1: Create Virtual Environment
python -m venv .env

Activate:

Windows:

.env\Scripts\activate

Mac/Linux:

source .env/bin/activate
Step 2: Install Required Packages
pip install Flask
pip install flask-cors
pip install mysql-connector-python

(Optional)

pip freeze > requirements.txt
MySQL Database Setup
Step 1: Create Database

Login to MySQL:

mysql -u root -p

Create database:

CREATE DATABASE student_management;
USE student_management;
Step 2: Create Students Table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    course VARCHAR(100) NOT NULL,
    marks INT NOT NULL,
    UNIQUE(email)
);

Key Notes:

AUTO_INCREMENT automatically generates ID

UNIQUE(email) prevents duplicate student emails

marks must be validated in backend

Project Structure
project-folder/
 ├── backend/
 │     ├── app.py
 │     ├── requirements.txt
 ├── frontend/
 │     ├── index.html
 │     ├── style.css
 │     └── script.js
 └── README.md

Frontend and backend are separated intentionally to reflect real-world deployment.

Backend Architecture
1. Initialize Flask
from flask import Flask
app = Flask(__name__)
2. Enable CORS
from flask_cors import CORS
CORS(app)
3. MySQL Connection Setup
import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="your_password",
        database="student_management"
    )
REST API Endpoints
Method	Endpoint	Description
GET	/students	Get all students
GET	/students/<id>	Get specific student
POST	/students	Create new student
PUT	/students/<id>	Update student
DELETE	/students/<id>	Delete student

Each endpoint corresponds directly to SQL operations.

API Workflow
GET /students

Connect to MySQL

Execute SELECT query

Fetch rows

Convert to JSON

Return 200 OK

GET /students/<id>

Extract ID from URL

Execute SELECT WHERE id=%s

If not found → 404

Return JSON

POST /students

Read JSON body

Validate:

All fields exist

Marks is integer

Marks between 0–100

Execute INSERT

Return 201 Created

Example:

{
  "name": "Rahul",
  "email": "rahul@test.com",
  "course": "Python",
  "marks": 85
}
PUT /students/<id>

Verify student exists

Validate input

Execute UPDATE query

Return success response

DELETE /students/<id>

Verify student exists

Execute DELETE

Return confirmation message

Data Validation Rules

Name:

Required

Non-empty string

Email:

Must contain "@"

Must be unique

Marks:

Integer

Range: 0 to 100

Cannot be negative

Validation is handled in backend before database insertion.

Error Handling Strategy

All errors return structured JSON.

Missing Fields

Status: 400 Bad Request

Student Not Found

Status: 404 Not Found

Database Failure

Status: 500 Internal Server Error

Example response:

{
  "success": false,
  "message": "Student not found"
}

Consistency is important for frontend integration.

Running the Application
Step 1: Start Backend

From backend folder:

python app.py

Backend runs on:

http://localhost:5000
Step 2: Start Frontend

Open index.html using Live Server or serve it via:

http://localhost:5500

Frontend communicates with backend using Fetch AP
