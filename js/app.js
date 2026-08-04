// G-Flow Core Application Entry & Orchestrator
import { Store } from './store.js';
import { DashboardView } from './views/dashboard.js';
import { KanbanView } from './views/kanban.js';
import { MyTasksView } from './views/mytasks.js';
import { ReportsView } from './views/reports.js';
import { UsersView } from './views/users.js';
import { TaskDetailView } from './views/taskDetail.js';
import { TaskFormView } from './views/taskForm.js';
import { SettingsView } from './views/settings.js';

// DOM Cache
const mainViewContainer = document.getElementById('main-view-container');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const navItems = document.querySelectorAll('.nav-item');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserRole = document.getElementById('sidebar-user-role');
const roleSelector = document.getElementById('role-selector');
const btnCreateTaskTrigger = document.getElementById('btn-create-task-trigger');
const notificationTrigger = document.getElementById('notification-trigger');
const notificationCount = document.getElementById('notification-count');
const notificationsDropdown = document.getElementById('notifications-dropdown');
const notificationsList = document.getElementById('notifications-list');
const btnClearNotifications = document.getElementById('btn-clear-notifications');

const taskDetailModal = document.getElementById('task-detail-modal');
const taskFormModal = document.getElementById('task-form-modal');

// Views mapping
const VIEWS = {
    dashboard: {
        title: 'Dashboard',
        subtitle: 'ภาพรวมสถานะงานและการส่งมอบของทีมดีไซเนอร์',
        component: DashboardView
    },
    kanban: {
        title: 'Kanban Board',
        subtitle: 'จัดการขั้นตอนการทำงานดีไซน์และติดตามความคืบหน้า',
        component: KanbanView
    },
    mytasks: {
        title: 'My Tasks',
        subtitle: 'ตรวจสอบรายการงานและคิวงานดีไซน์ของคุณ',
        component: MyTasksView
    },
    reports: {
        title: 'Reports & Summary',
        subtitle: 'รายงานสถิติตัวชี้วัดและภาพรวมผลงานของดีไซเนอร์',
        component: ReportsView
    },
    users: {
        title: 'Team Management',
        subtitle: 'จัดการสิทธิ์ บัญชีผู้ใช้ และตำแหน่งงานของสมาชิกในทีม',
        component: UsersView
    },
    settings: {
        title: 'Sync Settings',
        subtitle: 'ตั้งค่าการเชื่อมต่อฐานข้อมูล Google Sheets และการสำรองข้อมูล',
        component: SettingsView
    }
};

let currentViewName = 'dashboard';

// Initialize App
function initApp() {
    // Setup toast container
    setupToastContainer();

    // Render dynamic role selector options
    renderRoleSelector();

    // Auto-sync pull on app startup if Sheets URL is configured
    if (Store.getSheetsUrl()) {
        Store.fetchFromSheets().catch(err => console.error("Initial background sync failed:", err));
    }

    // Bind Global Custom Events
    window.addEventListener('open-task-details', (e) => {
        const { taskId, forceSubmit, forceReview } = e.detail;
        const modalContainer = taskDetailModal.querySelector('.modal-container');
        modalContainer.innerHTML = TaskDetailView.render(taskId, { forceSubmit, forceReview });
        taskDetailModal.classList.remove('hidden');
        TaskDetailView.init(taskId, { forceSubmit, forceReview });
    });

    window.addEventListener('open-task-form', (e) => {
        const taskId = e.detail?.taskId || null;
        const modalContainer = taskFormModal.querySelector('.modal-container');
        modalContainer.innerHTML = TaskFormView.render(taskId);
        taskFormModal.classList.remove('hidden');
        TaskFormView.init();
    });

    // Create Task Trigger
    if (btnCreateTaskTrigger) {
        btnCreateTaskTrigger.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-task-form'));
        });
    }

    // Role switcher dropdown
    if (roleSelector) {
        roleSelector.addEventListener('change', (e) => {
            const nextUserId = e.target.value;
            Store.setCurrentUser(nextUserId);
            Store.publish('toastTriggered', { type: 'info', message: `สลับสิทธิ์การใช้งานเป็น: ${Store.getUserById(nextUserId).name}` });
        });
    }

    // Sidebar navigation clicks
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-view');
            if (viewName && VIEWS[viewName]) {
                switchView(viewName);
            }
        });
    });

    // Notifications Dropdown toggle
    if (notificationTrigger) {
        notificationTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('hidden');
            // Mark as read when opened
            const activeUser = Store.getCurrentUser();
            Store.markNotificationsAsRead(activeUser.id);
        });
    }

    // Clear notifications click
    if (btnClearNotifications) {
        btnClearNotifications.addEventListener('click', (e) => {
            e.stopPropagation();
            const activeUser = Store.getCurrentUser();
            Store.clearNotifications(activeUser.id);
        });
    }

    // Close notifications dropdown when clicking anywhere else
    document.addEventListener('click', () => {
        if (notificationsDropdown && !notificationsDropdown.classList.contains('hidden')) {
            notificationsDropdown.classList.add('hidden');
        }
    });

    // Subscribe to Store updates
    Store.subscribe('tasksChanged', () => {
        // Refresh current active view
        switchView(currentViewName);
        // Refresh notifications
        updateNotificationsUI(Store.getCurrentUser().id);
    });

    Store.subscribe('viewChanged', (viewName) => {
        switchView(viewName);
    });

    Store.subscribe('userSessionChanged', (user) => {
        if (!user) return;
        updateSidebarUserUI(user);
        applyAccessControl(user);
        
        if (roleSelector) {
            roleSelector.value = user.id;
        }
        
        // Default views if they swap to designer (designers don't see management)
        if (user.role === 'designer' && currentViewName === 'users') {
            switchView('mytasks');
        } else {
            switchView(currentViewName);
        }
        updateNotificationsUI(user.id);
    });

    Store.subscribe('usersChanged', () => {
        renderRoleSelector();
    });

    Store.subscribe('toastTriggered', (toast) => {
        showToast(toast.message, toast.type);
    });

    Store.subscribe('notificationsChanged', (notifs) => {
        renderNotificationsList(notifs);
    });

    // Initial render setup
    updateSidebarUserUI(currentUser);
    applyAccessControl(currentUser);
    updateNotificationsUI(currentUser.id);
    switchView(currentViewName);
}

