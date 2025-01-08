let todos = [];
let labels = [];

// Load todos and labels from localStorage when page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedTodos = localStorage.getItem('todos');
    const savedLabels = localStorage.getItem('labels');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }
    if (savedLabels) {
        labels = JSON.parse(savedLabels);
        renderLabels();
    }
    
    // Set min datetime to now for the deadline input
    const now = new Date();
    const nowFormatted = now.toISOString().slice(0, 16);
    document.getElementById('deadlineInput').min = nowFormatted;

    // Initialize the calendar
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        events: todos.map(todo => ({
            title: todo.text,
            start: todo.deadline,
            allDay: false
        }))
    });
});

// Add new todo
function addTodo() {
    const input = document.getElementById('todoInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const newLabelInput = document.getElementById('newLabelInput');
    const labelSelect = document.getElementById('labelSelect');
    const text = input.value.trim();
    let deadline = deadlineInput.value;
    let label = newLabelInput.value.trim() || labelSelect.value;

    if (text) {
        // If no deadline is specified, set it to 23:59 of today (in local time)
        if (!deadline) {
            const today = new Date();
            today.setHours(23, 59, 0, 0); // Set time to 23:59 in local time
            deadline = today.toISOString().slice(0, 19); // Get ISO format, but without milliseconds
        }

        const newTodo = {
            text: text,
            completed: false,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            deadline: new Date(deadline).toISOString(), // Save deadline in ISO format
            label: label
        };

        todos.push(newTodo);

        if (newLabelInput.value.trim() && !labels.includes(newLabelInput.value.trim())) {
            labels.push(newLabelInput.value.trim());
            saveLabels();
            renderLabels();
        }

        input.value = '';
        deadlineInput.value = '';
        newLabelInput.value = '';
        labelSelect.value = '';
        saveTodos();
        renderTodos();

        // Add the new todo to the calendar
        $('#calendar').fullCalendar('renderEvent', {
            title: newTodo.text,
            start: newTodo.deadline,
            allDay: false
        });
    } else {
        alert('Please enter a task');
    }
}

// Allow adding todo with Enter key
document.getElementById('todoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    // Re-render the calendar events
    $('#calendar').fullCalendar('removeEvents');
    $('#calendar').fullCalendar('addEventSource', todos.map(todo => ({
        title: todo.text,
        start: todo.deadline,
        allDay: false
    })));
}

// Toggle todo completion
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
    // Re-render the calendar events
    $('#calendar').fullCalendar('removeEvents');
    $('#calendar').fullCalendar('addEventSource', todos.map(todo => ({
        title: todo.text,
        start: todo.deadline,
        allDay: false
    })));
}

// Edit todo
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    const newText = prompt('Edit task:', todo.text);
    
    if (newText !== null && newText.trim() !== '') {
        todos = todos.map(t => {
            if (t.id === id) {
                return { ...t, text: newText.trim() };
            }
            return t;
        });
        saveTodos();
        renderTodos();
        // Re-render the calendar events
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', todos.map(todo => ({
            title: todo.text,
            start: todo.deadline,
            allDay: false
        })));
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Save labels to localStorage
function saveLabels() {
    localStorage.setItem('labels', JSON.stringify(labels));
}

// Filter todos
function filterTodos() {
    renderTodos();
}

// Get priority class based on deadline
function getPriorityClass(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilDeadline < 0) return 'overdue';
    if (hoursUntilDeadline < 24) return 'urgent';
    if (hoursUntilDeadline < 72) return 'upcoming';
    return 'relaxed';
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString(undefined, options);
}

// Render labels in the select dropdown
function renderLabels() {
    const labelSelect = document.getElementById('labelSelect');
    labelSelect.innerHTML = '<option value="">Select label</option>';
    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        labelSelect.appendChild(option);
    });
}

// Render todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const filterStatus = document.getElementById('filterStatus').value;
    todoList.innerHTML = '';
    
    // Sort todos by deadline
    const sortedTodos = [...todos].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    sortedTodos.forEach(todo => {
        const now = new Date();
        const deadlineDate = new Date(todo.deadline);
        const isOverdue = deadlineDate < now && !todo.completed;
        
        // Apply filters
        if (filterStatus === 'completed' && !todo.completed) return;
        if (filterStatus === 'pending' && todo.completed) return;
        if (filterStatus === 'overdue' && !isOverdue) return;
        
        const li = document.createElement('li');
        li.className = getPriorityClass(todo.deadline);
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.onclick = () => toggleTodo(todo.id);
        
        // Todo content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'todo-content';
        
        // Text content
        const textSpan = document.createElement('div');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;
        if (todo.completed) {
            textSpan.classList.add('completed');
        }
        textSpan.ondblclick = () => editTodo(todo.id);
        
        // Deadline display
        const deadlineSpan = document.createElement('div');
        deadlineSpan.className = 'todo-deadline';
        deadlineSpan.textContent = `Due: ${formatDate(todo.deadline)}`;
        if (isOverdue) {
            deadlineSpan.classList.add('overdue');
        }

        // Label display
        const labelSpan = document.createElement('div');
        labelSpan.className = 'todo-label';
        labelSpan.textContent = `Label: ${todo.label}`;
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteTodo(todo.id);
        
        // Append elements
        contentDiv.appendChild(textSpan);
        contentDiv.appendChild(deadlineSpan);
        contentDiv.appendChild(labelSpan);
        li.appendChild(checkbox);
        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}
