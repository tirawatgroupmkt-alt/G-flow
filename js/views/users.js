// G-Flow User / Team Management View Component
import { Store } from '../store.js';

export const UsersView = {
    render() {
        const currentUser = Store.getCurrentUser();
        const users = Store.getUsers();

        // Access Control
        if (currentUser.role !== 'admin') {
            return `
                <div class="glass-card empty-state animate-slide-in" style="padding: 60px; max-width: 600px; margin: 40px auto;">
                    <div style="font-size: 50px; margin-bottom: 20px;">🔒</div>
                    <h2 class="card-title" style="color: #ef4444;">ปฏิเสธการเข้าถึง</h2>
                    <p class="text-secondary" style="font-size: 14px; line-height: 1.6;">
                        ขออภัย หน้าจัดการทีมงานเฉพาะผู้ใช้ที่มีสิทธิ์ <strong>Admin (ผู้ดูแลระบบ)</strong> เท่านั้น 
                        คุณเข้าใช้ในสิทธิ์ <strong>${currentUser.name} (${currentUser.role})</strong> จึงไม่มีสิทธิ์ในการแก้ไขรายชื่อทีมงาน
                    </p>
                    <p class="text-secondary" style="font-size: 12px; margin-top: 15px;">
                        *แนะนำ: หากต้องการทดสอบ สามารถสลับสิทธิ์การใช้งานเป็น <strong>Administrator</strong> ได้ที่มุมขวาบน
                    </p>
                </div>
            `;
        }

        return `
            <div class="users-view-container animate-slide-in" style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
                <!-- Left: Team List -->
                <div class="glass-card" style="padding: 24px; height: fit-content;">
                    <h2 class="card-title">รายชื่อทีมงาน</h2>
                    <div class="team-list-container">
                        ${users.map(user => {
                            const roleText = user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : user.role === 'manager' ? 'หัวหน้างาน (Manager)' : 'ดีไซเนอร์ (Designer)';
                            return `
                                <div class="user-card glass-card">
                                    <div class="user-card-avatar" style="background: ${user.role === 'admin' ? 'linear-gradient(135deg, #ef4444, #f97316)' : user.role === 'manager' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'linear-gradient(135deg, #3b82f6, #10b981)'}">${user.avatar || 'U'}</div>
                                    <h3 class="user-card-name">${user.name}</h3>
                                    <span class="user-card-email">${user.email}</span>
                                    <span class="user-card-tag">${roleText}</span>
                                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
                                        ${user.position} • ${user.department}
                                    </div>
                                    <div class="user-card-actions">
                                        <button class="btn btn-secondary btn-edit-user" data-id="${user.id}">แก้ไข</button>
                                        ${user.id !== currentUser.id 
                                            ? `<button class="btn btn-danger btn-delete-user" data-id="${user.id}">ลบ</button>` 
                                            : `<span style="font-size:10px; color:var(--text-muted); margin-top:14px; flex:1;">คุณ (ผู้ใช้ปัจจุบัน)</span>`
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Right: Create/Edit User Form -->
                <div class="glass-card" style="padding: 24px; height: fit-content;">
                    <h2 class="card-title" id="user-form-title">เพิ่มสมาชิกใหม่</h2>
                    <form id="team-user-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <input type="hidden" id="user-edit-id" value="">
                        
                        <div class="form-group">
                            <label for="user-id">ชื่อผู้ใช้ / รหัสประจำตัว (Username)</label>
                            <input type="text" id="user-id" class="form-input" placeholder="เช่น art, bank (ภาษาอังกฤษ)" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="user-name">ชื่อ-นามสกุล</label>
                            <input type="text" id="user-name" class="form-input" placeholder="เช่น Art (Designer)" required>
                        </div>

                        <div class="form-group">
                            <label for="user-email">ที่อยู่อีเมล</label>
                            <input type="email" id="user-email" class="form-input" placeholder="เช่น name@company.com" required>
                        </div>

                        <div class="form-group">
                            <label for="user-role">สิทธิ์การใช้งานในระบบ</label>
                            <select id="user-role" class="form-input" style="background: rgba(0,0,0,0.3); border-color:var(--border-color); color:white;" required>
                                <option value="designer">ดีไซเนอร์ (Designer)</option>
                                <option value="manager">หัวหน้างาน (Manager)</option>
                                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="user-department">แผนก</label>
                            <input type="text" id="user-department" class="form-input" placeholder="เช่น Graphic Design" required>
                        </div>

                        <div class="form-group">
                            <label for="user-position">ตำแหน่งงาน</label>
                            <input type="text" id="user-position" class="form-input" placeholder="เช่น Junior Designer" required>
                        </div>

                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary" style="flex:1;" id="btn-save-user">บันทึกข้อมูลสมาชิก</button>
                            <button type="button" class="btn btn-secondary" style="display:none;" id="btn-cancel-edit-user">ยกเลิก</button>
                        </div>
                    </form>
                </div>
            </div>                         <button type="submit" class="btn btn-primary" style="flex:1;" id="btn-save-user">Save Member</button>
                            <button type="button" class="btn btn-secondary" style="display:none;" id="btn-cancel-edit-user">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    init() {
        const currentUser = Store.getCurrentUser();
        if (currentUser.role !== 'admin') return;

        const form = document.getElementById('team-user-form');
        const userEditId = document.getElementById('user-edit-id');
        const userIdInput = document.getElementById('user-id');
        const userNameInput = document.getElementById('user-name');
        const userEmailInput = document.getElementById('user-email');
        const userRoleInput = document.getElementById('user-role');
        const userDeptInput = document.getElementById('user-department');
        const userPosInput = document.getElementById('user-position');
        const formTitle = document.getElementById('user-form-title');
        const saveBtn = document.getElementById('btn-save-user');
        const cancelBtn = document.getElementById('btn-cancel-edit-user');

        // Form Submit
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const id = userIdInput.value.trim().toLowerCase();
                const editId = userEditId.value;
                
                // If adding new, make sure username does not exist
                if (!editId) {
                    const existing = Store.getUserById(id);
                    if (existing) {
                        Store.publish('toastTriggered', { type: 'danger', message: `Username/ID "${id}" ซ้ำในระบบ กรุณาใช้ชื่ออื่น` });
                        return;
                    }
                }

                const updatedUser = {
                    id: editId || id,
                    name: userNameInput.value.trim(),
                    email: userEmailInput.value.trim(),
                    role: userRoleInput.value,
                    department: userDeptInput.value.trim(),
                    position: userPosInput.value.trim(),
                    status: 'active',
                    avatar: userNameInput.value.trim().charAt(0).toUpperCase()
                };

                Store.saveUser(updatedUser);
                Store.publish('toastTriggered', { type: 'success', message: `${editId ? 'แก้ไข' : 'เพิ่ม'}ข้อมูลทีมงาน "${updatedUser.name}" เรียบร้อย` });
                
                // Refresh
                Store.publish('viewChanged', 'users');
            });
        }

        // Edit User Trigger
        const editButtons = document.querySelectorAll('.btn-edit-user');
        editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                const user = Store.getUserById(userId);
                if (user) {
                    userEditId.value = user.id;
                    userIdInput.value = user.id;
                    userIdInput.disabled = true; // Lock key ID in edit mode
                    userNameInput.value = user.name;
                    userEmailInput.value = user.email;
                    userRoleInput.value = user.role;
                    userDeptInput.value = user.department;
                    userPosInput.value = user.position;

                    formTitle.textContent = 'แก้ไขข้อมูลสมาชิก';
                    saveBtn.textContent = 'อัปเดตข้อมูล';
                    cancelBtn.style.display = 'inline-flex';
                }
            });
        });

        // Cancel Edit User
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                userEditId.value = '';
                userIdInput.value = '';
                userIdInput.disabled = false;
                userNameInput.value = '';
                userEmailInput.value = '';
                userDeptInput.value = '';
                userPosInput.value = '';
                formTitle.textContent = 'เพิ่มสมาชิกใหม่';
                saveBtn.textContent = 'บันทึกข้อมูลสมาชิก';
                cancelBtn.style.display = 'none';
            });
        }

        // Delete User Trigger
        const deleteButtons = document.querySelectorAll('.btn-delete-user');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.getAttribute('data-id');
                const user = Store.getUserById(userId);
                if (user && confirm(`คุณแน่ใจว่าต้องการลบทีมงาน "${user.name}" ออกจากระบบ?`)) {
                    Store.deleteUser(userId);
                    Store.publish('toastTriggered', { type: 'success', message: `ลบทีมงาน "${user.name}" ออกจากระบบเรียบร้อย` });
                    Store.publish('viewChanged', 'users');
                }
            });
        });
    }
};
