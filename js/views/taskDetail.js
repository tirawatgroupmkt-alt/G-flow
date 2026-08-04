// G-Flow Task Detail Modal Component
import { Store } from '../store.js';

export const TaskDetailView = {
    render(taskId, options = {}) {
        const task = Store.getTaskById(taskId);
        if (!task) return '<div class="empty-state">Task not found</div>';

        const currentUser = Store.getCurrentUser();
        const users = Store.getUsers();
        const comments = Store.getComments(taskId);
        const logs = Store.getActivityLogs(taskId);

        const assignee = users.find(u => u.id === task.assigned_to) || { name: 'Unassigned', avatar: '?' };
        const creator = users.find(u => u.id === task.created_by) || { name: 'Manager' };

        const isDesigner = currentUser.role === 'designer';
        const isManagerOrAdmin = currentUser.role === 'manager' || currentUser.role === 'admin';

        // Auto display prompt panels if requested by options
        const showSubmitReviewPanel = options.forceSubmit || false;
        const showReviewPanel = options.forceReview || false;

        return `
            <!-- Modal Header -->
            <div class="modal-header">
                <div class="modal-title-wrap">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                        <span class="card-id" style="font-size: 14px; font-weight:700;">${task.task_id}</span>
                        <span class="status-pill status-${task.status.toLowerCase().replace(' ', '')}" id="detail-status-pill">${task.status}</span>
                        <span class="tag tag-priority-${task.priority}">${task.priority} Priority</span>
                    </div>
                    <h2>${task.task_name}</h2>
                </div>
                <button class="modal-close-btn" id="btn-close-detail" aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <!-- Modal Content Layout -->
            <div class="task-detail-grid">
                <!-- Left: Full Brief & Assets -->
                <div class="detail-section-left">
                    <!-- Description -->
                    <div class="detail-block">
                        <span class="detail-label">รายละเอียดงาน</span>
                        <div class="detail-val pre-wrap">${task.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</div>
                    </div>

                    <!-- Brief info -->
                    <div class="detail-block">
                        <span class="detail-label">บรีฟงาน (Brief)</span>
                        <div class="detail-val pre-wrap">${task.brief || 'ไม่มีข้อมูลบรีฟ'}</div>
                    </div>

                    <!-- Marketing Info -->
                    <div class="detail-grid-inline">
                        <div class="detail-block">
                            <span class="detail-label">Key Message / พาดหัว</span>
                            <div class="detail-val">${task.key_message || 'ไม่มีข้อมูล'}</div>
                        </div>
                        <div class="detail-block">
                            <span class="detail-label">Call to Action (CTA)</span>
                            <div class="detail-val">${task.cta || 'ไม่มีข้อมูล'}</div>
                        </div>
                    </div>

                    <!-- Reference Materials -->
                    <div class="detail-block">
                        <span class="detail-label">Reference / แนวทางดีไซน์</span>
                        <div class="detail-val" style="display:flex; flex-direction:column; gap:8px;">
                            ${task.reference_url 
                                ? `<div><strong>Ref Link:</strong> <a href="${task.reference_url}" target="_blank" class="btn-text" style="word-break: break-all;">${task.reference_url}</a></div>` 
                                : '<div><strong>Ref Link:</strong> ไม่มีลิงก์อ้างอิง</div>'
                            }
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
                                <div><strong>Mood & Tone:</strong> ${task.mood_tone || 'N/A'}</div>
                                <div><strong>Style:</strong> ${task.design_style || 'N/A'}</div>
                                <div><strong>Color Tone:</strong> ${task.color_tone || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Assets and Drive Links -->
                    <div class="detail-grid-inline">
                        <div class="detail-block">
                            <span class="detail-label">Asset (รูปภาพ/ฟอนต์)</span>
                            <div class="detail-val">
                                ${task.asset_url 
                                    ? `<a href="${task.asset_url}" target="_blank" class="btn btn-secondary" style="width:100%; padding:6px; font-size:12px;">📁 Open Assets Folder</a>`
                                    : 'ไม่มีข้อมูลโฟลเดอร์ Asset'
                                }
                            </div>
                        </div>
                        <div class="detail-block">
                            <span class="detail-label">ไฟล์งาน Final (ส่งลูกค้า)</span>
                            <div class="detail-val">
                                ${task.final_file_url 
                                    ? `<a href="${task.final_file_url}" target="_blank" class="btn btn-primary" style="width:100%; padding:6px; font-size:12px;">📥 Get Final File (${task.final_file_type || 'File'})</a>`
                                    : '<span style="color:var(--text-muted);">ยังไม่มีการส่งไฟล์สำเร็จ</span>'
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Dynamic Submit Review panel (Designer only) -->
                    <div id="submit-review-panel" class="glass-card ${showSubmitReviewPanel ? '' : 'hidden'}" style="padding: 16px; background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.3);">
                        <h4 style="margin-bottom: 12px; font-family:var(--font-heading); font-weight:700;">ส่งงานให้หัวหน้าตรวจ (Submit for Review)</h4>
                        <form id="form-submit-review" style="display:flex; flex-direction:column; gap:10px;">
                            <div class="form-group">
                                <label for="submit-url">ลิงก์ส่งงาน Final (Google Drive / Canva / Figma)</label>
                                <input type="url" id="submit-url" class="form-input" placeholder="https://drive.google.com/..." value="${task.final_file_url || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="submit-type">ประเภทไฟล์ (Format)</label>
                                <select id="submit-type" class="form-input" style="background: rgba(0,0,0,0.3); color:white;">
                                    <option value="JPG" ${task.final_file_type === 'JPG' ? 'selected' : ''}>JPG (.jpg)</option>
                                    <option value="PNG" ${task.final_file_type === 'PNG' ? 'selected' : ''}>PNG (.png)</option>
                                    <option value="PSD" ${task.final_file_type === 'PSD' ? 'selected' : ''}>Photoshop (.psd)</option>
                                    <option value="AI" ${task.final_file_type === 'AI' ? 'selected' : ''}>Illustrator (.ai)</option>
                                    <option value="PDF" ${task.final_file_type === 'PDF' ? 'selected' : ''}>PDF Document (.pdf)</option>
                                    <option value="MP4" ${task.final_file_type === 'MP4' ? 'selected' : ''}>Video (.mp4)</option>
                                </select>
                            </div>
                            <div style="display:flex; gap:8px; justify-content: flex-end; margin-top:6px;">
                                <button type="submit" class="btn btn-primary" style="padding:6px 14px; font-size:12px;">ยืนยันและส่งงาน</button>
                                <button type="button" class="btn btn-secondary" id="btn-cancel-submit-review" style="padding:6px 14px; font-size:12px;">ยกเลิก</button>
                            </div>
                        </form>
                    </div>

                    <!-- Dynamic Review panel (Manager only) -->
                    <div id="manager-review-panel" class="glass-card ${showReviewPanel ? '' : 'hidden'}" style="padding: 16px; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">
                        <h4 style="margin-bottom: 12px; font-family:var(--font-heading); font-weight:700;">ผลการตรวจงานหัวหน้างาน</h4>
                        <div style="font-size:12px; margin-bottom:12px;">
                            <strong>ไฟล์งานที่ส่ง:</strong> 
                            ${task.final_file_url 
                                ? `<a href="${task.final_file_url}" target="_blank" style="color:var(--primary-light); font-weight:600;">คลิกตรวจงานที่นี่ (${task.final_file_type})</a>` 
                                : '<span style="color:#ef4444;">ไม่มีการแนบลิงก์ไฟล์ส่งงาน</span>'
                            }
                        </div>
                        <div class="form-group" style="margin-bottom:12px;">
                            <label for="review-feedback">Feedback / คอมเมนต์การสั่งแก้ไข (ระบุหากส่งแก้)</label>
                            <textarea id="review-feedback" class="form-input" placeholder="ใส่คอมเมนต์จุดที่ต้องแก้ไข หรือคำชมสำหรับอนุมัติงาน..."></textarea>
                        </div>
                        <div style="display:flex; gap:8px; justify-content: flex-end;">
                            <button class="btn btn-primary" id="btn-approve-work" style="padding:6px 14px; font-size:12px; background:linear-gradient(135deg, #10b981, #059669);">อนุมัติ (Approve)</button>
                            <button class="btn btn-danger" id="btn-revision-work" style="padding:6px 14px; font-size:12px;">สั่งแก้ไข (Revision)</button>
                            <button class="btn btn-secondary" id="btn-cancel-review" style="padding:6px 14px; font-size:12px;">ยกเลิก</button>
                        </div>
                    </div>

                    <!-- Comments Section -->
                    <div class="comments-section">
                        <h4 style="margin-bottom: 12px; font-family:var(--font-heading); font-weight:700;">ความคิดเห็นและฟีดแบ็ก (Comments)</h4>
                        <div class="comments-list" id="detail-comments-list">
                            ${comments.length === 0 
                                ? `<div class="empty-state" style="padding:10px;">ยังไม่มีการแสดงความเห็นสำหรับงานนี้</div>`
                                : comments.map(c => {
                                    const sender = users.find(u => u.id === c.user_id) || { name: 'Unknown User' };
                                    return `
                                        <div class="comment-item">
                                            <div class="comment-header">
                                                <span class="comment-user">${sender.name}</span>
                                                <span class="comment-time">${new Date(c.created_at).toLocaleTimeString('th-TH', { hour: 'numeric', minute: '2-digit' })}</span>
                                            </div>
                                            <div class="comment-text">${c.comment}</div>
                                        </div>
                                    `;
                                  }).join('')
                            }
                        </div>
                        <form id="comment-add-form" class="add-comment-box">
                            <input type="text" id="comment-input" class="form-input" placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..." required autocomplete="off">
                            <button type="submit" class="btn btn-primary" style="padding: 10px 16px;">ส่ง</button>
                        </form>
                    </div>
                </div>

                <!-- Right: Metadata Summary & Action Controls -->
                <div class="detail-section-right">
                    <!-- Assignee details -->
                    <div class="detail-block">
                        <span class="detail-label">ผู้รับผิดชอบ</span>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div class="user-avatar" style="width:30px; height:30px; font-size:12px;">${assignee.avatar || '?'}</div>
                            <div>
                                <div style="font-weight:600; font-size:13px;">${assignee.name}</div>
                                <div style="font-size:11px; color:var(--text-muted);">${assignee.position || 'Designer'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Metadata List -->
                    <div class="detail-block">
                        <span class="detail-label">ข้อมูลการสั่งงาน</span>
                        <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
                            <div><strong>ผู้สั่งงาน:</strong> ${creator.name}</div>
                            <div><strong>วันที่รับบรีฟ:</strong> ${new Date(task.request_date).toLocaleDateString('th-TH')}</div>
                            <div><strong>วันที่เริ่มออกแบบ:</strong> ${task.start_date ? new Date(task.start_date).toLocaleDateString('th-TH') : 'ยังไม่ได้เริ่ม'}</div>
                            <div><strong>กำหนดส่ง (Deadline):</strong> <span style="font-weight:700; color: #f59e0b;">${new Date(task.due_date).toLocaleDateString('th-TH')} ${new Date(task.due_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span></div>
                            ${task.completed_date ? `<div><strong>วันที่อนุมัติส่งงาน:</strong> ${new Date(task.completed_date).toLocaleDateString('th-TH')}</div>` : ''}
                            <div><strong>Platform:</strong> ${task.platform}</div>
                            <div><strong>ขนาดงาน (Ratio):</strong> ${task.size_ratio || 'N/A'}</div>
                            <div><strong>จำนวนแก้ไขสะสม:</strong> ${task.revision_round || 0} รอบ</div>
                        </div>
                    </div>

                    <!-- Action panel -->
                    <div class="detail-block" style="border-top:1px solid var(--border-color); padding-top:15px;">
                        <span class="detail-label" style="margin-bottom:8px;">คำสั่งดำเนินการ</span>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            ${isDesigner ? this.getDesignerActionMenu(task) : ''}
                            ${isManagerOrAdmin ? this.getManagerActionMenu(task) : ''}
                        </div>
                    </div>

                    <!-- Activity Logs -->
                    <div class="detail-block" style="border-top:1px solid var(--border-color); padding-top:15px;">
                        <span class="detail-label">กิจกรรมความเคลื่อนไหว</span>
                        <div class="activity-log">
                            ${logs.map(l => {
                                const actor = users.find(u => u.id === l.user_id) || { name: 'System' };
                                return `
                                    <div class="activity-item">
                                        <span class="activity-dot"></span>
                                        <div class="activity-content">
                                            <span class="activity-desc"><strong>${actor.name}</strong> ${this.formatActivityAction(l)}</span>
                                            <span class="activity-time">${new Date(l.created_at).toLocaleDateString('th-TH')} • ${new Date(l.created_at).toLocaleTimeString('th-TH', { hour: 'numeric', minute: '2-digit' })}</span>
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

    getDesignerActionMenu(task) {
        if (task.status === 'New Brief') {
            return `<button class="btn btn-primary" id="btn-action-start-design">🚀 เริ่มออกแบบงาน (Start Design)</button>`;
        }
        if (task.status === 'Waiting Info') {
            return `<button class="btn btn-primary" id="btn-action-start-design">✨ เริ่มทำดีไซน์ (Start Design)</button>`;
        }
        if (task.status === 'In Design' || task.status === 'Revision') {
            return `<button class="btn btn-primary" id="btn-action-trigger-review">📤 ส่งงานให้หัวหน้าตรวจ (Submit for Review)</button>`;
        }
        if (task.status === 'Review') {
            return `<span style="font-size:12px; color:var(--text-muted); text-align:center; font-weight:600;">⌛ รอหัวหน้างานตรวจและอนุมัติ</span>`;
        }
        return `<span style="font-size:12px; color:var(--color-approved); text-align:center; font-weight:600;">✓ งานนี้อนุมัติเสร็จสิ้นแล้ว</span>`;
    },

    getManagerActionMenu(task) {
        const list = [];
        
        // Edit button always available
        list.push(`<button class="btn btn-secondary" id="btn-action-edit">✏️ แก้ไขข้อมูลบรีฟ (Edit Brief)</button>`);

        if (task.status === 'Review') {
            list.push(`<button class="btn btn-primary" id="btn-action-trigger-manager-review" style="background:linear-gradient(135deg, #10b981, #059669);">🔍 ตรวจสอบและอนุมัติงาน (Review)</button>`);
        } else if (task.status !== 'Done' && task.status !== 'Approved' && task.status !== 'Cancelled') {
            list.push(`
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <label style="font-size:10px; color:var(--text-muted); font-weight:600;">เปลี่ยนสถานะด่วน:</label>
                    <select id="select-status-quick" class="form-input" style="background: rgba(0,0,0,0.3); border-color:var(--border-color); color:white; font-size:12px; padding:6px 10px;">
                        <option value="New Brief" ${task.status === 'New Brief' ? 'selected' : ''}>บรีฟใหม่ (New Brief)</option>
                        <option value="Waiting Info" ${task.status === 'Waiting Info' ? 'selected' : ''}>รอข้อมูล (Waiting Info)</option>
                        <option value="In Design" ${task.status === 'In Design' ? 'selected' : ''}>กำลังออกแบบ (In Design)</option>
                        <option value="Review" ${task.status === 'Review' ? 'selected' : ''}>ส่งตรวจ (Review)</option>
                        <option value="Revision" ${task.status === 'Revision' ? 'selected' : ''}>ต้องแก้ไข (Revision)</option>
                        <option value="Approved" ${task.status === 'Approved' ? 'selected' : ''}>อนุมัติแล้ว (Approved)</option>
                        <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>ส่งมอบแล้ว (Done)</option>
                    </select>
                </div>
            `);
        }

        list.push(`<button class="btn btn-danger" id="btn-action-delete">🗑️ ลบงานชิ้นนี้ (Delete Task)</button>`);
        
        return list.join('');
    },

    formatActivityAction(log) {
        switch (log.action) {
            case 'Create Task': return 'สร้างงานใหม่';
            case 'Change Status': return `เปลี่ยนสถานะจาก "${log.old_value}" เป็น "${log.new_value}"`;
            case 'Add Comment': return 'เขียนความคิดเห็น';
            case 'Request Revision': return 'สั่งแก้ไขงาน';
            case 'Approve Task': return 'อนุมัติผ่านงาน';
            default: return log.action;
        }
    },

    init(taskId, options = {}) {
        const task = Store.getTaskById(taskId);
        if (!task) return;

        const currentUser = Store.getCurrentUser();
        const detailModal = document.getElementById('task-detail-modal');

        const closeBtn = document.getElementById('btn-close-detail');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                detailModal.classList.add('hidden');
            });
        }

        // Close when clicking outside modal container
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                detailModal.classList.add('hidden');
            }
        });

        // Add Comment Listener
        const commentForm = document.getElementById('comment-add-form');
        const commentInput = document.getElementById('comment-input');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = commentInput.value.trim();
                if (text) {
                    Store.addComment(taskId, currentUser.id, text);
                    // Refresh Detail view with same options
                    const container = detailModal.querySelector('.modal-container');
                    container.innerHTML = this.render(taskId, options);
                    this.init(taskId, options);
                }
            });
        }

        // DESIGNER ACTION: Start Design
        const startDesignBtn = document.getElementById('btn-action-start-design');
        if (startDesignBtn) {
            startDesignBtn.addEventListener('click', () => {
                task.status = 'In Design';
                task.start_date = new Date().toISOString();
                Store.saveTask(task);
                Store.publish('toastTriggered', { type: 'success', message: 'เริ่มดำเนินงานออกแบบแล้ว' });
                
                // Refresh modal
                const container = detailModal.querySelector('.modal-container');
                container.innerHTML = this.render(taskId);
                this.init(taskId);
            });
        }

        // DESIGNER ACTION: Open Submit Review Panel
        const triggerReviewBtn = document.getElementById('btn-action-trigger-review');
        const submitReviewPanel = document.getElementById('submit-review-panel');
        if (triggerReviewBtn) {
            triggerReviewBtn.addEventListener('click', () => {
                submitReviewPanel.classList.remove('hidden');
            });
        }

        // DESIGNER ACTION: Cancel Submit Review Panel
        const cancelReviewBtn = document.getElementById('btn-cancel-submit-review');
        if (cancelReviewBtn) {
            cancelReviewBtn.addEventListener('click', () => {
                submitReviewPanel.classList.add('hidden');
            });
        }

        // DESIGNER ACTION: Submit Review Form
        const submitReviewForm = document.getElementById('form-submit-review');
        if (submitReviewForm) {
            submitReviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const url = document.getElementById('submit-url').value.trim();
                const type = document.getElementById('submit-type').value;

                task.status = 'Review';
                task.final_file_url = url;
                task.final_file_type = type;
                
                Store.saveTask(task);
                Store.publish('toastTriggered', { type: 'success', message: 'อัปเดตไฟล์ และส่งตรวจไปยังหัวหน้างานเรียบร้อย' });

                // Refresh modal
                const container = detailModal.querySelector('.modal-container');
                container.innerHTML = this.render(taskId);
                this.init(taskId);
            });
        }

        // MANAGER ACTION: Open Review Panel
        const triggerManagerReviewBtn = document.getElementById('btn-action-trigger-manager-review');
        const managerReviewPanel = document.getElementById('manager-review-panel');
        if (triggerManagerReviewBtn) {
            triggerManagerReviewBtn.addEventListener('click', () => {
                managerReviewPanel.classList.remove('hidden');
            });
        }

        // MANAGER ACTION: Cancel Review
        const cancelMgrReviewBtn = document.getElementById('btn-cancel-review');
        if (cancelMgrReviewBtn) {
            cancelMgrReviewBtn.addEventListener('click', () => {
                managerReviewPanel.classList.add('hidden');
            });
        }

        // MANAGER ACTION: Approve Work
        const approveBtn = document.getElementById('btn-approve-work');
        if (approveBtn) {
            approveBtn.addEventListener('click', () => {
                const feedbackText = document.getElementById('review-feedback').value.trim();
                
                task.status = 'Done';
                task.review_status = 'approved';
                task.completed_date = new Date().toISOString();
                
                if (feedbackText) {
                    task.feedback = feedbackText;
                    Store.addComment(taskId, currentUser.id, `อนุมัติงาน: ${feedbackText}`);
                }

                Store.saveTask(task);
                Store.publish('toastTriggered', { type: 'success', message: `อนุมัติผ่านงาน ${taskId} เรียบร้อย` });
                
                // Refresh modal
                const container = detailModal.querySelector('.modal-container');
                container.innerHTML = this.render(taskId);
                this.init(taskId);
            });
        }

        // MANAGER ACTION: Request Revision
        const revisionBtn = document.getElementById('btn-revision-work');
        if (revisionBtn) {
            revisionBtn.addEventListener('click', () => {
                const feedbackText = document.getElementById('review-feedback').value.trim();
                if (!feedbackText) {
                    Store.publish('toastTriggered', { type: 'danger', message: 'กรุณาระบุสิ่งที่ต้องการแก้ไขในช่อง Feedback ก่อนกดสั่งแก้ไข' });
                    return;
                }
                
                task.status = 'Revision';
                task.review_status = 'revision';
                task.revision_round = (task.revision_round || 0) + 1;
                task.feedback = feedbackText;

                Store.saveTask(task);
                Store.addComment(taskId, currentUser.id, `สั่งแก้ไขงาน (รอบที่ ${task.revision_round}): ${feedbackText}`);
                Store.publish('toastTriggered', { type: 'warning', message: `ส่งงาน ${taskId} กลับไปแก้ไขเรียบร้อย` });

                // Refresh modal
                const container = detailModal.querySelector('.modal-container');
                container.innerHTML = this.render(taskId);
                this.init(taskId);
            });
        }

        // MANAGER ACTION: Quick Status Change Select Dropdown
        const statusQuickSelect = document.getElementById('select-status-quick');
        if (statusQuickSelect) {
            statusQuickSelect.addEventListener('change', (e) => {
                const nextStatus = e.target.value;
                
                if ((nextStatus === 'Done' || nextStatus === 'Approved') && !task.final_file_url) {
                    Store.publish('toastTriggered', { type: 'warning', message: 'กรุณากรอกลิงก์ไฟล์ส่งงาน (Final File Link) ก่อนเปลี่ยนสถานะปิดงาน' });
                    statusQuickSelect.value = task.status;
                    return;
                }

                task.status = nextStatus;
                if (nextStatus === 'Done') {
                    task.completed_date = new Date().toISOString();
                }
                
                Store.saveTask(task);
                Store.publish('toastTriggered', { type: 'success', message: `เปลี่ยนสถานะงานเป็น "${nextStatus}"` });

                // Refresh modal
                const container = detailModal.querySelector('.modal-container');
                container.innerHTML = this.render(taskId);
                this.init(taskId);
            });
        }

        // MANAGER ACTION: Edit Brief Trigger (Form modal launch)
        const editBriefBtn = document.getElementById('btn-action-edit');
        if (editBriefBtn) {
            editBriefBtn.addEventListener('click', () => {
                // Close current details modal and open form modal
                detailModal.classList.add('hidden');
                window.dispatchEvent(new CustomEvent('open-task-form', { detail: { taskId } }));
            });
        }

        // MANAGER ACTION: Delete Task
        const deleteBtn = document.getElementById('btn-action-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm(`คุณแน่ใจว่าต้องการลบงาน ${taskId} ใช่หรือไม่? ข้อมูลทั้งหมดจะไม่สามารถกู้คืนได้`)) {
                    Store.deleteTask(taskId);
                    Store.publish('toastTriggered', { type: 'success', message: `ลบงาน ${taskId} สำเร็จ` });
                    detailModal.classList.add('hidden');
                }
            });
        }
    }
};
