// G-Flow Create / Edit Task Form Modal Component
import { Store } from '../store.js';

export const TaskFormView = {
    render(taskId = null) {
        const isEditMode = taskId !== null;
        let task = {
            task_name: '',
            description: '',
            assigned_to: '',
            due_date: '',
            priority: 'medium',
            platform: 'Facebook',
            size_ratio: '1:1 (1080x1080 px)',
            brief: '',
            objective: '',
            target_audience: '',
            key_message: '',
            cta: '',
            must_include: '',
            must_avoid: '',
            reference_url: '',
            mood_tone: '',
            design_style: '',
            color_tone: '',
            asset_url: '',
            status: 'New Brief'
        };

        if (isEditMode) {
            const existing = Store.getTaskById(taskId);
            if (existing) {
                task = { ...task, ...existing };
            }
        }

        const designers = Store.getUsers().filter(u => u.role === 'designer');
        
        // Format ISO datetime string to fit HTML datetime-local input (YYYY-MM-DDThh:mm)
        let formattedDate = '';
        if (task.due_date) {
            const date = new Date(task.due_date);
            // Adjust offset to local time
            const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
            const localISOTime = (new Date(date - tzoffset)).toISOString().slice(0, 16);
            formattedDate = localISOTime;
        } else {
            // Default: tomorrow at 18:00
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(18, 0, 0, 0);
            const tzoffset = tomorrow.getTimezoneOffset() * 60000;
            formattedDate = (new Date(tomorrow - tzoffset)).toISOString().slice(0, 16);
        }

        return `
            <!-- Modal Header -->
            <div class="modal-header">
                <div class="modal-title-wrap">
                    <h2>${isEditMode ? `✏️ แก้ไขงานออกแบบ: ${task.task_id}` : '➕ สั่งงานกราฟิกใหม่'}</h2>
                    <p class="text-secondary" style="font-size:12px;">กรุณากรอกข้อมูลสำคัญให้ครบถ้วนเพื่อประสิทธิภาพในการทำงานของทีมดีไซเนอร์</p>
                </div>
                <button class="modal-close-btn" id="btn-close-form" aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <!-- Form -->
            <form id="task-creation-form">
                <input type="hidden" id="form-task-id" value="${taskId || ''}">
                <input type="hidden" id="form-task-status" value="${task.status}">
                
                <div class="form-grid">
                    <!-- Title -->
                    <div class="form-group form-group-full">
                        <label for="form-title">ชื่องาน (Task Title) *</label>
                        <input type="text" id="form-title" class="form-input" placeholder="เช่น โพสต์โปรโมทสินค้าใหม่คอลเลกชันฤดูร้อน LINE OA" value="${task.task_name}" required>
                    </div>

                    <!-- Assignee -->
                    <div class="form-group">
                        <label for="form-assignee">ผู้รับผิดชอบงานกราฟิก (Designer) *</label>
                        <select id="form-assignee" class="form-input" style="background: rgba(0,0,0,0.3); color:white;" required>
                            <option value="">-- เลือกกราฟิกดีไซเนอร์ --</option>
                            ${designers.map(d => `<option value="${d.id}" ${task.assigned_to === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Deadline -->
                    <div class="form-group">
                        <label for="form-due">กำหนดส่งงาน (Deadline) *</label>
                        <input type="datetime-local" id="form-due" class="form-input" value="${formattedDate}" required>
                    </div>

                    <!-- Platform -->
                    <div class="form-group">
                        <label for="form-platform">Platform งานดีไซน์ *</label>
                        <select id="form-platform" class="form-input" style="background: rgba(0,0,0,0.3); color:white;" required>
                            <option value="Facebook" ${task.platform === 'Facebook' ? 'selected' : ''}>Facebook</option>
                            <option value="LINE OA" ${task.platform === 'LINE OA' ? 'selected' : ''}>LINE OA</option>
                            <option value="Shopee" ${task.platform === 'Shopee' ? 'selected' : ''}>Shopee</option>
                            <option value="Lazada" ${task.platform === 'Lazada' ? 'selected' : ''}>Lazada</option>
                            <option value="TikTok" ${task.platform === 'TikTok' ? 'selected' : ''}>TikTok</option>
                            <option value="Instagram" ${task.platform === 'Instagram' ? 'selected' : ''}>Instagram</option>
                            <option value="Website" ${task.platform === 'Website' ? 'selected' : ''}>Website</option>
                            <option value="Other" ${task.platform === 'Other' ? 'selected' : ''}>Other / Offline</option>
                        </select>
                    </div>

                    <!-- Size / Ratio -->
                    <div class="form-group">
                        <label for="form-size">ขนาดและสัดส่วนชิ้นงาน (Size / Ratio) *</label>
                        <input type="text" id="form-size" class="form-input" placeholder="เช่น 1:1 (1080x1080px) หรือ 16:9 (Cover)" value="${task.size_ratio}" required>
                    </div>

                    <!-- Priority -->
                    <div class="form-group">
                        <label for="form-priority">ความเร่งด่วน (Priority) *</label>
                        <select id="form-priority" class="form-input" style="background: rgba(0,0,0,0.3); color:white;" required>
                            <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low (ไม่รีบ)</option>
                            <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium (ปกติ)</option>
                            <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High (ด่วน)</option>
                            <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent (ด่วนที่สุด)</option>
                        </select>
                    </div>

                    <!-- Brand -->
                    <div class="form-group">
                        <label for="form-brand">แบรนด์สินค้า (Brand / Client)</label>
                        <input type="text" id="form-brand" class="form-input" placeholder="เช่น PUMA, WADFOW" value="${task.brand || ''}">
                    </div>

                    <!-- Asset Link -->
                    <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                        <label for="form-asset-url">ลิงก์รูปสินค้า/วัตถุดิบ (Asset Link / Upload)</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="url" id="form-asset-url" class="form-input" placeholder="https://drive.google.com/..." value="${task.asset_url || ''}" style="flex: 1;">
                            <div class="upload-btn-wrapper">
                                <button type="button" class="btn btn-secondary" style="white-space: nowrap; font-size:12px; padding: 10px 14px; display: flex; align-items: center; gap: 6px;">📤 อัปโหลดไฟล์</button>
                                <input type="file" id="form-asset-file-uploader" accept="image/*,application/pdf,application/zip">
                            </div>
                        </div>
                        <div id="form-asset-upload-progress" class="upload-progress-container" style="display: none;">
                            <div class="upload-spinner"></div>
                            <span id="upload-status-text" style="font-size:11px;">กำลังอัปโหลดไฟล์ไปยัง Google Drive...</span>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="form-group form-group-full">
                        <label for="form-desc">รายละเอียดงานเพิ่มเติม (Task Description)</label>
                        <textarea id="form-desc" class="form-input" placeholder="อธิบายวัตถุประสงค์สั้นๆ หรือเงื่อนไขเพิ่มเติม...">${task.description || ''}</textarea>
                    </div>

                    <!-- Brief -->
                    <div class="form-group form-group-full">
                        <label for="form-brief">บรีฟการออกแบบ (Design Brief details) *</label>
                        <textarea id="form-brief" class="form-input" placeholder="ระบุการจัดวางองค์ประกอบภาพ ข้อความที่ต้องการให้เด่น..." style="min-height: 100px;" required>${task.brief || ''}</textarea>
                    </div>

                    <!-- Reference URL -->
                    <div class="form-group form-group-full">
                        <label for="form-ref-url">ลิงก์ภาพตัวอย่างแนวทางอ้างอิง (Reference Link) *</label>
                        <input type="url" id="form-ref-url" class="form-input" placeholder="https://pinterest.com/..., https://..." value="${task.reference_url || ''}" required>
                    </div>

                    <!-- Mood/Tone, Style, Color -->
                    <div class="form-group">
                        <label for="form-mood-tone">Mood & Tone (โทนอารมณ์)</label>
                        <input type="text" id="form-mood-tone" class="form-input" placeholder="เช่น สว่าง สบายตา สดใส" value="${task.mood_tone || ''}">
                    </div>
                    <div class="form-group">
                        <label for="form-style">Design Style (แนวดีไซน์)</label>
                        <input type="text" id="form-style" class="form-input" placeholder="เช่น Minimal, Pop-art, Neon" value="${task.design_style || ''}">
                    </div>
                    <div class="form-group">
                        <label for="form-color-tone">Color Tone (ชุดคู่สีหลัก)</label>
                        <input type="text" id="form-color-tone" class="form-input" placeholder="เช่น เขียวมิ้นต์กับชมพูพาสเทล" value="${task.color_tone || ''}">
                    </div>
                    <div class="form-group">
                        <label for="form-key-message">Key Message / พาดหัวหลัก</label>
                        <input type="text" id="form-key-message" class="form-input" placeholder="ข้อความหลักที่ต้องเด่นสุดในกราฟิก" value="${task.key_message || ''}">
                    </div>
                    <div class="form-group form-group-full">
                        <label for="form-cta">Call to Action (CTA) / ข้อความเชิญชวน</label>
                        <input type="text" id="form-cta" class="form-input" placeholder="เช่น ช้อปเลย! หรือ แอดไลน์ด่วน!" value="${task.cta || ''}">
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="btn-cancel-form">ยกเลิก</button>
                    <button type="submit" class="btn btn-primary" id="btn-submit-task">
                        ${isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกสั่งงานใหม่'}
                    </button>
                </div>
            </form>
        `;
    },

    init() {
        const formModal = document.getElementById('task-form-modal');
        const form = document.getElementById('task-creation-form');
        const closeBtn = document.getElementById('btn-close-form');
        const cancelBtn = document.getElementById('btn-cancel-form');

        // File Uploader Elements
        const fileUploader = document.getElementById('form-asset-file-uploader');
        const assetUrlInput = document.getElementById('form-asset-url');
        const progressContainer = document.getElementById('form-asset-upload-progress');
        const statusText = document.getElementById('upload-status-text');
        const submitBtn = document.getElementById('btn-submit-task');

        // File upload event listener
        if (fileUploader) {
            fileUploader.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Validate file size (limit to 10MB to avoid Apps Script payload overflow)
                if (file.size > 10 * 1024 * 1024) {
                    Store.publish('toastTriggered', {
                        type: 'danger',
                        message: 'ไฟล์มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 10MB)'
                    });
                    fileUploader.value = '';
                    return;
                }

                progressContainer.style.display = 'flex';
                statusText.textContent = `กำลังอัปโหลด "${file.name}"...`;
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';

                const sheetsUrl = Store.getSheetsUrl();
                const reader = new FileReader();

                reader.onload = (event) => {
                    const base64 = event.target.result.split(',')[1];
                    const mimeType = file.type || 'application/octet-stream';
                    const fileName = file.name;

                    if (!sheetsUrl) {
                        // Offline mock mode
                        setTimeout(() => {
                            const mockUrl = `https://drive.google.com/mock-file-offline-${Date.now()}/${encodeURIComponent(fileName)}`;
                            assetUrlInput.value = mockUrl;
                            progressContainer.style.display = 'none';
                            submitBtn.disabled = false;
                            submitBtn.style.opacity = '1';
                            Store.publish('toastTriggered', {
                                type: 'warning',
                                message: `โหมดออฟไลน์: จำลองการอัปโหลดสำเร็จ (ไฟล์: ${fileName})`
                            });
                        }, 1200);
                        return;
                    }

                    // Online Mode: POST to Google Sheets API Web App URL
                    fetch(sheetsUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        body: JSON.stringify({
                            action: 'uploadFile',
                            data: {
                                base64: base64,
                                mimeType: mimeType,
                                fileName: fileName
                            }
                        })
                    })
                    .then(response => response.json())
                    .then(res => {
                        if (res.success && res.url) {
                            assetUrlInput.value = res.url;
                            Store.publish('toastTriggered', {
                                type: 'success',
                                message: `อัปโหลดไฟล์ "${fileName}" สำเร็จ!`
                            });
                        } else {
                            throw new Error(res.error || 'อัปโหลดสำเร็จแต่ไม่พบลิงก์ดาวน์โหลด');
                        }
                    })
                    .catch(err => {
                        console.error('File upload error:', err);
                        // Fallback to placeholder drive link so user is not blocked
                        const fallbackUrl = `https://drive.google.com/drive/folders/offline-fallback-${Date.now()}`;
                        assetUrlInput.value = fallbackUrl;
                        Store.publish('toastTriggered', {
                            type: 'warning',
                            message: `อัปโหลดขัดข้อง: ใช้ลิงก์สำรองแทนสำหรับงานค้าง (${err.message})`
                        });
                    })
                    .finally(() => {
                        progressContainer.style.display = 'none';
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        fileUploader.value = '';
                    });
                };
                reader.readAsDataURL(file);
            });
        }

        // Close handlers
        const closeModal = () => {
            formModal.classList.add('hidden');
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        formModal.addEventListener('click', (e) => {
            if (e.target === formModal) {
                closeModal();
            }
        });

        // Form Submit
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                // Validate form inputs (extra sanity checks)
                const title = document.getElementById('form-title').value.trim();
                const assignee = document.getElementById('form-assignee').value;
                const dueVal = document.getElementById('form-due').value;
                const platform = document.getElementById('form-platform').value;
                const size = document.getElementById('form-size').value.trim();
                const brief = document.getElementById('form-brief').value.trim();
                const refUrl = document.getElementById('form-ref-url').value.trim();

                if (!title || !assignee || !dueVal || !platform || !size || !brief || !refUrl) {
                    Store.publish('toastTriggered', { type: 'danger', message: 'กรุณากรอกฟิลด์สำคัญให้ครบถ้วนก่อนบันทึก!' });
                    return;
                }

                const editId = document.getElementById('form-task-id').value;
                const status = document.getElementById('form-task-status').value || 'New Brief';
                
                const taskData = {
                    task_name: title,
                    description: document.getElementById('form-desc').value.trim(),
                    assigned_to: assignee,
                    due_date: new Date(dueVal).toISOString(),
                    priority: document.getElementById('form-priority').value,
                    platform,
                    size_ratio: size,
                    brief,
                    reference_url: refUrl,
                    mood_tone: document.getElementById('form-mood-tone').value.trim(),
                    design_style: document.getElementById('form-style').value.trim(),
                    color_tone: document.getElementById('form-color-tone').value.trim(),
                    key_message: document.getElementById('form-key-message').value.trim(),
                    cta: document.getElementById('form-cta').value.trim(),
                    asset_url: document.getElementById('form-asset-url').value.trim(),
                    brand: document.getElementById('form-brand').value.trim(),
                    status
                };

                if (editId) {
                    taskData.task_id = editId;
                } else {
                    const currentUser = Store.getCurrentUser();
                    taskData.created_by = currentUser.id;
                }

                // Save to store
                const saved = Store.saveTask(taskData);
                Store.publish('toastTriggered', { 
                    type: 'success', 
                    message: editId 
                        ? `แก้ไขบรีฟงาน ${editId} เรียบร้อยแล้ว` 
                        : `บันทึกมอบหมายงานใหม่ "${saved.task_name}" สำเร็จ` 
                });

                closeModal();
            });
        }
    }
};
