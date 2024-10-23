let todos = [];

// Load todos from localStorage when page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }
    
    // Set min datetime to now for the deadline input
    const now = new Date();
    const nowFormatted = now.toISOString().slice(0, 16);
    document.getElementById('deadlineInput').min = nowFormatted;
});

// Add new todo
function addTodo() {
    const input = document.getElementById('todoInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const text = input.value.trim();
    const deadline = deadlineInput.value;
    
    if (text && deadline) {
        todos.push({
            text: text,
            completed: false,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            deadline: new Date(deadline).toISOString()
        });
        input.value = '';
        deadlineInput.value = '';
        saveTodos();
        renderTodos();
    } else {
        alert('Please enter both task and deadline');
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
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
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
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteTodo(todo.id);
        
        // Append elements
        contentDiv.appendChild(textSpan);
        contentDiv.appendChild(deadlineSpan);
        li.appendChild(checkbox);
        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}
