// G-Flow Shared State Store with Google Sheets Sync

// Default Seed Data
const DEFAULT_USERS = [
    { id: 'admin', name: 'Administrator', email: 'admin@gflow.com', role: 'admin', department: 'IT', position: 'SysAdmin', status: 'active', avatar: 'AD' },
    { id: 'pim', name: 'Pim (Manager)', email: 'pim@gflow.com', role: 'manager', department: 'Creative', position: 'Creative Director', status: 'active', avatar: 'P' },
    { id: 'art', name: 'Art (Designer)', email: 'art@gflow.com', role: 'designer', department: 'Graphic Design', position: 'Senior Graphic Designer', status: 'active', avatar: 'A' },
    { id: 'bank', name: 'Bank (Designer)', email: 'bank@gflow.com', role: 'designer', department: 'Graphic Design', position: 'Graphic Designer', status: 'active', avatar: 'B' },
    { id: 'cherry', name: 'Cherry (Designer)', email: 'cherry@gflow.com', role: 'designer', department: 'Graphic Design', position: 'Junior Graphic Designer', status: 'active', avatar: 'C' }
];

const DEFAULT_TASKS = [
    {
        task_id: 'TASK-101',
        task_name: 'ออกแบบ Cover Page Facebook - แคมเปญ Mid-Year Sale',
        description: 'ออกแบบแบนเนอร์ Cover Page สำหรับแฟนเพจหลัก เน้นความโดดเด่นของโปรโมชั่นลดสูงสุด 50% และโปรโมชั่นซื้อ 1 แถม 1',
        task_type: 'Static Image',
        assigned_to: 'art',
        created_by: 'pim',
        request_date: '2026-07-01T09:00:00Z',
        start_date: '2026-07-02T10:00:00Z',
        due_date: '2026-07-08T18:00:00Z',
        completed_date: null,
        status: 'In Design',
        priority: 'high',
        category: 'Campaign',
        platform: 'Facebook',
        post_type: 'Cover Page',
        size_ratio: '16:9 (820x360 px)',
        brief: 'บรีฟงาน: ต้องการภาพโทนสีม่วง-เหลือง โดดเด่นสะดุดตา ตัวหนังสือโปรโมชั่นตัวใหญ่ชัดเจน มีรูปสินค้าขายดี 3 รายการประกอบในภาพ',
        objective: 'เพื่อโปรโมทแคมเปญ Mid-Year Sale ประจำเดือนกรกฎาคม',
        target_audience: 'ลูกค้าทั่วไป อายุ 18-45 ปี ที่ชื่นชอบการช้อปปิ้งออนไลน์',
        key_message: 'Mid-Year Sale ลดใหญ่สุดในรอบปี! ลดสูงสุด 50% + ซื้อ 1 แถม 1 เฉพาะ 7-9 ก.ค. นี้เท่านั้น',
        cta: 'ช้อปเลยที่หน้าเว็บ',
        must_include: 'Logo แบรนด์, ป้ายราคาลด 50%, วันที่แคมเปญ',
        must_avoid: 'อย่าใช้สีจืดชืดห้ามใช้ฟอนต์อ่านยาก',
        reference_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
        reference_file: '',
        mood_tone: 'Energetic, Vibrant, Modern',
        design_style: 'Minimal Bold',
        color_tone: 'Purple (#8B5CF6) & Yellow (#F59E0B)',
        asset_url: 'https://drive.google.com/drive/folders/mock-assets-midyear',
        final_file_url: '',
        final_file_type: '',
        reviewer: 'pim',
        review_status: 'pending',
        revision_round: 0,
        feedback: '',
        brand: 'PUMA'
    },
    {
        task_id: 'TASK-102',
        task_name: 'ดีไซน์โพสต์ Carousel LINE OA - โปรโมทสินค้าใหม่คอลเลกชันฤดูร้อน',
        description: 'ออกแบบภาพสำหรับส่งบรอดแคสต์ LINE OA จำนวน 4 การ์ด เพื่อเปิดตัวสินค้าครีมกันแดดและสเปรย์น้ำแร่สูตรใหม่',
        task_type: 'Carousel',
        assigned_to: 'cherry',
        created_by: 'pim',
        request_date: '2026-07-05T11:00:00Z',
        start_date: null,
        due_date: '2026-07-10T15:00:00Z',
        completed_date: null,
        status: 'New Brief',
        priority: 'medium',
        category: 'New Product',
        platform: 'LINE OA',
        post_type: 'Rich Messages / Carousel',
        size_ratio: '1:1 (1040x1040 px)',
        brief: 'บรีฟงาน: ออกแบบการ์ด 4 ใบ การ์ดที่ 1 หน้าปกเปิดตัวคอลเลกชัน, การ์ดที่ 2 รายละเอียดครีมกันแดด SPF50+, การ์ดที่ 3 สเปรย์น้ำแร่ออร์แกนิก, การ์ดที่ 4 โปรโมชั่นจับคู่พิเศษ',
        objective: 'เปิดตัวและกระตุ้นยอดขายครีมกันแดดและสเปรย์น้ำแร่สูตรใหม่ต้อนรับหน้าร้อน',
        target_audience: 'ผู้หญิงรักการบำรุงผิว อายุ 20-35 ปี',
        key_message: 'ต้อนรับซัมเมอร์ด้วยผิวออร่าท้าแดด คลีน&โกลว์ตลอดวัน',
        cta: 'คลิกซื้อเลย',
        must_include: 'ผ่านการทดสอบโดยแพทย์ผิวหนัง, สัญลักษณ์ SPF50+ PA++++',
        must_avoid: 'อย่าเขียนข้อความยาวเกินไปในการ์ดแต่ละใบ',
        reference_url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6',
        reference_file: '',
        mood_tone: 'Clean, Fresh, Bright, Pastel',
        design_style: 'Minimalist Clean',
        color_tone: 'Sky Blue, Soft Coral, Sand Yellow',
        asset_url: 'https://drive.google.com/drive/folders/mock-assets-summer-skincare',
        final_file_url: '',
        final_file_type: '',
        reviewer: 'pim',
        review_status: 'pending',
        revision_round: 0,
        feedback: '',
        brand: 'WADFOW'
    },
    {
        task_id: 'TASK-103',
        task_name: 'ตกแต่งแบนเนอร์หน้าร้าน Shopee & Lazada - แคมเปญ Double Day 7.7',
        description: 'แบนเนอร์ตกแต่งหน้าร้านค้าออนไลน์ Shopee/Lazada ขนาดใหญ่เพื่อรองรับแคมเปญ 7.7',
        task_type: 'Static Image',
        assigned_to: 'bank',
        created_by: 'pim',
        request_date: '2026-06-20T08:00:00Z',
        start_date: '2026-06-21T09:00:00Z',
        due_date: '2026-07-06T12:00:00Z',
        completed_date: null,
        status: 'Review',
        priority: 'urgent',
        category: 'Campaign',
        platform: 'Shopee',
        post_type: 'Shop Decoration Banner',
        size_ratio: '16:9 (1200x675 px)',
        brief: 'บรีฟงาน: ทำป้ายแบนเนอร์ใหญ่บอกโปรโมชั่นหลัก ส่งฟรี ไม่มีขั้นต่ำ + โค้ดลดเพิ่ม 100 บาท',
        objective: 'ตกแต่งหน้าร้านค้าเพื่อกระตุ้นยอดขายช่วงแคมเปญใหญ่ 7.7',
        target_audience: 'นักช้อป Shopee/Lazada',
        key_message: '7.7 Double Day Sale โค้ดเดือดส่งฟรีทั้งวัน ลดกระหน่ำสูงสุด 70%',
        cta: 'เก็บโค้ดเลย',
        must_include: 'ป้าย 7.7, โลโก้แบรนด์, ข้อความ ส่งฟรีขั้นต่ำ 0.-',
        must_avoid: 'อย่าจัดเลย์เอาท์อึดอัด',
        reference_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
        reference_file: '',
        mood_tone: 'Exciting, High-energy, Neon',
        design_style: 'E-commerce Commercial Bold',
        color_tone: 'Orange & Neon Cyan',
        asset_url: 'https://drive.google.com/drive/folders/mock-assets-77-sale',
        final_file_url: 'https://drive.google.com/file/d/mock-banner-77-final-v1.jpg',
        final_file_type: 'JPG',
        reviewer: 'pim',
        review_status: 'pending',
        revision_round: 1,
        feedback: 'อยากให้ฟอนต์ราคาโปรโมชั่นลด 70% ตัวหนากว่านี้หน่อย และขยับโลโก้ไว้มุมขวาบนแทน',
        brand: 'PUMA'
    }
];

