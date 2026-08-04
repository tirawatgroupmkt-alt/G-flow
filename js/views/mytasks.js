// G-Flow My Tasks View Component
import { Store } from '../store.js';

let searchQuery = '';
let statusFilter = '';
let brandFilter = '';
let typeFilter = '';
let currentView = 'grid'; // 'grid' or 'list'
let sortBy = 'dueDate';  // 'dueDate' or 'priority'

// Helper to categorize tasks by due dates
const categorizeTasksByDue = (tasksList) => {
    const now = new Date();
    // Reset hours for date-only boundary compares
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    const categories = {
        overdue: [],
        today: [],
        thisWeek: [],
        later: []
    };

    tasksList.forEach(t => {
        const due = new Date(t.due_date);
        const isActive = t.status !== 'Done' && t.status !== 'Approved' && t.status !== 'Cancelled';

        if (due < startOfToday && isActive) {
            categories.overdue.push(t);
        } else if (due >= startOfToday && due <= endOfToday) {
            categories.today.push(t);
        } else if (due > endOfToday && due <= endOfWeek) {
            categories.thisWeek.push(t);
        } else {
            categories.later.push(t);
        }
    });

    // Sort ascending within each group
    Object.keys(categories).forEach(k => {
        categories[k].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    });

    return categories;
};

// Helper to render a single Grid Task Card
const renderTaskCard = (task, users, isDesigner, currentUser) => {
    const now = new Date();
    const due = new Date(task.due_date);
    const isOverdue = due < now && (task.status !== 'Done' && task.status !== 'Approved' && task.status !== 'Cancelled');
    const designer = users.find(u => u.id === task.assigned_to) || { name: 'ยังไม่มอบหมาย' };
    const client = users.find(u => u.id === task.created_by) || { name: 'หัวหน้างาน' };
    
    const priorityText = task.priority === 'urgent' ? 'ด่วนที่สุด' : task.priority === 'high' ? 'ด่วน' : task.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ';
    const statusText = task.status === 'New Brief' ? 'บรีฟใหม่' : task.status === 'Waiting Info' ? 'รอข้อมูล' : task.status === 'In Design' ? 'กำลังออกแบบ' : task.status === 'Review' ? 'รอตรวจ' : task.status === 'Revision' ? 'ต้องแก้' : task.status === 'Approved' ? 'อนุมัติแล้ว' : 'ส่งมอบแล้ว';
    const statusClass = task.status.toLowerCase().replace(' ', '');

    // Determine deadline warning visual intensity
    let deadlineClass = '';
    const diffHours = (due - now) / (1000 * 60 * 60);
    if (isOverdue) {
        deadlineClass = 'is-overdue';
    } else if (diffHours > 0 && diffHours <= 24) {
        deadlineClass = 'near-deadline';
    }

    // Determine left color indicator strip based on urgency as requested:
    // Red = Overdue, Yellow/Orange = Today, Blue/Purple = In Design/Active normal
    let urgencyIndicatorClass = 'indesign'; // default blue/purple
    if (isOverdue) {
        urgencyIndicatorClass = 'revision'; // Red
    } else if (diffHours >= 0 && diffHours <= 24) {
        urgencyIndicatorClass = 'waitinginfo'; // Yellow/Orange
    }

    return `
        <div class="task-list-card glass-card status-card-${statusClass}" data-id="${task.task_id}" style="padding-left: 20px; overflow: hidden; position: relative;">
            <!-- Urgency-based color bar on left side: Red = Overdue, Yellow = Today, Blue = normal -->
            <div class="card-status-left-indicator ${urgencyIndicatorClass}"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div style="display: flex; gap: 6px; align-items: center;">
                    <span class="card-id">${task.task_id}</span>
                    ${task.brand ? `<span class="tag tag-brand-${task.brand.toLowerCase()}" style="font-size: 10px; padding: 2px 6px;">${task.brand}</span>` : ''}
                </div>
                <span class="status-pill status-${statusClass}">${statusText}</span>
            </div>
            
            <!-- Highly dominant title font hierarchy (size 16px, font-weight 800) -->
            <h3 class="card-title" style="font-size: 16px; line-height: 1.4; height: 44px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 12px; font-weight:800; color: #fff;">
                ${task.task_name}
            </h3>
            
            <div class="task-meta-group">
                <div class="task-meta-item">
                    <span class="task-meta-label">แพลตฟอร์ม / ขนาด</span>
                    <span class="task-meta-val">${task.platform} (${task.size_ratio || 'N/A'})</span>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">ความสำคัญ</span>
                    <span class="tag tag-priority-${task.priority}" style="align-self: flex-start;">${priorityText}</span>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">กำหนดส่ง</span>
                    <span class="card-deadline-badge ${deadlineClass}" style="margin-top: 4px; display: inline-flex; width: fit-content;">
                        📅 ${due.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">${isDesigner ? 'ผู้สั่งงาน' : 'ผู้รับผิดชอบ'}</span>
                    <span class="task-meta-val">${isDesigner ? client.name : designer.name}</span>
                </div>
            </div>

            <!-- Light Task Card Actions (replaced bulky buttons with clean mini icons in bottom right) -->
            <div class="task-actions" onclick="event.stopPropagation();" style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                ${MyTasksView.getQuickActionButtons(task, currentUser)}
            </div>
        </div>
    `;
};

