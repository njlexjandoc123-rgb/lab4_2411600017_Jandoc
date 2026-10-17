const ChartConfig = (function () {
    let lineChartInstance = null;
    let barChartInstance = null;
    let doughnutChartInstance = null;
    let hBarChartInstance = null;

    return {
        initLineChart(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;

            if (lineChartInstance) {
                lineChartInstance.destroy();
            }

            const ctx = canvas.getContext('2d');
            lineChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    datasets: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 50, max: 100 } }
                }
            });
            return lineChartInstance;
        },

        initBarChart(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;

            if (barChartInstance) {
                barChartInstance.destroy();
            }

            const ctx = canvas.getContext('2d');
            barChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Course Grade (%)',
                        data: [],
                        backgroundColor: '#0d6efd'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });
            return barChartInstance;
        },

        initDoughnutChart(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;

            if (doughnutChartInstance) {
                doughnutChartInstance.destroy();
            }

            const ctx = canvas.getContext('2d');
            doughnutChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Passing (>=75)', 'Warning (70-74)', 'Failing (<70)'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#198754', '#ffc107', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%'
                }
            });
            return doughnutChartInstance;
        },

        initHorizontalBarChart(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;

            if (hBarChartInstance) {
                hBarChartInstance.destroy();
            }

            const ctx = canvas.getContext('2d');
            hBarChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Top Performance',
                        data: [],
                        backgroundColor: '#0dcaf0'
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { x: { beginAtZero: true, max: 100 } }
                }
            });
            return hBarChartInstance;
        },

        updateAllCharts(courses) {
            if (!courses || courses.length === 0) return;

            if (lineChartInstance) {
                const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0', '#6f42c1'];
                lineChartInstance.data.datasets = courses.map((c, i) => ({
                    label: c.name || c.code,
                    data: c.weeklyGrades || [c.grade, c.grade, c.grade, c.grade, c.grade, c.grade],
                    borderColor: colors[i % colors.length],
                    backgroundColor: colors[i % colors.length],
                    tension: 0.3
                }));
                lineChartInstance.update();
            }

            if (barChartInstance) {
                barChartInstance.data.labels = courses.map(c => c.code || c.name);
                barChartInstance.data.datasets[0].data = courses.map(c => c.grade);
                barChartInstance.update();
            }

            if (doughnutChartInstance) {
                const passing = courses.filter(c => c.grade >= 75).length;
                const warning = courses.filter(c => c.grade >= 70 && c.grade < 75).length;
                const failing = courses.filter(c => c.grade < 70).length;

                doughnutChartInstance.data.datasets[0].data = [passing, warning, failing];
                doughnutChartInstance.update();
            }

            if (hBarChartInstance) {
                const sorted = [...courses].sort((a, b) => b.grade - a.grade);
                hBarChartInstance.data.labels = sorted.map(c => c.name || c.code);
                hBarChartInstance.data.datasets[0].data = sorted.map(c => c.grade);
                hBarChartInstance.update();
            }
        }
    };
})();