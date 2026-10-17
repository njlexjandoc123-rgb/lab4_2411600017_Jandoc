const DataManager = (function () {
    let courses = [
        { id: 1, code: "CS-101", name: "Web Development 2", category: "Core CS", instructor: "Prof. Santos", units: 3, grade: 97, weeklyGrades: [91, 94, 96, 96, 97, 93], standing: "Passing" },
        { id: 2, code: "CS-102", name: "Database Systems", category: "Core CS", instructor: "Prof. Garcia", units: 3, grade: 72, weeklyGrades: [63, 66, 73, 68, 70, 72], standing: "Failing" },
        { id: 3, code: "CS-103", name: "Data Structures", category: "Core CS", instructor: "Prof. Reyes", units: 4, grade: 88, weeklyGrades: [82, 85, 87, 87, 89, 88], standing: "Passing" },
        { id: 4, code: "CS-104", name: "Software Engineering", category: "Elective", instructor: "Prof. Cruz", units: 3, grade: 63, weeklyGrades: [54, 57, 64, 59, 61, 63], standing: "Failing" },
        { id: 5, code: "CS-105", name: "Network Admin", category: "Networking", instructor: "Prof. Mendoza", units: 3, grade: 76, weeklyGrades: [69, 72, 79, 74, 76, 74], standing: "Warning" },
        { id: 6, code: "GE-101", name: "Ethics in IT", category: "General Ed", instructor: "Prof. Bautista", units: 3, grade: 92, weeklyGrades: [85, 88, 90, 90, 92, 90], standing: "Passing" }
    ];

    return {
        async fetchCourses() {
            try {
                const res = await fetch('data/courses.json');
                if (res.ok) {
                    const jsonData = await res.json();
                    if (jsonData && jsonData.length > 0) {
                        courses = jsonData;
                    }
                }
            } catch (e) {
                console.warn('API/JSON fetch failed. Using default embedded course dataset.', e);
            }
            return courses;
        },

        getCourses() { return courses; },

        filterCourses(query = '', category = 'ALL', standing = 'ALL', minG = 0, maxG = 100) {
            return courses.filter(c => {
                const q = query.toLowerCase();
                const mQuery = c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
                const mCat = (category === 'ALL') || (c.category === category);
                
                let std = 'Passing';
                if (c.grade < 70) std = 'Failing';
                else if (c.grade < 75) std = 'Warning';

                const mStd = (standing === 'ALL') || (std.toLowerCase() === standing.toLowerCase());
                const mGrade = c.grade >= minG && c.grade <= maxG;

                return mQuery && mCat && mStd && mGrade;
            });
        },

        exportToCSV(data) {
            const headers = ["Subject Name", "Course Code", "Category", "Units", "Grade (%)", "Standing"];
            const rows = data.map(c => [`"${c.name}"`, c.code, c.category, c.units, c.grade, c.grade >= 75 ? 'Passing' : (c.grade >= 70 ? 'Warning' : 'Failing')]);
            const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
            const link = document.createElement("a");
            link.href = encodeURI(csv);
            link.download = `Grades_Report_${new Date().toISOString().slice(0,10)}.csv`;
            link.click();
        },

        simulateUpdate() {
            if (courses.length === 0) return null;
            const idx = Math.floor(Math.random() * courses.length);
            const delta = Math.floor(Math.random() * 5) - 2;
            courses[idx].grade = Math.min(100, Math.max(50, courses[idx].grade + delta));
            return { course: courses[idx], delta };
        }
    };
})();