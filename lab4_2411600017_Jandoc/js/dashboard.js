document.addEventListener('DOMContentLoaded', async function () {

    // 1. Auth Bypass para sa Testing Session
    localStorage.setItem('isLoggedIn', 'true');

    // Logout Event Handlers
    const logout = (e) => { 
        if (e) e.preventDefault(); 
        localStorage.clear(); 
        window.location.href = 'index.html'; 
    };
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('logoutLink')?.addEventListener('click', logout);

    // 2. Direct Embedded Dataset Fallback
    const defaultCourses = [
        { id: 1, code: "CS-101", name: "Web Development 2", category: "Core CS", instructor: "Prof. Santos", units: 3, grade: 97, weeklyGrades: [91, 94, 96, 96, 97, 93], standing: "Passing" },
        { id: 2, code: "CS-102", name: "Database Systems", category: "Core CS", instructor: "Prof. Garcia", units: 3, grade: 72, weeklyGrades: [63, 66, 73, 68, 70, 72], standing: "Failing" },
        { id: 3, code: "CS-103", name: "Data Structures", category: "Core CS", instructor: "Prof. Reyes", units: 4, grade: 88, weeklyGrades: [82, 85, 87, 87, 89, 88], standing: "Passing" },
        { id: 4, code: "CS-104", name: "Software Engineering", category: "Elective", instructor: "Prof. Cruz", units: 3, grade: 63, weeklyGrades: [54, 57, 64, 59, 61, 63], standing: "Failing" },
        { id: 5, code: "CS-105", name: "Network Admin", category: "Networking", instructor: "Prof. Mendoza", units: 3, grade: 76, weeklyGrades: [69, 72, 79, 74, 76, 74], standing: "Warning" },
        { id: 6, code: "GE-101", name: "Ethics in IT", category: "General Ed", instructor: "Prof. Bautista", units: 3, grade: 92, weeklyGrades: [85, 88, 90, 90, 92, 90], standing: "Passing" }
    ];

    let activeCourses = defaultCourses;

    // 3. UNAHING I-DECLARE ANG LAHAT NG FILTER INPUTS (Para maiwasan ang ReferenceError)
    const sInput = document.getElementById('searchInput');
    const cFilter = document.getElementById('categoryFilter');
    const stFilter = document.getElementById('statusFilter');
    const minG = document.getElementById('minGradeInput');
    const maxG = document.getElementById('maxGradeInput');
    const rBtn = document.getElementById('resetFiltersBtn');

    // 4. Filter Function (Ligtas na sa ReferenceError)
    function getFiltered() {
        const query = sInput && sInput.value ? sInput.value.toLowerCase().trim() : '';
        const cat = cFilter ? cFilter.value : 'ALL';
        const std = stFilter ? stFilter.value : 'ALL';
        const minVal = minG && minG.value !== '' ? parseFloat(minG.value) : 0;
        const maxVal = maxG && maxG.value !== '' ? parseFloat(maxG.value) : 100;

        const safeMin = isNaN(minVal) ? 0 : minVal;
        const safeMax = isNaN(maxVal) ? 100 : maxVal;

        return activeCourses.filter(c => {
            const mQuery = !query || c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query);
            const mCat = (cat === 'ALL') || (c.category === cat);
            
            let cStd = 'Passing';
            if (c.grade < 70) cStd = 'Failing';
            else if (c.grade < 75) cStd = 'Warning';

            const mStd = (std === 'ALL') || (cStd.toLowerCase() === std.toLowerCase());
            const mGrade = c.grade >= safeMin && c.grade <= safeMax;

            return mQuery && mCat && mStd && mGrade;
        });
    }

    function renderAll() {
        const filtered = getFiltered();

        populateTable(filtered);
        updateStats(activeCourses);

        if (typeof ChartConfig !== 'undefined' && ChartConfig.updateAllCharts) {
            try {
                ChartConfig.updateAllCharts(activeCourses);
            } catch (err) {
                console.error("Chart update warning:", err);
            }
        }
    }

    // 5. Initialize Charts Safely
    try {
        if (typeof ChartConfig !== 'undefined') {
            if (ChartConfig.initLineChart) ChartConfig.initLineChart('overviewLineChart');
            if (ChartConfig.initBarChart) ChartConfig.initBarChart('categoryBarChart');
            if (ChartConfig.initDoughnutChart) ChartConfig.initDoughnutChart('standingDoughnutChart');
            if (ChartConfig.initHorizontalBarChart) ChartConfig.initHorizontalBarChart('topCoursesChart');
        }
    } catch (chartErr) {
        console.error("Chart init error:", chartErr);
    }

    // 6. Fetch External Data Safely
    if (typeof DataManager !== 'undefined') {
        try {
            const fetched = await DataManager.fetchCourses();
            if (fetched && fetched.length > 0) activeCourses = fetched;
        } catch (e) {
            console.warn("Using default internal courses.");
        }
    }

    // 7. Initial UI Render
    renderAll();

    // 8. Event Listeners setup
    [sInput, cFilter, stFilter, minG, maxG].forEach(el => el?.addEventListener('input', renderAll));

    rBtn?.addEventListener('click', () => {
        if (sInput) sInput.value = '';
        if (cFilter) cFilter.value = 'ALL';
        if (stFilter) stFilter.value = 'ALL';
        if (minG) minG.value = '';
        if (maxG) maxG.value = '';
        renderAll();
    });

    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
        if (typeof DataManager !== 'undefined') {
            DataManager.exportToCSV(getFiltered());
        }
    });

    // 9. Automatic Real-Time Simulation (Interval)
    setInterval(() => {
        if (typeof DataManager !== 'undefined' && DataManager.simulateUpdate) {
            const res = DataManager.simulateUpdate();
            if (res) {
                renderAll();
                addActivityLog(res.course.name, res.delta);
            }
        }
    }, 4000);

    function updateStats(courses) {
        if (!courses || courses.length === 0) return;

        const avg = (courses.reduce((acc, c) => acc + c.grade, 0) / courses.length).toFixed(1);
        const passingCount = courses.filter(c => c.grade >= 75).length;
        const warningCount = courses.filter(c => c.grade >= 70 && c.grade < 75).length;
        const failingCount = courses.filter(c => c.grade < 70).length;
        const passingRate = ((passingCount / courses.length) * 100).toFixed(1);

        const gpaElem = document.getElementById('statGpa');
        const enrolledElem = document.getElementById('statEnrolled');
        const rateElem = document.getElementById('statPassingRate');
        const warnElem = document.getElementById('statWarning');
        const failElem = document.getElementById('statFailing');

        if (gpaElem) gpaElem.textContent = `${avg}%`;
        if (enrolledElem) enrolledElem.textContent = courses.length;
        if (rateElem) rateElem.textContent = `${passingRate}%`;
        if (warnElem) warnElem.textContent = warningCount;
        if (failElem) failElem.textContent = failingCount;

        const alertBanner = document.getElementById('alertBanner');
        if (alertBanner) {
            if (warningCount > 0 || failingCount > 0) {
                alertBanner.innerHTML = `
                    <div class="alert alert-warning alert-dismissible fade show d-flex align-items-center mb-3" role="alert">
                        <span class="me-2">⚠️ <strong>Academic Alert:</strong> You have ${warningCount} course(s) near passing threshold and ${failingCount} failing.</span>
                        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
                    </div>`;
            } else {
                alertBanner.innerHTML = '';
            }
        }
    }

    function populateTable(courses) {
        const tbody = document.getElementById('coursesTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!courses || courses.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No matching course records found.</td></tr>`;
            return;
        }

        courses.forEach((c, i) => {
            let badge = '<span class="badge bg-success">Passing</span>';
            let rowClass = '';
            if (c.grade < 70) {
                badge = '<span class="badge bg-danger">Failing</span>';
                rowClass = 'table-danger';
            } else if (c.grade < 75) {
                badge = '<span class="badge bg-warning text-dark">Warning</span>';
                rowClass = 'table-warning';
            }

            const tr = document.createElement('tr');
            if (rowClass) tr.className = rowClass;
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td><strong>${c.name}</strong></td>
                <td>${c.code}</td>
                <td>${c.category}</td>
                <td>${c.units} Units</td>
                <td class="fw-bold">${c.grade}%</td>
                <td>${badge}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function addActivityLog(courseName, delta) {
        const tbody = document.getElementById('activityTableBody');
        if (!tbody) return;

        const time = new Date().toLocaleTimeString();
        const actionText = delta >= 0 ? `+${delta}% Grade Increase` : `${delta}% Grade Decrease`;
        const badgeClass = delta >= 0 ? 'bg-success' : 'bg-danger';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${time}</td>
            <td>${courseName}</td>
            <td><span class="badge ${badgeClass}">${actionText}</span></td>
            <td>Updated</td>
        `;
        tbody.prepend(tr);

        if (tbody.children.length > 5) {
            tbody.removeChild(tbody.lastChild);
        }
    }
});