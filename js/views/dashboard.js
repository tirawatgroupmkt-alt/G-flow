// G-Flow Dashboard View Component
import { Store } from '../store.js';

let filterState = {
    designer: '',
    priority: '',
    platform: '',
    status: '',
    due: ''
};

export const DashboardView = {
    render() {
        const currentUser = Store.getCurrentUser();
        const tasks = Store.getTasks();
        const users = Store.getUsers();
        
        // Filter tasks based on current filterState
        const filteredTasks = tasks.filter(task => {
            if (filterState.designer && task.assigned_to !== filterState.designer) return false;
            if (filterState.priority && task.priority !== filterState.priority) return false;
            if (filterState.platform && task.platform !== filterState.platform) return false;
            if (filterState.status && task.status !== filterState.status) return false;
            
            if (filterState.due) {
                const now = new Date();
                const due = new Date(task.due_date);
                const diffTime = due - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (filterState.due === 'overdue' && (task.status !== 'Done' && task.status !== 'Approved' && diffDays < 0)) {
                    return true;
                }
                if (filterState.due === 'today' && diffDays === 0) {
                    return true;
                }
                if (filterState.due === 'week' && diffDays > 0 && diffDays <= 7) {
                    return true;
                }
                return false;
            }
            return true;
        });

        // Compute metrics
        const total = filteredTasks.length;
        const countNew = filteredTasks.filter(t => t.status === 'New Brief').length;
        const countInDesign = filteredTasks.filter(t => t.status === 'In Design').length;
        const countReview = filteredTasks.filter(t => t.status === 'Review').length;
        const countRevision = filteredTasks.filter(t => t.status === 'Revision').length;
        const countDone = filteredTasks.filter(t => t.status === 'Done' || t.status === 'Approved').length;
        const countWaiting = filteredTasks.filter(t => t.status === 'Waiting Info').length;
        
        // Overdue count (Not Done and due date is in the past)
        const now = new Date();
        const countOverdue = filteredTasks.filter(t => {
            if (t.status === 'Done' || t.status === 'Approved' || t.status === 'Cancelled') return false;
            return new Date(t.due_date) < now;
        }).length;

        // Get urgent / high priority tasks not completed
        const urgentTasks = filteredTasks
            .filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'Done' && t.status !== 'Approved' && t.status !== 'Cancelled')
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 5);

        // Get workload metrics for designers
        const designers = users.filter(u => u.role === 'designer');
        const workloadData = designers.map(designer => {
            const designerTasks = tasks.filter(t => t.assigned_to === designer.id && t.status !== 'Done' && t.status !== 'Approved' && t.status !== 'Cancelled');
            return {
                id: designer.id,
                name: designer.name,
                count: designerTasks.length,
                avatar: designer.avatar
            };
        });
        const maxTasks = workloadData.length > 0 ? Math.max(...workloadData.map(d => d.count)) : 1;

        // Get platform counts for dropdown
        const platforms = [...new Set(tasks.map(t => t.platform))].filter(Boolean);

        return `
            <div class="dashboard-view-container animate-slide-in">
                <!-- Filter Panel -->
                <div class="filter-bar glass-card">
                    <div class="filter-group">
                        <label for="filter-designer">ดีไซเนอร์</label>
                        <select id="filter-designer" class="filter-input">
                            <option value="">นักออกแบบทั้งหมด</option>
                            ${designers.map(d => `<option value="${d.id}" ${filterState.designer === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-priority">ความสำคัญ</label>
                        <select id="filter-priority" class="filter-input">
                            <option value="">ความสำคัญทั้งหมด</option>
                            <option value="low" ${filterState.priority === 'low' ? 'selected' : ''}>ต่ำ</option>
                            <option value="medium" ${filterState.priority === 'medium' ? 'selected' : ''}>ปานกลาง</option>
                            <option value="high" ${filterState.priority === 'high' ? 'selected' : ''}>ด่วน</option>
                            <option value="urgent" ${filterState.priority === 'urgent' ? 'selected' : ''}>ด่วนที่สุด</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-platform">แพลตฟอร์ม</label>
                        <select id="filter-platform" class="filter-input">
                            <option value="">แพลตฟอร์มทั้งหมด</option>
                            ${platforms.map(p => `<option value="${p}" ${filterState.platform === p ? 'selected' : ''}>${p}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-status">สถานะ</label>
                        <select id="filter-status" class="filter-input">
                            <option value="">สถานะทั้งหมด</option>
                            <option value="New Brief" ${filterState.status === 'New Brief' ? 'selected' : ''}>บรีฟใหม่ (New Brief)</option>
                            <option value="Waiting Info" ${filterState.status === 'Waiting Info' ? 'selected' : ''}>รอข้อมูล (Waiting Info)</option>
                            <option value="In Design" ${filterState.status === 'In Design' ? 'selected' : ''}>กำลังออกแบบ (In Design)</option>
                            <option value="Review" ${filterState.status === 'Review' ? 'selected' : ''}>ส่งตรวจ (Review)</option>
                            <option value="Revision" ${filterState.status === 'Revision' ? 'selected' : ''}>ต้องแก้ไข (Revision)</option>
                            <option value="Approved" ${filterState.status === 'Approved' ? 'selected' : ''}>อนุมัติแล้ว (Approved)</option>
                            <option value="Done" ${filterState.status === 'Done' ? 'selected' : ''}>ส่งมอบแล้ว (Done)</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-due">กำหนดส่ง</label>
                        <select id="filter-due" class="filter-input">
                            <option value="">กำหนดส่งทั้งหมด</option>
                            <option value="overdue" ${filterState.due === 'overdue' ? 'selected' : ''}>เกินกำหนดส่ง</option>
                            <option value="today" ${filterState.due === 'today' ? 'selected' : ''}>ส่งวันนี้</option>
                            <option value="week" ${filterState.due === 'week' ? 'selected' : ''}>ส่งในสัปดาห์นี้</option>
                        </select>
                    </div>
                    <button class="btn btn-secondary btn-reset-filters" id="btn-clear-filters">ล้างตัวกรอง</button>
                </div>

                <!-- Stats Overview Grid -->
                <div class="stats-grid">
                    <div class="stat-card glass-card new">
                        <span class="stat-label">บรีฟใหม่</span>
                        <span class="stat-value">${countNew}</span>
                    </div>
                    <div class="stat-card glass-card waiting">
                        <span class="stat-label">รอข้อมูล</span>
                        <span class="stat-value">${countWaiting}</span>
                    </div>
                    <div class="stat-card glass-card indesign">
                        <span class="stat-label">กำลังออกแบบ</span>
                        <span class="stat-value">${countInDesign}</span>
                    </div>
                    <div class="stat-card glass-card review">
                        <span class="stat-label">รอตรวจทาน</span>
                        <span class="stat-value">${countReview}</span>
                    </div>
                    <div class="stat-card glass-card revision">
                        <span class="stat-label">สั่งแก้ไข</span>
                        <span class="stat-value">${countRevision}</span>
                    </div>
                    <div class="stat-card glass-card done">
                        <span class="stat-label">เสร็จสิ้น</span>
                        <span class="stat-value">${countDone}</span>
                    </div>
                    <div class="stat-card glass-card overdue">
                        <span class="stat-label">เกินกำหนด</span>
                        <span class="stat-value text-secondary" style="color: #f43f5e !important;">${countOverdue}</span>
                    </div>
                </div>

                <!-- Dashboard Secondary Details -->
                <div class="dashboard-details">
                    <!-- Urgent / Upcoming Tasks -->
                    <div class="urgent-tasks-card glass-card">
                        <h2 class="card-title">งานด่วนและงานที่ใกล้กำหนดส่ง</h2>
                        <div class="task-summary-list">
                            ${urgentTasks.length === 0 
                                ? `<div class="empty-state">ไม่พบงานด่วนหรืองานใกล้ส่งค้างอยู่</div>`
                                : urgentTasks.map(task => {
                                    const isOverdue = new Date(task.due_date) < now;
                                    const designer = users.find(u => u.id === task.assigned_to) || { name: 'ยังไม่มอบหมาย' };
                                    
                                    const priorityText = task.priority === 'urgent' ? 'ด่วนที่สุด' : task.priority === 'high' ? 'ด่วน' : task.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ';
                                    const statusText = task.status === 'New Brief' ? 'บรีฟใหม่' : task.status === 'Waiting Info' ? 'รอข้อมูล' : task.status === 'In Design' ? 'กำลังออกแบบ' : task.status === 'Review' ? 'รอตรวจ' : task.status === 'Revision' ? 'ต้องแก้' : task.status === 'Approved' ? 'อนุมัติแล้ว' : 'ส่งมอบแล้ว';
                                    
                                    return `
                                        <div class="task-summary-item" data-id="${task.task_id}">
                                            <div>
                                                <div class="task-sum-title">${task.task_name}</div>
                                                <div class="task-sum-info">
                                                    <span class="card-id">${task.task_id}</span>
                                                    <span class="tag tag-platform">${task.platform}</span>
                                                    <span class="tag tag-priority-${task.priority}">${priorityText}</span>
                                                    <span class="status-pill status-${task.status.toLowerCase().replace(' ', '')}" style="font-size:9px; padding: 1px 6px;">${statusText}</span>
                                                </div>
                                            </div>
                                            <div class="task-sum-right">
                                                <div class="task-sum-due" style="color: ${isOverdue ? '#ef4444' : '#f59e0b'}">
                                                    ${isOverdue ? 'เกินกำหนด' : 'กำหนดส่ง'}: ${new Date(task.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                </div>
                                                <div class="task-sum-assignee">${designer.name}</div>
                                            </div>
                                        </div>
                                    `;
                                  }).join('')
                            }
                        </div>
                    </div>

                    <!-- Workload Distribution -->
                    <div class="workload-card glass-card">
                        <h2 class="card-title">ปริมาณงานของนักออกแบบ (งานที่กำลังทำ)</h2>
                        <div class="workload-list">
                            ${workloadData.map(d => {
                                const percent = maxTasks > 0 ? (d.count / maxTasks) * 100 : 0;
                                return `
                                    <div class="workload-item">
                                        <div class="workload-meta">
                                            <span>${d.name}</span>
                                            <span>${d.count} งาน</span>
                                        </div>
                                        <div class="workload-bar-bg">
                                            <div class="workload-bar-fill" style="width: 0%;" data-width="${percent}%"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Bind Filters
        const designerSel = document.getElementById('filter-designer');
        const prioritySel = document.getElementById('filter-priority');
        const platformSel = document.getElementById('filter-platform');
        const statusSel = document.getElementById('filter-status');
        const dueSel = document.getElementById('filter-due');
        const resetBtn = document.getElementById('btn-clear-filters');
        
        const applyFilters = () => {
            filterState.designer = designerSel.value;
            filterState.priority = prioritySel.value;
            filterState.platform = platformSel.value;
            filterState.status = statusSel.value;
            filterState.due = dueSel.value;
            
            // Refresh Dashboard view
            Store.publish('viewChanged', 'dashboard');
        };

        if (designerSel) designerSel.addEventListener('change', applyFilters);
        if (prioritySel) prioritySel.addEventListener('change', applyFilters);
        if (platformSel) platformSel.addEventListener('change', applyFilters);
        if (statusSel) statusSel.addEventListener('change', applyFilters);
        if (dueSel) dueSel.addEventListener('change', applyFilters);

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                filterState = { designer: '', priority: '', platform: '', status: '', due: '' };
                Store.publish('viewChanged', 'dashboard');
            });
        }

        // Bind Urgent Card Clicks
        const summaryItems = document.querySelectorAll('.task-summary-item');
        summaryItems.forEach(item => {
            item.addEventListener('click', () => {
                const taskId = item.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId } }));
            });
        });

        // Animate workload charts
        setTimeout(() => {
            const fills = document.querySelectorAll('.workload-bar-fill');
            fills.forEach(fill => {
                const width = fill.getAttribute('data-width');
                fill.style.width = width;
            });
        }, 100);
    }
};
