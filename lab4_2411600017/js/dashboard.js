document.addEventListener('DOMContentLoaded', async function () {

    // 1. Direct Logout Event Handlers
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.getElementById('logoutLink');

    function performLogout(e) {
        if (e) e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    if (logoutBtn) logoutBtn.addEventListener('click', performLogout);
    if (logoutLink) logoutLink.addEventListener('click', performLogout);

    // 2. Authentication Check
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('user') || 'admin';

    // Update Greeting and Navbar Name
    updateGreeting(username);
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) userNameSpan.textContent = username;

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    function getFilteredData() {
        const query = searchInput ? searchInput.value : '';
        const category = categoryFilter ? categoryFilter.value : 'ALL';
        const status = statusFilter ? statusFilter.value : 'ALL';
        return DataManager.filterCourses(query, category, status);
    }

    function renderDashboard() {
        const allCourses = DataManager.getCourses();
        const filteredData = getFilteredData();

        populateCoursesTable(filteredData);
        updateStatistics(allCourses);
        ChartConfig.updateCharts(allCourses);
        checkGradeAlerts(allCourses);
    }

    // 4. Initialize Visual Charts
    ChartConfig.initBarChart('gradeBarChart');
    ChartConfig.initDoughnutChart('statusDoughnutChart');

    // 5. Fetch JSON Data Safely
    try {
        await DataManager.fetchCourses();
    } catch (err) {
        console.warn("Using fallback data dataset.");
    }

    // 6. Initial UI Render
    renderDashboard();
    populateActivityTable();

    // 7. Setup Event Listeners
    if (searchInput) searchInput.addEventListener('input', renderDashboard);
    if (categoryFilter) categoryFilter.addEventListener('change', renderDashboard);
    if (statusFilter) statusFilter.addEventListener('change', renderDashboard);

    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            DataManager.exportToCSV(getFilteredData());
        });
    }

    // 8. AUTOMATIC REAL-TIME UPDATE (Kusa nang nag-u-update bawat 5 segundo)
    setInterval(() => {
        const updatedCourse = DataManager.simulateUpdate();
        if (updatedCourse) {
            renderDashboard();
            showAlert(`Real-Time Update: ${updatedCourse.code} grade changed to ${updatedCourse.grade}%`, 'info');
        }
    }, 5000); // 5000ms = 5 Seconds (pwedeng baguhin kung kailangan)

});

function updateGreeting(username) {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let timeOfDay = 'Good Morning';

    if (hour >= 12 && hour < 17) timeOfDay = 'Good Afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'Good Evening';
    else if (hour >= 21 || hour < 5) timeOfDay = 'Good Night';

    greetingElement.textContent = `${timeOfDay}, ${username}!`;
}

function updateStatistics(coursesList) {
    if (!coursesList || coursesList.length === 0) return;

    const avg = (coursesList.reduce((acc, c) => acc + c.grade, 0) / coursesList.length).toFixed(2);
    const gpaValue = `${avg}%`;
    const courseCount = coursesList.length.toString();

    const stats = [
        { title: 'Overall GPA', value: gpaValue, color: 'text-primary' },
        { title: 'Current Courses', value: courseCount, color: 'text-success' },
        { title: 'Assignments', value: '2 Due', color: 'text-info' },
        { title: 'Attendance', value: '96%', color: 'text-warning' }
    ];

    stats.forEach((stat, index) => {
        const titleElement = document.getElementById(`stat${index + 1}-title`);
        const valueElement = document.getElementById(`stat${index + 1}-value`);

        if (titleElement) titleElement.textContent = stat.title;
        if (valueElement) {
            valueElement.textContent = stat.value;
            valueElement.className = `card-text fw-bold ${stat.color}`;
        }
    });
}

function populateCoursesTable(coursesData) {
    const tableBody = document.getElementById('coursesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!coursesData || coursesData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No courses match the active filter criteria.</td></tr>`;
        return;
    }

    coursesData.forEach(course => {
        let letter = 'F';
        if (course.grade >= 93) letter = 'A';
        else if (course.grade >= 90) letter = 'A-';
        else if (course.grade >= 87) letter = 'B+';
        else if (course.grade >= 83) letter = 'B';
        else if (course.grade >= 80) letter = 'B-';
        else if (course.grade >= 70) letter = 'C';
        else if (course.grade >= 60) letter = 'D';

        let badgeClass = 'bg-danger';
        if (course.grade >= 90) badgeClass = 'bg-success';
        else if (course.grade >= 80) badgeClass = 'bg-info text-dark';
        else if (course.grade >= 70) badgeClass = 'bg-warning text-dark';

        const row = document.createElement('tr');
        if (course.grade < 75) row.classList.add('table-danger');

        row.innerHTML = `
            <td><strong>${course.code}</strong></td>
            <td>${course.name}</td>
            <td class="d-none d-md-table-cell">${course.instructor}</td>
            <td class="text-center d-none d-sm-table-cell">${course.units}</td>
            <td class="text-center fw-bold">${course.grade}%</td>
            <td class="text-center"><span class="badge ${badgeClass}">${letter}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function populateActivityTable() {
    const tableBody = document.getElementById('activityTableBody');
    if (!tableBody) return;

    const activities = [
        { date: '2026-09-28 14:30', activity: 'Lab 3 graded: 48/50 (WEB101)', status: 'success' },
        { date: '2026-09-28 13:15', activity: 'Assignment submitted: ER Diagram Activity (IT202)', status: 'info' },
        { date: '2026-09-27 11:45', activity: 'Assignment due soon: Problem Set 3 (MATH201)', status: 'warning' },
        { date: '2026-09-26 09:00', activity: 'Quiz 2 graded: 45/50 (IT201)', status: 'success' },
        { date: '2026-09-25 16:20', activity: 'Reflection Paper graded: 19/20 (GE105)', status: 'success' },
        { date: '2026-09-22 14:10', activity: 'Missing submission: Subnetting Worksheet (IT203)', status: 'danger' }
    ];

    tableBody.innerHTML = '';

    activities.forEach(activity => {
        const row = document.createElement('tr');

        let badgeClass = 'bg-secondary';
        if (activity.status === 'success') badgeClass = 'bg-success';
        else if (activity.status === 'warning') badgeClass = 'bg-warning text-dark';
        else if (activity.status === 'danger') badgeClass = 'bg-danger';
        else if (activity.status === 'info') badgeClass = 'bg-info text-dark';

        row.innerHTML = `
            <td>${activity.date}</td>
            <td>${activity.activity}</td>
            <td><span class="badge ${badgeClass}">${activity.status}</span></td>
        `;

        tableBody.appendChild(row);
    });
}

function checkGradeAlerts(courses) {
    const lowGrades = courses.filter(c => c.grade < 75);
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    alertContainer.innerHTML = '';

    if (lowGrades.length > 0) {
        const names = lowGrades.map(c => `${c.code} (${c.grade}%)`).join(', ');
        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                ⚠️ <strong>Academic Performance Alert:</strong> Low course standing detected in: ${names}.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

function showAlert(msg, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}