const DEFAULT_COMMENTS = [
    { comment_id: 'C-201', task_id: 'TASK-103', user_id: 'bank', comment: 'ผมได้อัปโหลดไฟล์ดราฟท์แรกแล้วครับ รบกวนตรวจด้วยนะครับป้ายราคาลด 70% ค่อนข้างเด่น', created_at: '2026-07-05T14:30:00Z' },
    { comment_id: 'C-202', task_id: 'TASK-103', user_id: 'pim', comment: 'อยากให้ฟอนต์ราคาโปรโมชั่นลด 70% ตัวหนากว่านี้หน่อย และขยับโลโก้ไว้มุมขวาบนแทน', created_at: '2026-07-06T09:15:00Z' }
];

const DEFAULT_LOGS = [
    { log_id: 'L-301', task_id: 'TASK-101', user_id: 'pim', action: 'Create Task', old_value: '', new_value: 'New Brief', created_at: '2026-07-01T09:00:00Z' },
    { log_id: 'L-302', task_id: 'TASK-101', user_id: 'art', action: 'Change Status', old_value: 'New Brief', new_value: 'In Design', created_at: '2026-07-02T10:00:00Z' },
    { log_id: 'L-303', task_id: 'TASK-103', user_id: 'pim', action: 'Create Task', old_value: '', new_value: 'New Brief', created_at: '2026-06-20T08:00:00Z' }
];

