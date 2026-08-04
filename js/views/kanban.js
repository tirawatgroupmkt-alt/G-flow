// G-Flow Kanban Board View Component
import { Store } from '../store.js';

const COLUMNS = [
    { id: 'New Brief', title: 'บรีฟใหม่', class: 'col-new' },
    { id: 'Waiting Info', title: 'รอข้อมูล', class: 'col-waiting' },
    { id: 'In Design', title: 'กำลังออกแบบ', class: 'col-indesign' },
    { id: 'Review', title: 'รอตรวจทาน', class: 'col-review' },
    { id: 'Revision', title: 'ส่งกลับแก้ไข', class: 'col-revision' },
    { id: 'Approved', title: 'อนุมัติแล้ว', class: 'col-approved' },
    { id: 'Done', title: 'ส่งมอบเรียบร้อย', class: 'col-done' }
];

export const KanbanView = {
    render() {
        const currentUser = Store.getCurrentUser();
        let tasks = Store.getTasks();
        const users = Store.getUsers();

        // If active user is a designer, only show their tasks
        if (currentUser.role === 'designer') {
            tasks = tasks.filter(t => t.assigned_to === currentUser.id);
        }

        // Exclude cancelled tasks from the Kanban board
        tasks = tasks.filter(t => t.status !== 'Cancelled');

        return `
            <div class="kanban-view-container animate-slide-in">
                <!-- Info Header -->
                <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <p class="text-secondary" style="font-size: 13px;">
                        ${currentUser.role === 'designer' 
                            ? `กำลังแสดงงานดีไซน์ที่มอบหมายให้ <strong>${currentUser.name}</strong> ลากการ์ดเพื่อย้ายขั้นตอนการทำงาน` 
                            : 'กำลังแสดงงานทั้งหมดของทีมกราฟิก ลากการ์ดเพื่อเปลี่ยนสถานะงาน'}
                    </p>
                    <div style="display: flex; gap: 8px; font-size: 11px;">
                        <span style="display: flex; align-items: center; gap: 4px;"><span class="column-dot" style="background-color: var(--color-priority-low); width: 8px; height: 8px;"></span> ต่ำ</span>
                        <span style="display: flex; align-items: center; gap: 4px;"><span class="column-dot" style="background-color: var(--color-priority-medium); width: 8px; height: 8px;"></span> ปานกลาง</span>
                        <span style="display: flex; align-items: center; gap: 4px;"><span class="column-dot" style="background-color: var(--color-priority-high); width: 8px; height: 8px;"></span> ด่วน</span>
                        <span style="display: flex; align-items: center; gap: 4px;"><span class="column-dot" style="background-color: var(--color-priority-urgent); width: 8px; height: 8px;"></span> ด่วนที่สุด</span>
                    </div>
                </div>

                <!-- Kanban Lanes -->
                <div class="kanban-board-wrapper">
                    ${COLUMNS.map(col => {
                        const colTasks = tasks.filter(t => t.status === col.id);
                        return `
                            <div class="kanban-column ${col.class}" data-status="${col.id}">
                                <div class="column-header">
                                    <div class="column-title">
                                        <span class="column-dot"></span>
                                        <span>${col.title}</span>
                                    </div>
                                    <span class="column-count">${colTasks.length}</span>
                                </div>
                                <div class="column-cards-container">
                                    ${colTasks.map(task => {
                                        const now = new Date();
                                        const due = new Date(task.due_date);
                                        const diffTime = due - now;
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        const statusClass = task.status.toLowerCase().replace(' ', '');
                                        
                                        let deadlineClass = '';
                                        if (task.status !== 'Done' && task.status !== 'Approved') {
                                            if (diffDays < 0) deadlineClass = 'is-overdue';
                                            else if (diffDays <= 2) deadlineClass = 'near-deadline';
                                        }

                                        const assignee = users.find(u => u.id === task.assigned_to) || { name: 'ยังไม่มอบหมาย', avatar: '?' };
                                        const commentsCount = Store.getComments(task.task_id).length;

                                        return `
                                            <div class="kanban-card glass-card" 
                                                 draggable="true" 
                                                 data-id="${task.task_id}"
                                                 style="padding-left: 20px; overflow: hidden; position: relative;">
                                                <!-- Top Status Color Strip -->
                                                <div class="card-status-strip ${statusClass}"></div>
                                                
                                                <div class="card-priority-indicator ${task.priority}"></div>
                                                <div class="card-header-info" style="margin-top: 4px;">
                                                     <span class="card-id">${task.task_id}</span>
                                                     <div style="display: flex; gap: 4px; align-items: center;">
                                                         ${task.brand ? `<span class="tag tag-brand-${task.brand.toLowerCase()}">${task.brand}</span>` : ''}
                                                         <span class="tag tag-platform">${task.platform}</span>
                                                     </div>
                                                 </div>
                                                <div class="card-title-text" style="font-size: 13px; font-weight:700;">${task.task_name}</div>
                                                <div class="card-badges">
                                                    ${task.revision_round > 0 ? `<span class="tag" style="background: rgba(239,68,68,0.1); color: #fca5a5;">แก้ไข: ${task.revision_round} รอบ</span>` : ''}
                                                    ${commentsCount > 0 ? `<span class="tag" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); display: inline-flex; align-items: center; gap: 2px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${commentsCount}</span>` : ''}
                                                </div>
                                                <div class="card-footer">
                                                    <span class="card-deadline ${deadlineClass}">
                                                        📅 ${diffDays < 0 && (task.status !== 'Done' && task.status !== 'Approved')
                                                            ? 'เกินกำหนด' 
                                                            : due.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    ${currentUser.role !== 'designer' 
                                                        ? `<div class="card-avatar" title="${assignee.name}" style="background: var(--primary-grad); width:20px; height:20px; font-size:9px;">${assignee.avatar}</div>`
                                                        : ''
                                                    }
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    init() {
        const cards = document.querySelectorAll('.kanban-card');
        const columns = document.querySelectorAll('.kanban-column');
        const currentUser = Store.getCurrentUser();

        cards.forEach(card => {
            // Drag Start
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
                card.style.opacity = '0.5';
            });

            // Drag End
            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
            });

            // Double Click to open detail
            card.addEventListener('dblclick', () => {
                const taskId = card.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId } }));
            });

            // Single click touch screen helper
            card.addEventListener('click', () => {
                const taskId = card.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId } }));
            });
        });

        columns.forEach(col => {
            // Drag Over
            col.addEventListener('dragover', (e) => {
                e.preventDefault();
                col.classList.add('drag-over');
            });

            // Drag Leave
            col.addEventListener('dragleave', () => {
                col.classList.remove('drag-over');
            });

            // Drop Card
            col.addEventListener('drop', (e) => {
                e.preventDefault();
                col.classList.remove('drag-over');
                
                const taskId = e.dataTransfer.getData('text/plain');
                const targetStatus = col.getAttribute('data-status');
                
                const task = Store.getTaskById(taskId);
                if (!task) return;

                if (task.status === targetStatus) return;

                // Role validation
                // Designers cannot approve tasks or complete them without review
                if (currentUser.role === 'designer') {
                    if (targetStatus === 'Approved' || targetStatus === 'Done') {
                        Store.publish('toastTriggered', { 
                            type: 'danger', 
                            message: 'สิทธิ์การอนุมัติงานเป็นของหัวหน้างานเท่านั้น กรุณาลากไปที่ Review เพื่อส่งตรวจ' 
                        });
                        return;
                    }
                }

                // If dropping into Done or Approved, and missing final file link, open details instead to force link
                if ((targetStatus === 'Done' || targetStatus === 'Approved') && !task.final_file_url) {
                    Store.publish('toastTriggered', { 
                        type: 'warning', 
                        message: 'กรุณากรอกลิงก์ไฟล์ส่งงาน (Final File Link) ก่อนปิดงาน' 
                    });
                    window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId, forceSubmit: true } }));
                    return;
                }

                // If dropping into Waiting Info, prompt user
                // Update status in store
                task.status = targetStatus;
                
                // If moving to Done, set completed date
                if (targetStatus === 'Done') {
                    task.completed_date = new Date().toISOString();
                }

                Store.saveTask(task);
                
                Store.publish('toastTriggered', { 
                    type: 'success', 
                    message: `ย้ายงาน ${taskId} ไปที่ "${targetStatus}" เรียบร้อย` 
                });

                // Refresh view
                Store.publish('viewChanged', 'kanban');
            });
        });
    }
};
