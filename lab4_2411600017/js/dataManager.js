const DataManager = (function () {
    let courses = [
        { id: 1, code: 'WEB101', name: 'Web Systems and Technologies', category: 'IT', instructor: 'Prof. Santos', units: 3, grade: 94 },
        { id: 2, code: 'IT201', name: 'Data Structures and Algorithms', category: 'IT', instructor: 'Prof. Reyes', units: 3, grade: 88 },
        { id: 3, code: 'IT202', name: 'Database Management Systems', category: 'IT', instructor: 'Prof. Garcia', units: 3, grade: 91 },
        { id: 4, code: 'MATH201', name: 'Discrete Mathematics', category: 'MATH', instructor: 'Prof. Cruz', units: 3, grade: 85 },
        { id: 5, code: 'IT203', name: 'Networking Fundamentals', category: 'IT', instructor: 'Prof. Mendoza', units: 3, grade: 72 },
        { id: 6, code: 'GE105', name: 'Ethics', category: 'GE', instructor: 'Prof. Bautista', units: 2, grade: 96 }
    ];
    return {
        async fetchCourses() {
            try {
                const response = await fetch('data/courses.json');
                if (response.ok) {
                    const jsonData = await response.json();
                    if (jsonData && jsonData.length > 0) {
                        courses = jsonData;
                    }
                }
            } catch (err) {
                console.warn('JSON file not found or blocked. Using default embedded courses dataset.', err);
            }
            return courses;
        },

        getCourses() {
            return courses;
        },
        
        filterCourses(searchQuery = '', category = 'ALL', status = 'ALL') {
            return courses.filter(item => {
                const matchesSearch = item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      item.name.toLowerCase().includes(searchQuery.toLowerCase());
                
                const matchesCategory = (category === 'ALL') || (item.category === category);

                let matchesStatus = true;
                if (status === 'EXCELLENT') matchesStatus = item.grade >= 90;
                else if (status === 'PASSING') matchesStatus = item.grade >= 75 && item.grade < 90;
                else if (status === 'ALERT') matchesStatus = item.grade < 75;

                return matchesSearch && matchesCategory && matchesStatus;
            });
        },

        exportToCSV(dataList) {
            const headers = ["ID", "Course Code", "Course Name", "Category", "Instructor", "Units", "Grade"];
            const rows = dataList.map(c => [c.id || '', c.code, `"${c.name}"`, c.category || '', `"${c.instructor}"`, c.units, c.grade]);
            
            let csvContent = "data:text/csv;charset=utf-8," 
                + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `academic_report_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        simulateUpdate() {
            if (courses.length === 0) return null;
            const randomIndex = Math.floor(Math.random() * courses.length);
            const delta = Math.floor(Math.random() * 7) - 3;
            courses[randomIndex].grade = Math.min(100, Math.max(50, courses[randomIndex].grade + delta));
            return courses[randomIndex];
        }
    };
})();