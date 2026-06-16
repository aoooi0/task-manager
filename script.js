// タスク管理クラス
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSort = 'date-added';
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.render();
    }

    cacheDOMElements() {
        // 入力要素
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.dueDateInput = document.getElementById('dueDateInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');

        // フィルター・ソート
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');

        // タスクリスト
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');

        // 統計
        this.totalTasksEl = document.getElementById('totalTasks');
        this.activeTasksEl = document.getElementById('activeTasks');
        this.completedTasksEl = document.getElementById('completedTasks');

        // アクション
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');

        // モーダル
        this.editModal = document.getElementById('editModal');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.editPrioritySelect = document.getElementById('editPrioritySelect');
        this.editDueDateInput = document.getElementById('editDueDateInput');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.closeModalBtn = document.querySelector('.close');
    }

    attachEventListeners() {
        // タスク追加
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // フィルター
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // ソート
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // アクション
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        // モーダル
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // モーダル外クリックで閉じる
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeModal();
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            alert('タスク名を入力してください');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            priority: this.prioritySelect.value,
            dueDate: this.dueDateInput.value || null,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();

        // 入力フィールドをクリア
        this.taskInput.value = '';
        this.dueDateInput.value = '';
        this.prioritySelect.value = 'medium';
        this.taskInput.focus();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        if (confirm('このタスクを削除しますか？')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    openEditModal(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingTaskId = id;
        this.editTaskInput.value = task.text;
        this.editPrioritySelect.value = task.priority;
        this.editDueDateInput.value = task.dueDate || '';
        this.editModal.classList.add('show');
    }

    closeModal() {
        this.editModal.classList.remove('show');
        this.editingTaskId = null;
    }

    saveEdit() {
        const text = this.editTaskInput.value.trim();
        if (!text) {
            alert('タスク名を入力してください');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = text;
            task.priority = this.editPrioritySelect.value;
            task.dueDate = this.editDueDateInput.value || null;
            this.saveTasks();
            this.render();
            this.closeModal();
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('完了済みのタスクがありません');
            return;
        }

        if (confirm(`${completedCount}件の完了済みタスクを削除しますか？`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    clearAll() {
        if (this.tasks.length === 0) {
            alert('タスクがありません');
            return;
        }

        if (confirm('すべてのタスクを削除しますか？この操作は取り消せません。')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
        }
    }

    getFilteredTasks() {
        let filtered = [...this.tasks];

        // フィルター適用
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
        }

        // ソート適用
        switch (this.currentSort) {
            case 'date-added':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'due-date':
                filtered.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
        }

        return filtered;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();

        // タスクリストの表示
        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.taskList.style.display = 'block';
            this.emptyState.style.display = 'none';
            this.taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        }

        // 統計の更新
        this.updateStats();

        // イベントリスナーの再アタッチ
        this.attachTaskEventListeners();
    }

    createTaskHTML(task) {
        const priorityLabels = {
            high: '高',
            medium: '中',
            low: '低'
        };

        let dueDateHTML = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isOverdue = dueDate < today && !task.completed;
            
            const formattedDate = dueDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            dueDateHTML = `<span class="due-date ${isOverdue ? 'overdue' : ''}">📅 ${formattedDate}</span>`;
        }

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-text">${this.escapeHTML(task.text)}</div>
                    <div class="task-meta">
                        <span class="priority-badge priority-${task.priority}">
                            ${priorityLabels[task.priority]}
                        </span>
                        ${dueDateHTML}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" title="編集">✏️</button>
                    <button class="task-btn delete-btn" title="削除">🗑️</button>
                </div>
            </li>
        `;
    }

    attachTaskEventListeners() {
        // チェックボックス
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.toggleTask(taskId);
            });
        });

        // 編集ボタン
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.openEditModal(taskId);
            });
        });

        // 削除ボタン
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.deleteTask(taskId);
            });
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const active = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;

        this.totalTasksEl.textContent = total;
        this.activeTasksEl.textContent = active;
        this.completedTasksEl.textContent = completed;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});