// Swaps the primary viewport view
function switchView(viewName) {
    if (!VIEWS[viewName]) return;
    currentViewName = viewName;
    const viewMeta = VIEWS[viewName];

    // Update active classes in sidebar
    navItems.forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Set page header content
    if (pageTitle) pageTitle.textContent = viewMeta.title;
    if (pageSubtitle) pageSubtitle.textContent = viewMeta.subtitle;

    // Render component view template
    if (mainViewContainer) {
        mainViewContainer.innerHTML = viewMeta.component.render();
        viewMeta.component.init();
    }
}

// User Profile Sidebar update
function updateSidebarUserUI(user) {
    if (sidebarUserAvatar) {
        sidebarUserAvatar.textContent = user.avatar || '?';
        // Give background color based on role
        if (user.role === 'admin') {
            sidebarUserAvatar.style.background = 'linear-gradient(135deg, #ef4444, #f97316)';
        } else if (user.role === 'manager') {
            sidebarUserAvatar.style.background = 'linear-gradient(135deg, #8b5cf6, #3b82f6)';
        } else {
            sidebarUserAvatar.style.background = 'linear-gradient(135deg, #3b82f6, #10b981)';
        }
    }
    if (sidebarUserName) sidebarUserName.textContent = user.name;
    if (sidebarUserRole) {
        const roleMapping = {
            admin: 'ผู้ดูแลระบบ',
            manager: 'หัวหน้างาน (Manager)',
            designer: 'ดีไซเนอร์ (Designer)'
        };
        sidebarUserRole.textContent = roleMapping[user.role] || user.role;
    }
}

// Apply role-based visibility modifiers
function applyAccessControl(user) {
    // 1. Manage team tab only for admin
    const adminTab = document.querySelector('.admin-only');
    if (adminTab) {
        if (user.role === 'admin') {
            adminTab.style.display = 'flex';
        } else {
            adminTab.style.display = 'none';
        }
    }

    // 2. Create Task button visibility
    if (btnCreateTaskTrigger) {
        if (user.role === 'designer') {
            btnCreateTaskTrigger.style.display = 'none';
        } else {
            btnCreateTaskTrigger.style.display = 'inline-flex';
        }
    }
}

// Render dynamic role switcher options based on current users database
function renderRoleSelector() {
    if (!roleSelector) return;
    const users = Store.getUsers();
    const currentUser = Store.getCurrentUser();
    
    roleSelector.innerHTML = users.map(user => {
        let roleLabel = '';
        if (user.role === 'manager') roleLabel = 'หัวหน้างาน: ';
        else if (user.role === 'designer') roleLabel = 'ดีไซเนอร์: ';
        else if (user.role === 'admin') roleLabel = 'ผู้ดูแลระบบ: ';
        else roleLabel = '';
        
        return `<option value="${user.id}" ${user.id === currentUser.id ? 'selected' : ''}>${roleLabel}${user.name}</option>`;
    }).join('');
}

// Notifications badge count & list updates
function updateNotificationsUI(userId) {
    const list = Store.getNotifications(userId);
    renderNotificationsList(list);
}

// Notifications badge count & list updates
function renderNotificationsList(notificationsListArray) {
    const unreadCount = notificationsListArray.filter(n => !n.is_read).length;
    if (notificationCount) {
        notificationCount.textContent = unreadCount;
        notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    if (notificationsList) {
        if (notificationsListArray.length === 0) {
            notificationsList.innerHTML = `<div class="empty-state">ไม่มีการแจ้งเตือนใหม่</div>`;
        } else {
            notificationsList.innerHTML = notificationsListArray.map(n => `
                <div class="notification-item ${n.is_read ? '' : 'unread'}" data-task-id="${n.task_id}">
                    <p>${n.message}</p>
                    <span class="notification-time">${new Date(n.created_at).toLocaleTimeString('th-TH', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
            `).join('');

            // Bind click to notifications
            const items = notificationsList.querySelectorAll('.notification-item');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    const taskId = item.getAttribute('data-task-id');
                    if (taskId) {
                        window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId } }));
                    }
                });
            });
        }
    }
}

// Custom Toast Alerts manager
function setupToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Choose symbol
    let icon = '🔔';
    if (type === 'success') icon = '✓';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'danger') icon = '❌';

    toast.innerHTML = `
        <span style="font-weight: bold; font-size:16px;">${icon}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Document Load start app
document.addEventListener('DOMContentLoaded', initApp);
