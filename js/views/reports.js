// G-Flow Reports & Summary View Component
import { Store } from '../store.js';

export const ReportsView = {
    render() {
        const tasks = Store.getTasks();
        const users = Store.getUsers();
        const designers = users.filter(u => u.role === 'designer');

        // General Stats
        const totalTasksCount = tasks.length;
        const doneTasks = tasks.filter(t => t.status === 'Done' || t.status === 'Approved');
        const doneCount = doneTasks.length;
        const inProgressCount = tasks.filter(t => t.status === 'In Design').length;
        const reviewCount = tasks.filter(t => t.status === 'Review').length;
        const revisionCount = tasks.filter(t => t.status === 'Revision').length;
        const waitingCount = tasks.filter(t => t.status === 'Waiting Info').length;
        
        // On Time vs Overdue
        let onTimeCount = 0;
        let overdueCount = 0;
        
        doneTasks.forEach(task => {
            const due = new Date(task.due_date);
            const completed = task.completed_date ? new Date(task.completed_date) : due;
            if (completed <= due) {
                onTimeCount++;
            } else {
                overdueCount++;
            }
        });

        const activeOverdue = tasks.filter(t => {
            if (t.status === 'Done' || t.status === 'Approved' || t.status === 'Cancelled') return false;
            return new Date(t.due_date) < new Date();
        }).length;

        const onTimeRate = doneCount > 0 ? Math.round((onTimeCount / doneCount) * 100) : 100;

        // Revision stats
        const totalRevisions = doneTasks.reduce((sum, t) => sum + (t.revision_round || 0), 0);
        const avgRevisions = doneCount > 0 ? (totalRevisions / doneCount).toFixed(1) : '0.0';

        // Work durations (in hours/days)
        let totalWorkTimeHours = 0;
        let tasksWithDuration = 0;
        doneTasks.forEach(t => {
            if (t.start_date && t.completed_date) {
                const hours = (new Date(t.completed_date) - new Date(t.start_date)) / (1000 * 60 * 60);
                totalWorkTimeHours += hours;
                tasksWithDuration++;
            }
        });
        const avgWorkTimeDays = tasksWithDuration > 0 
            ? (totalWorkTimeHours / 24 / tasksWithDuration).toFixed(1) 
            : '0.0';

        // Designer Breakdown Table Data
        const designerPerformance = designers.map(designer => {
            const designerTasks = tasks.filter(t => t.assigned_to === designer.id);
            const finishedTasks = designerTasks.filter(t => t.status === 'Done' || t.status === 'Approved');
            const activeCount = designerTasks.filter(t => t.status !== 'Done' && t.status !== 'Approved' && t.status !== 'Cancelled').length;
            
            let designerOnTime = 0;
            finishedTasks.forEach(t => {
                const due = new Date(t.due_date);
                const completed = t.completed_date ? new Date(t.completed_date) : due;
                if (completed <= due) designerOnTime++;
            });
            const designerOnTimeRate = finishedTasks.length > 0 ? Math.round((designerOnTime / finishedTasks.length) * 100) : 100;
            const designerRevisions = finishedTasks.reduce((sum, t) => sum + (t.revision_round || 0), 0);
            const designerAvgRevisions = finishedTasks.length > 0 ? (designerRevisions / finishedTasks.length).toFixed(1) : '0.0';

            return {
                name: designer.name,
                total: designerTasks.length,
                completed: finishedTasks.length,
                active: activeCount,
                onTimeRate: designerOnTimeRate,
                avgRevisions: designerAvgRevisions
            };
        });

        // Time Period Summaries (Seeded logs data analysis)
        // Group by days, weeks, months
        const logs = Store.getActivityLogs();
        const completedLogs = logs.filter(l => l.action === 'Approve Task' || (l.action === 'Change Status' && l.new_value === 'Done'));
        
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        const completedToday = completedLogs.filter(l => (now - new Date(l.created_at)) <= oneDayMs).length;
        const completedThisWeek = completedLogs.filter(l => (now - new Date(l.created_at)) <= 7 * oneDayMs).length;
        const completedThisMonth = completedLogs.filter(l => (now - new Date(l.created_at)) <= 30 * oneDayMs).length;

        return `
            <div class="reports-view-container animate-slide-in">
                <!-- Overview Stats Grid -->
                <div class="reports-grid-summary">
                    <!-- Core Performance Metrics -->
                    <div class="report-metrics-card glass-card">
                        <h2 class="card-title">ตัวชี้วัดประสิทธิภาพการทำงาน (KPI)</h2>
                        <div class="report-metrics-container">
                            <div class="metric-box">
                                <span class="metric-title">อัตราตรงเวลา</span>
                                <span class="metric-num">${onTimeRate}%</span>
                                <span class="metric-percentage ${onTimeRate < 80 ? 'bad' : ''}">
                                    ${onTimeRate >= 80 ? '🔥 ความเร็วดีเยี่ยม' : '⚠️ ส่งงานล่าช้า'}
                                </span>
                            </div>
                            <div class="metric-box">
                                <span class="metric-title">เฉลี่ยรอบแก้ไข</span>
                                <span class="metric-num">${avgRevisions} รอบ</span>
                                <span class="metric-percentage ${parseFloat(avgRevisions) > 1.5 ? 'bad' : ''}">
                                    ${parseFloat(avgRevisions) <= 1.5 ? '👍 บรีฟงานชัดเจน' : '💬 แก้ไขหลายจุด'}
                                </span>
                            </div>
                            <div class="metric-box">
                                <span class="metric-title">ระยะเวลาส่งงานเฉลี่ย</span>
                                <span class="metric-num">${avgWorkTimeDays} วัน</span>
                                <span class="metric-percentage">
                                    ⏱️ เฉลี่ยวันต่อชิ้นงาน
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Time Period Deliveries Summary -->
                    <div class="report-metrics-card glass-card">
                        <h2 class="card-title">จำนวนงานที่ทำเสร็จในแต่ละช่วงเวลา</h2>
                        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:600; font-size:13px;">เสร็จสิ้นวันนี้</span>
                                <span class="tag status-approved" style="font-size:12px; padding: 4px 12px; border-radius:8px;">${completedToday} งาน</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:600; font-size:13px;">เสร็จสิ้นสัปดาห์นี้</span>
                                <span class="tag status-indesign" style="font-size:12px; padding: 4px 12px; border-radius:8px;">${completedThisWeek} งาน</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:600; font-size:13px;">เสร็จสิ้นเดือนนี้</span>
                                <span class="tag status-new" style="font-size:12px; padding: 4px 12px; border-radius:8px;">${completedThisMonth} งาน</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Designer Breakdown Table -->
                <div class="designer-table-card glass-card">
                    <h2 class="card-title">ตารางสรุปผลงานรายบุคคลของดีไซเนอร์</h2>
                    <table class="designer-table">
                        <thead>
                            <tr>
                                <th>ชื่อนักออกแบบ</th>
                                <th>งานที่ได้รับทั้งหมด</th>
                                <th>ปิดงานสำเร็จ</th>
                                <th>กำลังดำเนินการ</th>
                                <th>อัตราส่งตรงเวลา</th>
                                <th>จำนวนแก้ไขเฉลี่ย</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${designerPerformance.map(d => `
                                <tr class="designer-row">
                                    <td class="table-designer-name">${d.name}</td>
                                    <td>${d.total}</td>
                                    <td>${d.completed}</td>
                                    <td>${d.active}</td>
                                    <td style="font-weight:600; color: ${d.onTimeRate < 80 ? '#f43f5e' : '#10b981'};">${d.onTimeRate}%</td>
                                    <td>${d.avgRevisions} รอบ</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Current Backlog Summary -->
                <div class="glass-card" style="margin-top: 30px; padding: 24px;">
                    <h2 class="card-title">งานค้างสะสมตามสถานะการปฏิบัติงาน</h2>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; margin-top: 15px;">
                        <div>
                            <span style="font-size: 11px; color: var(--text-muted); font-weight:600; text-transform: uppercase;">รอข้อมูล (Waiting Info)</span>
                            <div style="font-size:24px; font-weight:700; margin-top:6px; color: var(--color-waiting);">${waitingCount}</div>
                        </div>
                        <div>
                            <span style="font-size: 11px; color: var(--text-muted); font-weight:600; text-transform: uppercase;">กำลังออกแบบ (In Design)</span>
                            <div style="font-size:24px; font-weight:700; margin-top:6px; color: var(--color-indesign);">${inProgressCount}</div>
                        </div>
                        <div>
                            <span style="font-size: 11px; color: var(--text-muted); font-weight:600; text-transform: uppercase;">รอตรวจทาน (Review)</span>
                            <div style="font-size:24px; font-weight:700; margin-top:6px; color: var(--color-review);">${reviewCount}</div>
                        </div>
                        <div>
                            <span style="font-size: 11px; color: var(--text-muted); font-weight:600; text-transform: uppercase;">ส่งแก้ (Revision)</span>
                            <div style="font-size:24px; font-weight:700; margin-top:6px; color: var(--color-revision);">${revisionCount}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // No heavy bindings needed for static reports, but we can hook export options here in future
    }
};
