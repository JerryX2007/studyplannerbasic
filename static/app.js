document.getElementById('start-btn').addEventListener('click', function() {
    alert('Welcome to Study Planner! Let\'s start organizing your studies.');
});
/*
document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('task-input').value;
    const course = document.getElementById('task-course').value;
    const date = document.getElementById('task-date').value;
    if (name && course && date) {
        const taskList = document.getElementById('task-list');
        const taskItem = document.createElement('li');

        const taskText = document.createElement('span');
        taskText.textContent = `${name} - ${course} (Due: ${date})`;
        
        const completeBtn = document.createElement('button');
        completeBtn.textContent = 'Complete';

        completeBtn.addEventListener('click', function() {
            taskItem.classList.toggle('completed');
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';

        deleteBtn.addEventListener('click', function() {
            taskItem.remove();
        });

        taskItem.appendChild(taskText);
        taskItem.appendChild(completeBtn);
        taskItem.appendChild(deleteBtn);

        taskList.appendChild(taskItem);

        document.getElementById('task-input').value = '';
        document.getElementById('task-course').value = '';
        document.getElementById('task-date').value = '';
    } else {
        alert('Please fill in all required fields to add a task.');
    }
});
*/
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');

function createTaskElement(task) {
    const taskItem = document.createElement('li');

    if (task.completed) {
        taskItem.classList.add('completed');
    }

    const taskText = document.createElement('span');
    taskText.textContent = `${task.name} - ${task.course} (Due: ${task.due_date})`;

    const completeBtn = document.createElement('button');
    completeBtn.textContent = task.completed ? 'Undo' : 'Complete';

    completeBtn.addEventListener('click', async function() {
        const response = await fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !task.completed })
        });
        
        if (!response.ok) {
            alert('Could not update task.');
            return;
        }

        const updatedTask = await response.json();
        task.completed = updatedTask.completed;

        taskItem.classList.toggle('completed', !!updatedTask.completed);
        completeBtn.textContent = updatedTask.completed ? 'Undo' : 'Complete';
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';

    deleteBtn.addEventListener('click', async function() {
        const response = await fetch(`/api/tasks/${task.id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            alert('Could not delete task.');
            return;
        }

        taskItem.remove();
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';

    editBtn.addEventListener('click', async function() {
        const newName = prompt('Edit task name:', task.name);
        const newCourse = prompt('Edit course name:', task.course);
        const newDate = prompt('Edit due date (YYYY-MM-DD):', task.due_date);
        if (newName && newCourse && newDate) {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName, course: newCourse, due_date: newDate })
            });
            
            if (!response.ok) {
                alert('Could not update task.');
                return;
            }
            task.name = newName;
            task.course = newCourse;
            task.due_date = newDate;
            taskText.textContent = `${task.name} - ${task.course} (Due: ${task.due_date})`;
        } else {
            alert('All fields are required to edit the task.');
            return;
        }
    });

    taskItem.appendChild(taskText);
    taskItem.appendChild(completeBtn);
    taskItem.appendChild(deleteBtn);
    taskItem.appendChild(editBtn);
    taskList.appendChild(taskItem);
}

async function loadTasks() {
    taskList.innerHTML = '';

    const response = await fetch('/api/tasks');
    if (!response.ok) {
        alert('Could not load tasks.');
        return;
    }

    const tasks = await response.json();
    tasks.forEach(createTaskElement);
}

taskForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('task-input').value;
    const course = document.getElementById('task-course').value;
    const date = document.getElementById('task-date').value;

    if (!name || !course || !date) {
        alert('Please fill in all required fields to add a task.');
        return;
    }

    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, course, due_date: date })
    });

    if (!response.ok) {
        alert('Could not add task.');
        return;
    }

    const newTask = await response.json();
    createTaskElement(newTask);

    taskForm.reset();
});

loadTasks();