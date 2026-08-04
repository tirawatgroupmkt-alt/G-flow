// G-Flow Settings & Sync View Component
import { Store } from '../store.js';

export const SettingsView = {
    render() {
        const sheetsUrl = Store.getSheetsUrl();
        const connectionStatus = sheetsUrl ? 'เชื่อมต่อแล้ว (Connected)' : 'ใช้งานแบบออฟไลน์ในเครื่อง (Offline)';
        const isConnected = !!sheetsUrl;

        return `
            <div class="settings-view-container animate-slide-in" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <!-- Column 1: Google Sheets Sync Settings -->
                <div class="glass-card" style="padding: 24px;">
                    <h2 class="card-title">🔗 Google Sheets Integration</h2>
                    <p class="text-secondary" style="font-size: 13px; margin-bottom: 20px; line-height: 1.6;">
                        เชื่อมต่อแอปพลิเคชัน G-Flow เข้ากับ Google Sheets ของคุณ เพื่อใช้เป็นฐานข้อมูลกลางแบบเรียลไทม์ ทำให้คนอื่นในทีมมองเห็นงานอัปเดตตรงกันทันที
                    </p>

                    <div style="margin-bottom: 24px; padding: 14px; border-radius: 8px; background: ${isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}; border: 1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'};">
                        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block;">สถานะการเชื่อมต่อ</span>
                        <strong style="color: ${isConnected ? '#10b981' : '#f59e0b'}; font-size: 14px; display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${isConnected ? '#10b981' : '#f59e0b'}; display: inline-block;"></span>
                            ${connectionStatus}
                        </strong>
                    </div>

                    <form id="sheets-config-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group">
                            <label for="input-sheets-url">Google Apps Script Web App URL</label>
                            <input type="url" id="input-sheets-url" class="form-input" 
                                   placeholder="https://script.google.com/macros/s/.../exec" 
                                   value="${sheetsUrl}" style="font-size: 12px;">
                            <span style="font-size:11px; color: var(--text-muted); margin-top: 4px;">
                                *ศึกษาวิธีการขอลิงก์เชื่อมต่อได้ในคู่มือไฟล์ <strong>google_sheets_setup.md</strong>
                            </span>
                        </div>

                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary" style="flex:1;">บันทึกการตั้งค่า</button>
                            ${isConnected ? `<button type="button" class="btn btn-danger" id="btn-disconnect-sheets">ตัดการเชื่อมต่อ</button>` : ''}
                        </div>
                    </form>

                    <!-- Syncer Actions -->
                    ${isConnected ? `
                        <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px; display: flex; flex-direction: column; gap: 12px;">
                            <h3 style="font-size:14px; font-weight:700;">คำสั่งประสานข้อมูล (Sync Commands)</h3>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-secondary" id="btn-sync-pull" style="flex:1; font-size:12px; padding: 10px 12px;">
                                    📥 ดึงข้อมูลใหม่จาก Google Sheets
                                </button>
                                <button class="btn btn-secondary" id="btn-sync-push" style="flex:1; font-size:12px; padding: 10px 12px;">
                                    📤 อัปโหลดข้อมูลจำลองปัจจุบันขึ้นชีต
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Column 2: Local Cache Backups (Approach A) -->
                <div class="glass-card" style="padding: 24px; height: fit-content;">
                    <h2 class="card-title">💾 Backup & Restore (สำรองข้อมูล)</h2>
                    <p class="text-secondary" style="font-size: 13px; margin-bottom: 20px; line-height: 1.6;">
                        นำเข้าหรือส่งออกข้อมูลทั้งหมดของคุณเป็นไฟล์สำรองข้อมูล (JSON) เพื่อดาวน์โหลดไปเก็บไว้ใน Google Drive ส่วนตัวของคุณด้วยตนเอง หรือย้ายเครื่องเล่นได้โดยข้อมูลไม่สูญหาย
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 15px;">
                        <!-- Export -->
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 14px; background: rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:10px;">
                            <div>
                                <strong style="font-size:13px; display:block;">ส่งออกไฟล์ข้อมูล (Export JSON)</strong>
                                <span style="font-size:11px; color:var(--text-muted);">ดาวน์โหลดข้อมูลงานและทีมงานทั้งหมดในระบบ</span>
                            </div>
                            <button class="btn btn-primary" id="btn-backup-export" style="font-size:12px; padding: 8px 16px;">ส่งออกข้อมูล</button>
                        </div>

                        <!-- Import -->
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 14px; background: rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:10px;">
                            <div>
                                <strong style="font-size:13px; display:block;">นำเข้าไฟล์ข้อมูล (Import JSON)</strong>
                                <span style="font-size:11px; color:var(--text-muted);">กู้คืนข้อมูลระบบจากไฟล์สำรองข้อมูลเดิม</span>
                            </div>
                            <div>
                                <input type="file" id="input-backup-file" accept=".json" style="display:none;">
                                <button class="btn btn-secondary" id="btn-backup-import-trigger" style="font-size:12px; padding: 8px 16px;">นำเข้าข้อมูล</button>
                            </div>
                        </div>

                        <!-- Clear Database Cache -->
                        <div style="margin-top: 20px; border-top:1px solid var(--border-color); padding-top:20px;">
                            <button class="btn btn-danger" id="btn-reset-cache-db" style="width:100%; font-size:12px; padding: 10px;">
                                ⚠️ ล้างแคชข้อมูลทั้งหมดของแอปพลิเคชัน (Reset Database)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const form = document.getElementById('sheets-config-form');
        const inputUrl = document.getElementById('input-sheets-url');
        const disconnectBtn = document.getElementById('btn-disconnect-sheets');
        const syncPullBtn = document.getElementById('btn-sync-pull');
        const syncPushBtn = document.getElementById('btn-sync-push');

        const exportBtn = document.getElementById('btn-backup-export');
        const importBtnTrigger = document.getElementById('btn-backup-import-trigger');
        const importInput = document.getElementById('input-backup-file');
        const resetBtn = document.getElementById('btn-reset-cache-db');

        // Save URL Settings
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const url = inputUrl.value.trim();
                if (url) {
                    Store.setSheetsUrl(url);
                    Store.publish('toastTriggered', { type: 'success', message: 'เชื่อมต่อลิงก์ Google Sheets สำเร็จ กำลังดึงข้อมูลล่าสุด...' });
                    
                    // Trigger dynamic pulling
                    try {
                        await Store.fetchFromSheets();
                        Store.publish('toastTriggered', { type: 'success', message: 'ดึงข้อมูลจากชีตสำเร็จเรียบร้อยแล้ว' });
                    } catch (err) {
                        Store.publish('toastTriggered', { type: 'warning', message: 'เชื่อมต่อสำเร็จ แต่ดึงข้อมูลไม่สำเร็จ: ' + err.message });
                    }
                    Store.publish('viewChanged', 'settings');
                }
            });
        }

        // Disconnect
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                if (confirm('คุณแน่ใจว่าต้องการตัดการเชื่อมต่อจาก Google Sheets ใช่หรือไม่? ระบบจะสลับไปใช้ Local Storage ในเบราว์เซอร์แทน')) {
                    Store.setSheetsUrl('');
                    Store.publish('toastTriggered', { type: 'info', message: 'ตัดการเชื่อมต่อแล้ว เปลี่ยนโหมดเป็นใช้งานในเครื่อง' });
                    Store.publish('viewChanged', 'settings');
                }
            });
        }

        // Sync Pull
        if (syncPullBtn) {
            syncPullBtn.addEventListener('click', async () => {
                syncPullBtn.disabled = true;
                syncPullBtn.textContent = '⏳ กำลังดาวน์โหลด...';
                try {
                    await Store.fetchFromSheets();
                    Store.publish('toastTriggered', { type: 'success', message: 'ดาวน์โหลดอัปเดตข้อมูลจากชีตสำเร็จ!' });
                } catch (err) {
                    Store.publish('toastTriggered', { type: 'danger', message: 'การดาวน์โหลดล้มเหลว: ' + err.message });
                } finally {
                    syncPullBtn.disabled = false;
                    syncPullBtn.textContent = '📥 ดึงข้อมูลใหม่จาก Google Sheets';
                }
            });
        }

        // Sync Push (Seeding)
        if (syncPushBtn) {
            syncPushBtn.addEventListener('click', async () => {
                if (confirm('คำเตือน: คำสั่งนี้จะทำการนำข้อมูลจำลองของ G-Flow ทั้งหมดในเครื่องไปเขียนทับแผ่นชีตเดิม เหมาะสำหรับกรณีเริ่มใช้งานชีตครั้งแรกที่ชีตว่างเปล่า ต้องการอัปโหลดต่อไปหรือไม่?')) {
                    syncPushBtn.disabled = true;
                    syncPushBtn.textContent = '⏳ กำลังอัปโหลด...';
                    try {
                        await Store.pushAllToSheets();
                        Store.publish('toastTriggered', { type: 'success', message: 'ซี้ดอัปโหลดข้อมูลปัจจุบันขึ้นชีตเรียบร้อย!' });
                    } catch (err) {
                        Store.publish('toastTriggered', { type: 'danger', message: 'การอัปโหลดล้มเหลว: ' + err.message });
                    } finally {
                        syncPushBtn.disabled = false;
                        syncPushBtn.textContent = '📤 อัปโหลดข้อมูลจำลองปัจจุบันขึ้นชีต';
                    }
                }
            });
        }

        // Backup Export JSON (Approach A)
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const backupData = {
                    gf_users: Store.getUsers(),
                    gf_tasks: Store.getTasks(),
                    gf_comments: Store.getComments(),
                    gf_logs: Store.getActivityLogs(),
                    gf_notifications: Store.getNotifications()
                };

                const jsonString = JSON.stringify(backupData, null, 4);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `gflow_backup_${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                Store.publish('toastTriggered', { type: 'success', message: 'ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยแล้ว' });
            });
        }

        // Backup Import Trigger
        if (importBtnTrigger) {
            importBtnTrigger.addEventListener('click', () => {
                importInput.click();
            });
        }

        // Backup File Import handler
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target.result);
                        
                        // Validation
                        if (imported.gf_users && imported.gf_tasks) {
                            localStorage.setItem('gf_users', JSON.stringify(imported.gf_users));
                            localStorage.setItem('gf_tasks', JSON.stringify(imported.gf_tasks));
                            if (imported.gf_comments) localStorage.setItem('gf_comments', JSON.stringify(imported.gf_comments));
                            if (imported.gf_logs) localStorage.setItem('gf_logs', JSON.stringify(imported.gf_logs));
                            if (imported.gf_notifications) localStorage.setItem('gf_notifications', JSON.stringify(imported.gf_notifications));

                            Store.publish('toastTriggered', { type: 'success', message: 'นำเข้าข้อมูลสำรองสำเร็จ! ระบบจะทำการรีโหลดหน้าจอ' });
                            
                            // Publish update triggers
                            Store.publish('tasksChanged', Store.getTasks());
                            Store.publish('userSessionChanged', Store.getCurrentUser());
                            Store.publish('viewChanged', 'settings');
                        } else {
                            throw new Error("โครงสร้างไฟล์ข้อมูลไม่สมบูรณ์");
                        }
                    } catch (err) {
                        Store.publish('toastTriggered', { type: 'danger', message: 'การอ่านไฟล์ข้อมูลล้มเหลว: ' + err.message });
                    }
                };
                reader.readAsText(file);
                // Clear input
                importInput.value = '';
            });
        }

        // Reset Application Cache Database
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('คำเตือนร้ายแรง: คุณกำลังจะลบข้อมูลงานดีไซน์ กิจกรรม คอมเมนต์ทั้งหมดที่จัดเก็บไว้ในคอมพิวเตอร์เครื่องนี้เพื่อเริ่มต้นแอปใหม่ทั้งหมด คุณแน่ใจใช่หรือไม่?')) {
                    localStorage.removeItem('gf_users');
                    localStorage.removeItem('gf_tasks');
                    localStorage.removeItem('gf_comments');
                    localStorage.removeItem('gf_logs');
                    localStorage.removeItem('gf_notifications');
                    localStorage.removeItem('gf_sheets_url');
                    localStorage.removeItem('gf_active_user');
                    
                    Store.publish('toastTriggered', { type: 'danger', message: 'ล้างข้อมูลสำเร็จแล้ว ทำการโหลดระบบใหม่...' });
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            });
        }
    }
};
