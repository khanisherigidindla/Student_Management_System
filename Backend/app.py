from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from db import DB_config

app = Flask(__name__)
CORS(app)

def get_connection():
    return mysql.connector.connect(**DB_config)

def init_db():
    temp_config = DB_config.copy()
    temp_config.pop("database")
    conn = mysql.connector.connect(**temp_config)
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS " + DB_config["database"])
    cursor.close()
    conn.close()
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            Id INT NOT NULL AUTO_INCREMENT,
            Name VARCHAR(100) NOT NULL,
            Email VARCHAR(100) NOT NULL,
            Course VARCHAR(100) NOT NULL,
            Year INT NOT NULL,
            Percentage INT NOT NULL,
            PRIMARY KEY (Id)
        )
    """)
    conn.commit()
    
    cursor.execute("SELECT MAX(Id) FROM students")
    max_id_result = cursor.fetchone()
    max_id = max_id_result[0] if max_id_result[0] is not None else 0
    next_auto_increment = max_id + 1
    cursor.execute(f"ALTER TABLE students AUTO_INCREMENT = {next_auto_increment}")
    conn.commit()
    
    cursor.close()
    conn.close()

# Get all students
@app.route("/students", methods=["GET"])
def get_all_students():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()
    cursor.close()
    conn.close()
    response = jsonify(students)
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response, 200

# Get student by ID
@app.route("/students/<int:id>", methods=["GET"])
def get_student_by_id(id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM students WHERE Id = " + str(id))
    student = cursor.fetchone()
    cursor.close()
    conn.close()
    if student:
        return jsonify(student), 200
    else:
        return jsonify({"error": "Student not found"}), 404

# Add new student
@app.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()
    name = data["name"]
    email = data["email"]
    course = data["course"]
    year = data["year"]
    percentage = data["percentage"]
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO students (Name, Email, Course, Year, Percentage) VALUES ('" + name + "', '" + email + "', '" + course + "', " + str(year) + ", " + str(percentage) + ")")
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Student added successfully"}), 201

# Update student by ID
@app.route("/students/<int:id>", methods=["PUT"])
def update_student(id):
    data = request.get_json()
    name = data["name"]
    email = data["email"]
    course = data["course"]
    year = data["year"]
    percentage = data["percentage"]
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE students SET Name = '" + name + "', Email = '" + email + "', Course = '" + course + "', Year = " + str(year) + ", Percentage = " + str(percentage) + " WHERE Id = " + str(id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Student updated successfully"}), 200

# Delete student by ID
@app.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE Id = " + str(id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Student deleted successfully"}), 200

# Search student by name or email (for update/delete)
@app.route("/students/search", methods=["GET"])
def search_student():
    query = request.args.get("q", "")
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM students WHERE Name LIKE '%" + query + "%' OR Email LIKE '%" + query + "%'")
    students = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(students), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=8080)
