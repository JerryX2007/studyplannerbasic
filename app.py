import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
DATABASE = "study_planner.db"

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            course TEXT NOT NULL,
            due_date TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.route("/")
def home():
    return render_template("index.html")

@app.get("/api/tasks")
def get_tasks():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, name, course, due_date, completed FROM tasks ORDER BY due_date"
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows]);

@app.post("/api/tasks")
def create_task():
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    course = data.get("course", "").strip()
    due_date = data.get("due_date", "").strip()

    if not name or not course or not due_date:
        return jsonify({"error": "All fields are required."}), 400
    
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO tasks (name, course, due_date, completed) VALUES (?, ?, ?, 0)",
        (name, course, due_date)
    )
    task_id = cursor.lastrowid
    conn.commit()

    row = conn.execute(
        "SELECT id, name, course, due_date, completed FROM tasks WHERE id = ?",
        (task_id,)
    ).fetchone()
    conn.close()
    
    return jsonify(dict(row)), 201

"""
@app.patch("/api/tasks/<int:task_id>")
def update_task(task_id):
    data = request.get_json() or {}
    completed = 1 if data.get("completed") else 0
    
    conn = get_db()
    conn.execute(
        "UPDATE tasks SET completed = ? WHERE id = ?",
        (completed, task_id)
    )
    conn.commit()

    row = conn.execute(
        "SELECT id, name, course, due_date, completed FROM tasks WHERE id = ?",
        (task_id,)
    ).fetchone()
    conn.close()

    if row is None:
        return jsonify({"error": "Task not found."}), 404
    
    return jsonify(dict(row))
"""

@app.patch("/api/tasks/<int:task_id>")
def update_task(task_id):
    data = request.get_json() or {}

    conn = get_db()
    
    row = conn.execute(
        "SELECT id, name, course, due_date, completed FROM tasks WHERE id = ?",
        (task_id,)
    ).fetchone()
    
    if row is None:
        conn.close()
        return jsonify({"error": "Task not found."}), 404
    
    current = dict(row)
    name = data.get("name", current["name"]).strip()
    course = data.get("course", current["course"]).strip()
    due_date = data.get("due_date", current["due_date"]).strip()
    
    if "completed" in data:
        completed = 1 if data["completed"] else 0
    else:
        completed = current["completed"]
    
    if not name or not course or not due_date:
        conn.close()
        return jsonify({"error": "All fields are required."}), 400

    conn.execute(
        "UPDATE tasks SET name = ?, course = ?, due_date = ?, completed = ? WHERE id = ?",
        (name, course, due_date, completed, task_id)
    )
    conn.commit()
    updated = conn.execute(
        "SELECT id, name, course, due_date, completed FROM tasks WHERE id = ?",
        (task_id,)
    ).fetchone()
    conn.close()
    return jsonify(dict(updated))


    

@app.delete("/api/tasks/<int:task_id>")
def delete_task(task_id):
    conn = get_db()
    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()

    return "", 204

if __name__ == "__main__":
    app.run(debug=True)