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
