document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const completedTasks = document.getElementById('completedTasks');
    const inProgressTasks = document.getElementById('inProgressTasks');
    const incompleteTasks = document.getElementById('incompleteTasks');
 
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
 
    let tasks = [];
    let isEditing = false;
    let editIndex = null;
    let taskToDelete = null;
 
    function showToast(message, type = 'default') {
       const toastContainer = document.querySelector('.toast-container');
       const toast = document.createElement('div');
       toast.className = `toast ${type}`;
       toast.textContent = message;
       toastContainer.appendChild(toast);
 
       setTimeout(() => {
          toast.classList.add('show');
       }, 100);
 
       setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
             toastContainer.removeChild(toast);
          }, 500);
       }, 3000);
    }
 
    function renderTasks() {
       completedTasks.innerHTML = '';
       inProgressTasks.innerHTML = '';
       incompleteTasks.innerHTML = '';
       tasks.forEach((task, index) => {
          const taskItem = document.createElement('li');
          taskItem.textContent = task.text;
 
          if (isEditing && index === editIndex) {
             taskItem.classList.add('editing');
          }
 
          const actions = document.createElement('div');
          actions.className = 'actions';
          const editButton = document.createElement('button');
          editButton.textContent = 'Edit';
          editButton.onclick = () => {
             taskInput.value = task.text;
             isEditing = true;
             editIndex = index;
             addButton.textContent = 'Save';
             renderTasks();
          };
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.className = 'delete';
          deleteButton.onclick = () => {
             taskToDelete = {
                task,
                index
             };
             confirmMessage.textContent = `Are you sure you want to delete the task "${task.text}"?`;
             confirmModal.style.display = 'flex';
          };
 
          const statusButton = document.createElement('button');
          statusButton.className = 'status';
          statusButton.textContent = getStatusButtonText(task.status);
          statusButton.onclick = () => {
             task.status = getNextStatus(task.status);
             renderTasks();
             saveTasks();
             showToast(`Task "${task.text}" marked as ${getStatusToastText(task.status)}`, 'status');
          };
          actions.appendChild(editButton);
          actions.appendChild(deleteButton);
          actions.appendChild(statusButton);
          taskItem.appendChild(actions);
 
          switch (task.status) {
             case 'completed':
                completedTasks.appendChild(taskItem);
                break;
             case 'inprogress':
                inProgressTasks.appendChild(taskItem);
                break;
             case 'incomplete':
                incompleteTasks.appendChild(taskItem);
                break;
             default:
                break;
          }
       });
    }
 
    confirmYes.addEventListener('click', () => {
       if (taskToDelete !== null) {
          const {
             task,
             index
          } = taskToDelete;
          tasks.splice(index, 1);
          renderTasks();
          saveTasks();
          showToast(`Task "${task.text}" deleted successfully`, 'delete');
          taskToDelete = null;
       }
       confirmModal.style.display = 'none';
    });
 
    confirmNo.addEventListener('click', () => {
       taskToDelete = null;
       confirmModal.style.display = 'none';
    });
 
    function getStatusButtonText(status) {
       switch (status) {
          case 'incomplete':
             return 'Mark as InProgress';
          case 'inprogress':
             return 'Mark as Complete';
          case 'completed':
             return 'Mark as Incomplete';
 
       }
    }
 
    function getNextStatus(status) {
       switch (status) {
          case 'incomplete':
             return 'inprogress';
          case 'inprogress':
             return 'completed';
          case 'completed':
             return 'incomplete';
          default:
             return 'incomplete';
       }
    }
 
    function getStatusToastText(status) {
       switch (status) {
          case 'incomplete':
             return 'Incomplete';
          case 'inprogress':
             return 'In Progress';
          case 'completed':
             return 'Complete';
          default:
             return 'Unknown';
       }
    }
 
    function addTask() {
       const taskValue = taskInput.value.trim();
       if (!taskValue) {
          showToast('Task cannot be empty.', 'error');
          return;
       }
       if (isEditing) {
          tasks[editIndex].text = taskValue;
          isEditing = false;
          editIndex = null;
          addButton.textContent = 'Add';
          showToast('Task updated successfully', 'edit');
       } else {
          if (tasks.some(task => task.text === taskValue)) {
             showToast('Task already exists.', 'error');
             return;
          }
          tasks.unshift({
             text: taskValue,
             status: 'incomplete'
          });
          showToast('Task added successfully', 'add');
       }
       taskInput.value = '';
       renderTasks();
       saveTasks();
    }
 
    addButton.addEventListener('click', addTask);
 
    taskInput.addEventListener('keydown', (event) => {
       if (event.key === 'Enter') {
          addTask();
       }
    });
 
    function saveTasks() {
       localStorage.setItem('tasks', JSON.stringify(tasks));
    }
 
    function loadTasks() {
       const savedTasks = localStorage.getItem('tasks');
       if (savedTasks) {
          tasks = JSON.parse(savedTasks);
       }
    }
    loadTasks();
    renderTasks();
 });