// Helper to render tabular List View
const renderListTable = (tasksList, usersList, isDesigner, currentUser) => {
    if (tasksList.length === 0) {
        return `<div class="glass-card empty-state" style="padding: 50px;">ไม่พบงานดีไซน์ตามเงื่อนไขที่เลือก</div>`;
    }

    return `
        <div class="mytasks-list-table-container glass-card">
            <table class="tasks-table">
                <thead>
                    <tr>
                        <th style="width: 8%;">ID</th>
                        <th style="width: 32%;">ชื่องานดีไซน์</th>
                        <th style="width: 12%;">แพลตฟอร์ม</th>
                        <th style="width: 10%;">ความเร่งด่วน</th>
                        <th style="width: 10%;">สถานะ</th>
                        <th style="width: 13%;">กำหนดส่ง</th>
                        <th style="width: 15%;">${isDesigner ? 'ผู้บรีฟงาน' : 'ดีไซเนอร์'}</th>
                        <th style="width: 10%; text-align: right;">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    ${tasksList.map(task => {
                        const now = new Date();
                        const due = new Date(task.due_date);
                        const isOverdue = due < now && (task.status !== 'Done' && task.status !== 'Approved' && task.status !== 'Cancelled');
                        const designer = usersList.find(u => u.id === task.assigned_to) || { name: 'ยังไม่มอบหมาย' };
                        const client = usersList.find(u => u.id === task.created_by) || { name: 'หัวหน้างาน' };
                        
                        const priorityText = task.priority === 'urgent' ? 'ด่วนที่สุด' : task.priority === 'high' ? 'ด่วน' : task.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ';
                        const statusText = task.status === 'New Brief' ? 'บรีฟใหม่' : task.status === 'Waiting Info' ? 'รอข้อมูล' : task.status === 'In Design' ? 'กำลังออกแบบ' : task.status === 'Review' ? 'รอตรวจ' : task.status === 'Revision' ? 'ต้องแก้' : task.status === 'Approved' ? 'อนุมัติแล้ว' : 'ส่งมอบแล้ว';
                        const statusClass = task.status.toLowerCase().replace(' ', '');

                        let deadlineClass = '';
                        const diffHours = (due - now) / (1000 * 60 * 60);
                        if (isOverdue) {
                            deadlineClass = 'is-overdue';
                        } else if (diffHours > 0 && diffHours <= 24) {
                            deadlineClass = 'near-deadline';
                        }

                        return `
                            <tr class="table-row-hover" data-id="${task.task_id}">
                                <td style="font-weight:700; color:var(--text-muted);">${task.task_id}</td>
                                <td style="font-weight:600; color:var(--text-primary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    ${task.brand ? `<span class="tag tag-brand-${task.brand.toLowerCase()}" style="font-size: 10px; padding: 2px 6px; margin-right: 6px;">${task.brand}</span>` : ''}
                                    ${task.task_name}
                                </td>
                                <td>${task.platform}</td>
                                <td><span class="tag tag-priority-${task.priority}" style="padding: 2px 8px; font-size:10px;">${priorityText}</span></td>
                                <td><span class="status-pill status-${statusClass}" style="padding: 2px 8px; font-size:10px;">${statusText}</span></td>
                                <td>
                                    <span class="card-deadline-badge ${deadlineClass}" style="font-size: 11px; padding: 2px 6px;">
                                        📅 ${due.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                    </span>
                                </td>
                                <td>${isDesigner ? client.name : designer.name}</td>
                                <td style="text-align: right;" onclick="event.stopPropagation();">
                                    ${MyTasksView.getQuickActionButtons(task, currentUser)}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
};

export const MyTasksView = {
    render() {
        const currentUser = Store.getCurrentUser();
        let tasks = Store.getTasks();
        const users = Store.getUsers();

        // Filter based on logged in user role
        const isDesigner = currentUser.role === 'designer';
        if (isDesigner) {
            tasks = tasks.filter(t => t.assigned_to === currentUser.id);
        }

        // Apply advanced search & filters
        let filteredTasks = tasks.filter(t => {
            const matchesSearch = t.task_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  t.task_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = statusFilter === '' || t.status === statusFilter;
            
            const matchesBrand = brandFilter === '' || 
                                 (t.brand && t.brand.toLowerCase() === brandFilter.toLowerCase()) ||
                                 (t.category && t.category.toLowerCase() === brandFilter.toLowerCase());
                                 
            const matchesType = typeFilter === '' || (t.task_type && t.task_type.toLowerCase() === typeFilter.toLowerCase());

            return matchesSearch && matchesStatus && matchesBrand && matchesType;
        });

        // Apply Priority Sorting (Primary sorting, is also used as secondary when grouping)
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        filteredTasks.sort((a, b) => {
            const pA = priorityWeight[a.priority] || 0;
            const pB = priorityWeight[b.priority] || 0;
            if (pB !== pA) return pB - pA;
            // secondary sort by due date
            return new Date(a.due_date) - new Date(b.due_date);
        });

        // Determine view layout content
        let mainContentMarkup = '';

        if (currentView === 'list') {
            mainContentMarkup = renderListTable(filteredTasks, users, isDesigner, currentUser);
        } else {
            // Grid View
            if (sortBy === 'dueDate') {
                // Grouped by Due Date sections
                const groups = categorizeTasksByDue(filteredTasks);
                const groupTitles = {
                    overdue: { label: '⚠️ Overdue (เลยกำหนดส่ง)', class: 'overdue' },
                    today: { label: '📅 Due Today (ต้องส่งวันนี้)', class: 'today' },
                    thisWeek: { label: '⏳ This Week (ส่งสัปดาห์นี้)', class: 'week' },
                    later: { label: '🗓️ Later (หลังจากนี้)', class: 'later' }
                };

                const hasAnyTasks = Object.values(groups).some(g => g.length > 0);
                if (!hasAnyTasks) {
                    mainContentMarkup = `<div class="glass-card empty-state" style="padding: 50px;">ไม่พบงานดีไซน์ตามเงื่อนไขที่เลือก</div>`;
                } else {
                    mainContentMarkup = Object.keys(groups).map(key => {
                        const groupTasks = groups[key];
                        if (groupTasks.length === 0) return '';

                        return `
                            <div class="due-group-section">
                                <div class="due-group-header">
                                    <span>${groupTitles[key].label}</span>
                                    <span class="due-group-badge ${groupTitles[key].class}">${groupTasks.length} งาน</span>
                                </div>
                                <div class="mytasks-list">
                                    ${groupTasks.map(task => renderTaskCard(task, users, isDesigner, currentUser)).join('')}
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            } else {
                // Standard Priority Sort Grid view
                if (filteredTasks.length === 0) {
                    mainContentMarkup = `<div class="glass-card empty-state" style="padding: 50px;">ไม่พบงานดีไซน์ตามเงื่อนไขที่เลือก</div>`;
                } else {
                    mainContentMarkup = `
                        <div class="mytasks-list">
                            ${filteredTasks.map(task => renderTaskCard(task, users, isDesigner, currentUser)).join('')}
                        </div>
                    `;
                }
            }
        }

        return `
            <div class="mytasks-view-container animate-slide-in">
                <!-- Header Actions -->
                <div class="mytasks-header" style="margin-bottom: 24px;">
                    <p class="text-secondary" style="font-size: 13px;">
                        ${isDesigner 
                            ? `คุณมี <strong>งานค้างอยู่ ${tasks.filter(t => t.status !== 'Done' && t.status !== 'Approved' && t.status !== 'Cancelled').length} งาน</strong> ที่ได้รับมอบหมาย` 
                            : `มีงานดีไซน์ทั้งหมดในระบบ <strong>${tasks.length} งาน</strong>`}
                    </p>
                    
                    <!-- Advanced Filters Group -->
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; width: 100%;">
                        <!-- 1. [จัดกลุ่ม] -->
                        <select id="mytasks-sort" class="filter-input" style="min-width: 140px; background: rgba(0,0,0,0.3); color:white;">
                            <option value="dueDate" ${sortBy === 'dueDate' ? 'selected' : ''}>จัดกลุ่มตามกำหนดส่ง</option>
                            <option value="priority" ${sortBy === 'priority' ? 'selected' : ''}>เรียงลำดับความสำคัญ</option>
                        </select>

                        <!-- 2. [สถานะ] -->
                        <select id="mytasks-status-filter" class="filter-input" style="min-width: 130px; background: rgba(0,0,0,0.3); color:white;">
                            <option value="">สถานะทั้งหมด</option>
                            <option value="New Brief" ${statusFilter === 'New Brief' ? 'selected' : ''}>บรีฟใหม่ (New Brief)</option>
                            <option value="Waiting Info" ${statusFilter === 'Waiting Info' ? 'selected' : ''}>รอข้อมูล (Waiting Info)</option>
                            <option value="In Design" ${statusFilter === 'In Design' ? 'selected' : ''}>กำลังออกแบบ (In Design)</option>
                            <option value="Review" ${statusFilter === 'Review' ? 'selected' : ''}>ส่งตรวจ (Review)</option>
                            <option value="Revision" ${statusFilter === 'Revision' ? 'selected' : ''}>ต้องแก้ไข (Revision)</option>
                            <option value="Approved" ${statusFilter === 'Approved' ? 'selected' : ''}>อนุมัติแล้ว (Approved)</option>
                            <option value="Done" ${statusFilter === 'Done' ? 'selected' : ''}>ส่งมอบแล้ว (Done)</option>
                        </select>

                        <!-- 3. [แคมเปญ/แบรนด์] -->
                        <select id="mytasks-brand-filter" class="filter-input" style="min-width: 150px; background: rgba(0,0,0,0.3); color:white;">
                            <option value="">แบรนด์/แคมเปญทั้งหมด</option>
                            <option value="puma" ${brandFilter === 'puma' ? 'selected' : ''}>PUMA</option>
                            <option value="wadfow" ${brandFilter === 'wadfow' ? 'selected' : ''}>WADFOW</option>
                            <option value="campaign" ${brandFilter === 'campaign' ? 'selected' : ''}>แคมเปญ (Campaign)</option>
                            <option value="new product" ${brandFilter === 'new product' ? 'selected' : ''}>เปิดตัวสินค้า (New Product)</option>
                        </select>

                        <!-- 4. [ประเภทสื่อ] -->
                        <select id="mytasks-type-filter" class="filter-input" style="min-width: 130px; background: rgba(0,0,0,0.3); color:white;">
                            <option value="">ประเภทสื่อทั้งหมด</option>
                            <option value="static image" ${typeFilter === 'static image' ? 'selected' : ''}>ภาพนิ่ง (Static Image)</option>
                            <option value="carousel" ${typeFilter === 'carousel' ? 'selected' : ''}>สไลด์ (Carousel)</option>
                            <option value="video" ${typeFilter === 'video' ? 'selected' : ''}>วิดีโอ (Video)</option>
                            <option value="gif" ${typeFilter === 'gif' ? 'selected' : ''}>ภาพเคลื่อนไหว (GIF)</option>
                        </select>

                        <!-- 5. View Toggle (Placed immediately before Search Bar) -->
                        <div class="view-toggle-container" style="margin-left: auto;">
                            <button id="btn-toggle-grid" class="view-toggle-btn ${currentView === 'grid' ? 'active' : ''}">
                                🎴 Grid
                            </button>
                            <button id="btn-toggle-list" class="view-toggle-btn ${currentView === 'list' ? 'active' : ''}">
                                📝 List
                            </button>
                        </div>
                        
                        <!-- 6. [Search] -->
                        <div class="search-container">
                            <span class="search-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                            <input type="text" id="mytasks-search" class="search-input" placeholder="ค้นหางานดีไซน์..." value="${searchQuery}">
                        </div>
                    </div>
                </div>

                <!-- Dynamic View Wrapper -->
                <div>
                    ${mainContentMarkup}
                </div>
            </div>
        `;
    },

    getQuickActionButtons(task, currentUser) {
        if (currentUser.role === 'designer') {
            if (task.status === 'New Brief') {
                return `
                    <div style="display: flex; gap: 8px; justify-content: flex-end; width:100%;">
                        <button class="btn btn-secondary btn-sm btn-view-detail" data-id="${task.task_id}">ดูรายละเอียด</button>
                        <button class="btn btn-primary btn-sm btn-start-design" data-id="${task.task_id}">เริ่มออกแบบ</button>
                    </div>
                `;
            }
            if (task.status === 'Waiting Info') {
                return `<button class="btn btn-secondary btn-sm btn-view-detail" data-id="${task.task_id}" style="width: 100%;">ดูรายละเอียด</button>`;
            }
            if (task.status === 'In Design') {
                return `
                    <div style="display: flex; gap: 8px; justify-content: flex-end; width:100%;">
                        <button class="btn btn-secondary btn-sm btn-view-detail" data-id="${task.task_id}">ดูรายละเอียด</button>
                        <button class="btn btn-primary btn-sm btn-submit-review" data-id="${task.task_id}">ส่งงานให้ตรวจ</button>
                    </div>
                `;
            }
            if (task.status === 'Revision') {
                return `
                    <div style="display: flex; gap: 8px; justify-content: flex-end; width:100%;">
                        <button class="btn btn-secondary btn-sm btn-view-detail" data-id="${task.task_id}">ดูรายละเอียด</button>
                        <button class="btn btn-primary btn-sm btn-submit-review" data-id="${task.task_id}">ส่งงานแก้อัปเดต</button>
                    </div>
                `;
            }
            if (task.status === 'Review') {
                return `
                    <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; width: 100%;">
                        <button class="btn btn-secondary btn-sm btn-view-detail" data-id="${task.task_id}">ดูรายละเอียด</button>
                        <span style="font-size:12px; color:var(--text-muted); font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> รอตรวจ</span>
                    </div>
                `;
            }
            return `<button class="btn btn-secondary btn-sm btn-view-detail" data-id="${task.task_id}" style="width: 100%;">ดูรายละเอียด</button>`;
        } else {
            // Manager / Admin quick actions
            if (task.status === 'Review') {
                return `
                    <div style="display: flex; gap: 8px; justify-content: flex-end; width:100%;">
                        <button class="btn btn-secondary btn-sm btn-view-detail" data-id="${task.task_id}">ดูรายละเอียด</button>
                        <button class="btn btn-primary btn-sm btn-review-work" data-id="${task.task_id}">ตรวจ & อนุมัติ</button>
                    </div>
                `;
            }
            return `
                <div style="display: flex; gap: 8px; justify-content: flex-end; width:100%;">
                    <button class="btn btn-secondary btn-sm btn-view-detail" data-id="${task.task_id}">ดูรายละเอียด</button>
                    <button class="btn btn-secondary btn-sm btn-edit-task" data-id="${task.task_id}">แก้ไขบรีฟ</button>
                </div>
            `;
        }
    },

    init() {
        const searchInput = document.getElementById('mytasks-search');
        const statusFilterDropdown = document.getElementById('mytasks-status-filter');
        const brandFilterDropdown = document.getElementById('mytasks-brand-filter');
        const typeFilterDropdown = document.getElementById('mytasks-type-filter');
        const sortDropdown = document.getElementById('mytasks-sort');
        
        const gridToggle = document.getElementById('btn-toggle-grid');
        const listToggle = document.getElementById('btn-toggle-list');

        // Click handler for task details on both Cards and Table rows
        const clickableItems = document.querySelectorAll('.task-list-card, .tasks-table tr.table-row-hover');
        clickableItems.forEach(item => {
            item.addEventListener('click', () => {
                const taskId = item.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId } }));
            });
        });

        // View Layout Toggles
        if (gridToggle) {
            gridToggle.addEventListener('click', () => {
                currentView = 'grid';
                Store.publish('viewChanged', 'mytasks');
            });
        }
        if (listToggle) {
            listToggle.addEventListener('click', () => {
                currentView = 'list';
                Store.publish('viewChanged', 'mytasks');
            });
        }

        // Sorting Switcher
        if (sortDropdown) {
            sortDropdown.addEventListener('change', (e) => {
                sortBy = e.target.value;
                Store.publish('viewChanged', 'mytasks');
            });
        }

        // Brand/Campaign Filter
        if (brandFilterDropdown) {
            brandFilterDropdown.addEventListener('change', (e) => {
                brandFilter = e.target.value;
                Store.publish('viewChanged', 'mytasks');
            });
        }

        // Media Type Filter
        if (typeFilterDropdown) {
            typeFilterDropdown.addEventListener('change', (e) => {
                typeFilter = e.target.value;
                Store.publish('viewChanged', 'mytasks');
            });
        }

        // Search trigger
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                Store.publish('viewChanged', 'mytasks');
            });
            // Focus recovery
            searchInput.focus();
            searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
        }

        // Status filter trigger
        if (statusFilterDropdown) {
            statusFilterDropdown.addEventListener('change', (e) => {
                statusFilter = e.target.value;
                Store.publish('viewChanged', 'mytasks');
            });
        }

        // Start Design Quick Action
        const startBtns = document.querySelectorAll('.btn-start-design');
        startBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.getAttribute('data-id');
                const task = Store.getTaskById(taskId);
                if (task) {
                    task.status = 'In Design';
                    task.start_date = new Date().toISOString();
                    Store.saveTask(task);
                    Store.publish('toastTriggered', { type: 'success', message: `เริ่มออกแบบงาน ${taskId} แล้ว` });
                    Store.publish('viewChanged', 'mytasks');
                }
            });
        });

        // Submit for Review Quick Action
        const submitReviewBtns = document.querySelectorAll('.btn-submit-review');
        submitReviewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId, forceSubmit: true } }));
            });
        });

        // Check & Approve Quick Action
        const checkApproveBtns = document.querySelectorAll('.btn-review-work');
        checkApproveBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId, forceReview: true } }));
            });
        });

        // Details Quick Action
        const detailBtns = document.querySelectorAll('.btn-view-detail');
        detailBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('open-task-details', { detail: { taskId } }));
            });
        });

        // Edit Quick Action
        const editBtns = document.querySelectorAll('.btn-edit-task');
        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.getAttribute('data-id');
                window.dispatchEvent(new CustomEvent('open-task-form', { detail: { taskId } }));
            });
        });
    }
};