const DEFAULT_NOTIFICATIONS = [
    { id: 'N-401', user_id: 'art', message: 'คุณได้รับมอบหมายงานใหม่: ออกแบบ Cover Page Facebook - แคมเปญ Mid-Year Sale', is_read: false, created_at: '2026-07-01T09:05:00Z', task_id: 'TASK-101' }
];

// Helper to initialize local storage
function initLocalStorage() {
    if (!localStorage.getItem('gf_users')) {
        localStorage.setItem('gf_users', JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem('gf_tasks')) {
        localStorage.setItem('gf_tasks', JSON.stringify(DEFAULT_TASKS));
    }
    if (!localStorage.getItem('gf_comments')) {
        localStorage.setItem('gf_comments', JSON.stringify(DEFAULT_COMMENTS));
    }
    if (!localStorage.getItem('gf_logs')) {
        localStorage.setItem('gf_logs', JSON.stringify(DEFAULT_LOGS));
    }
    if (!localStorage.getItem('gf_notifications')) {
        localStorage.setItem('gf_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    if (!localStorage.getItem('gf_active_user')) {
        localStorage.setItem('gf_active_user', 'pim');
    }
}

initLocalStorage();

// Pub-Sub Event Store
const listeners = {};

export const Store = {
    // -------------------------------------------------------------
    // Subscriber management
    // -------------------------------------------------------------
    subscribe(event, callback) {
        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(callback);
    },

    publish(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(cb => cb(data));
        }
    },

    // -------------------------------------------------------------
    // Google Sheets Settings
    // -------------------------------------------------------------
    getSheetsUrl() {
        return localStorage.getItem('gf_sheets_url') || '';
    },

    setSheetsUrl(url) {
        if (url) {
            localStorage.setItem('gf_sheets_url', url.trim());
        } else {
            localStorage.removeItem('gf_sheets_url');
        }
        this.publish('sheetsUrlChanged', url);
    },

    // Background HTTP POST caller for database mutations (Optimistic UI)
    async postToSheets(action, data) {
        const url = this.getSheetsUrl();
        if (!url) return;

        try {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'no-cors', // Standard Apps Script CORS bypass method for simple POSTs
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, data })
            });
            // Due to no-cors mode, we won't read response bytes directly,
            // but the browser will trigger the POST request successfully.
        } catch (error) {
            console.error("Failed to sync change with Google Sheets: ", error);
        }
    },

    // Pull entire DB from Google Sheets (Sync Pull)
    async fetchFromSheets() {
        const url = this.getSheetsUrl();
        if (!url) return false;

        try {
            const response = await fetch(url);
            const result = await response.json();

            if (result.success && result.data) {
                const data = result.data;
                
                // Write keys to localStorage cache
                if (data.Users && data.Users.length > 0) {
                    localStorage.setItem('gf_users', JSON.stringify(data.Users));
                }
                if (data.Tasks) {
                    // Convert back string-based numbers and null values correctly
                    const cleanedTasks = data.Tasks.map(t => ({
                        ...t,
                        revision_round: parseInt(t.revision_round) || 0,
                        completed_date: t.completed_date || null,
                        start_date: t.start_date || null
                    }));
                    localStorage.setItem('gf_tasks', JSON.stringify(cleanedTasks));
                }
                if (data.Comments) {
                    localStorage.setItem('gf_comments', JSON.stringify(data.Comments));
                }
                if (data.ActivityLog) {
                    localStorage.setItem('gf_logs', JSON.stringify(data.ActivityLog));
                }
                if (data.Notifications) {
                    const cleanedNotifs = data.Notifications.map(n => ({
                        ...n,
                        is_read: n.is_read === true || n.is_read === "TRUE" || n.is_read === "true"
                    }));
                    localStorage.setItem('gf_notifications', JSON.stringify(cleanedNotifs));
                }

                // Publish events
                this.publish('tasksChanged', this.getTasks());
                this.publish('notificationsChanged', this.getNotifications(this.getCurrentUser().id));
                this.publish('userSessionChanged', this.getCurrentUser());
                
                return true;
            } else {
                throw new Error(result.error || "Unknown server error");
            }
        } catch (error) {
            console.error("Error pulling data from Google Sheets: ", error);
            throw error;
        }
    },

    // Push local database cache to seed Google Sheets
    async pushAllToSheets() {
        const url = this.getSheetsUrl();
        if (!url) throw new Error("No Google Sheets URL configured.");

        const payload = {
            Users: this.getUsers(),
            Tasks: this.getTasks(),
            Comments: this.getComments(),
            ActivityLog: this.getActivityLogs(),
            Notifications: this.getNotifications()
        };

        try {
            // Apps Script web app redirect requires standard POST
            const response = await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'syncAll', data: payload })
            });
            return true;
        } catch (error) {
            console.error("Failed to push seeding data to Google Sheets: ", error);
            throw error;
        }
    },

    // -------------------------------------------------------------
    // User management
    // -------------------------------------------------------------
    getUsers() {
        return JSON.parse(localStorage.getItem('gf_users')) || [];
    },

    getUserById(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId);
    },

    saveUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index > -1) {
            users[index] = user;
        } else {
            users.push(user);
        }
        localStorage.setItem('gf_users', JSON.stringify(users));
        this.publish('usersChanged', users);

        // Sync to sheet
        this.postToSheets("saveUser", user);
    },

    deleteUser(userId) {
        let users = this.getUsers();
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('gf_users', JSON.stringify(users));
        this.publish('usersChanged', users);

        // Sync to sheet
        this.postToSheets("deleteUser", { id: userId });
    },

    getCurrentUser() {
        const activeId = localStorage.getItem('gf_active_user');
        return this.getUserById(activeId) || this.getUsers()[0];
    },

    setCurrentUser(userId) {
        localStorage.setItem('gf_active_user', userId);
        this.publish('userSessionChanged', this.getUserById(userId));
    },

    // -------------------------------------------------------------
    // Tasks management
    // -------------------------------------------------------------
    getTasks() {
        return JSON.parse(localStorage.getItem('gf_tasks')) || [];
    },

    getTaskById(taskId) {
        const tasks = this.getTasks();
        return tasks.find(t => t.task_id === taskId);
    },

    saveTask(task) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.task_id === task.task_id);
        
        let oldStatus = '';
        if (index > -1) {
            oldStatus = tasks[index].status;
            tasks[index] = { ...tasks[index], ...task };
        } else {
            const newNum = tasks.length > 0 
                ? Math.max(...tasks.map(t => parseInt(t.task_id.split('-')[1]) || 100)) + 1 
                : 101;
            task.task_id = `TASK-${newNum}`;
            task.request_date = new Date().toISOString();
            task.revision_round = 0;
            task.review_status = 'pending';
            tasks.push(task);
        }

        localStorage.setItem('gf_tasks', JSON.stringify(tasks));
        
        const activeUser = this.getCurrentUser();
        if (index === -1) {
            this.addActivityLog(task.task_id, activeUser.id, 'Create Task', '', task.status);
            if (task.assigned_to) {
                this.addNotification(task.assigned_to, `คุณได้รับมอบหมายงานใหม่: ${task.task_name}`, task.task_id);
            }
        } else if (oldStatus !== task.status) {
            this.addActivityLog(task.task_id, activeUser.id, 'Change Status', oldStatus, task.status);
            this.handleStatusChangeNotifications(task, oldStatus, task.status, activeUser.id);
        }

        this.publish('tasksChanged', tasks);

        // Sync task record to sheet
        this.postToSheets("saveTask", task);

        return task;
    },

    handleStatusChangeNotifications(task, oldStatus, newStatus, currentUserId) {
        if (newStatus === 'Review') {
            const manager = this.getUsers().find(u => u.role === 'manager') || { id: 'pim' };
            this.addNotification(manager.id, `${this.getUserById(task.assigned_to).name} ส่งงาน ${task.task_id} ให้คุณตรวจ`, task.task_id);
        } else if (newStatus === 'Revision') {
            this.addNotification(task.assigned_to, `งาน ${task.task_id} มีคอมเมนต์/สั่งแก้ไขจากหัวหน้างาน`, task.task_id);
        } else if (newStatus === 'Done') {
            this.addNotification(task.assigned_to, `ยินดีด้วย! งาน ${task.task_id} ได้รับการอนุมัติและเสร็จสมบูรณ์แล้ว`, task.task_id);
        } else if (newStatus === 'Waiting Info') {
            const manager = this.getUsers().find(u => u.role === 'manager') || { id: 'pim' };
            this.addNotification(manager.id, `งาน ${task.task_id} ถูกเปลี่ยนสถานะเป็น "รอข้อมูลเพิ่มเติม"`, task.task_id);
        }
    },

    deleteTask(taskId) {
        let tasks = this.getTasks();
        tasks = tasks.filter(t => t.task_id !== taskId);
        localStorage.setItem('gf_tasks', JSON.stringify(tasks));
        this.publish('tasksChanged', tasks);

        // Sync delete to sheet
        this.postToSheets("deleteTask", { task_id: taskId });
    },

    // -------------------------------------------------------------
    // Comments management
    // -------------------------------------------------------------
    getComments(taskId) {
        const comments = JSON.parse(localStorage.getItem('gf_comments')) || [];
        if (taskId) {
            return comments.filter(c => c.task_id === taskId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        return comments;
    },

    addComment(taskId, userId, commentText) {
        const comments = this.getComments();
        const newComment = {
            comment_id: `C-${Date.now()}`,
            task_id: taskId,
            user_id: userId,
            comment: commentText,
            created_at: new Date().toISOString()
        };
        comments.push(newComment);
        localStorage.setItem('gf_comments', JSON.stringify(comments));

        this.publish('commentsChanged', { taskId, comments: this.getComments(taskId) });
        this.addActivityLog(taskId, userId, 'Add Comment', '', commentText.substring(0, 50));
        
        const task = this.getTaskById(taskId);
        if (task) {
            if (userId === task.assigned_to) {
                const manager = this.getUsers().find(u => u.role === 'manager') || { id: 'pim' };
                this.addNotification(manager.id, `${this.getUserById(userId).name} เพิ่มคอมเมนต์ใหม่ในงาน ${taskId}`, taskId);
            } else {
                this.addNotification(task.assigned_to, `มีคอมเมนต์ใหม่จากหัวหน้าในงาน ${taskId}`, taskId);
            }
        }

        // Sync comment record to sheet
        this.postToSheets("addComment", newComment);

        return newComment;
    },

    // -------------------------------------------------------------
    // Activity Log management
    // -------------------------------------------------------------
    getActivityLogs(taskId) {
        const logs = JSON.parse(localStorage.getItem('gf_logs')) || [];
        if (taskId) {
            return logs.filter(l => l.task_id === taskId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    addActivityLog(taskId, userId, action, oldValue, newValue) {
        const logs = JSON.parse(localStorage.getItem('gf_logs')) || [];
        const newLog = {
            log_id: `L-${Date.now()}`,
            task_id: taskId,
            user_id: userId,
            action,
            old_value: oldValue,
            new_value: newValue,
            created_at: new Date().toISOString()
        };
        logs.push(newLog);
        localStorage.setItem('gf_logs', JSON.stringify(logs));
        this.publish('logsChanged', logs);

        // Sync log record to sheet
        this.postToSheets("addLog", newLog);
    },

    // -------------------------------------------------------------
    // Notifications management
    // -------------------------------------------------------------
    getNotifications(userId) {
        const notifs = JSON.parse(localStorage.getItem('gf_notifications')) || [];
        if (userId) {
            return notifs.filter(n => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    addNotification(userId, message, taskId = '') {
        const notifs = JSON.parse(localStorage.getItem('gf_notifications')) || [];
        const newNotif = {
            id: `N-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            user_id: userId,
            message,
            is_read: false,
            created_at: new Date().toISOString(),
            task_id: taskId
        };
        notifs.push(newNotif);
        localStorage.setItem('gf_notifications', JSON.stringify(notifs));
        
        const userNotifs = this.getNotifications(userId);
        this.publish('notificationsChanged', userNotifs);
        this.publish('toastTriggered', { type: 'info', message });

        // Sync updated notifications to sheet
        this.postToSheets("updateNotifications", userNotifs);
    },

    markNotificationsAsRead(userId) {
        let notifs = JSON.parse(localStorage.getItem('gf_notifications')) || [];
        notifs = notifs.map(n => {
            if (n.user_id === userId) {
                return { ...n, is_read: true };
            }
            return n;
        });
        localStorage.setItem('gf_notifications', JSON.stringify(notifs));
        
        const userNotifs = this.getNotifications(userId);
        this.publish('notificationsChanged', userNotifs);

        // Sync updated notifications to sheet
        this.postToSheets("updateNotifications", userNotifs);
    },

    clearNotifications(userId) {
        let notifs = JSON.parse(localStorage.getItem('gf_notifications')) || [];
        notifs = notifs.filter(n => n.user_id !== userId);
        localStorage.setItem('gf_notifications', JSON.stringify(notifs));
        this.publish('notificationsChanged', []);

        // Sync updated notifications to sheet
        this.postToSheets("updateNotifications", []);
    }
};
