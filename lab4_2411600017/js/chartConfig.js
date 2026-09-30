const ChartConfig = (function () {
    let barChartInstance = null;
    let doughnutChartInstance = null;

    return {
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
                        backgroundColor: '#1e3a5f'
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
                    labels: ['Honor Roll (>=90)', 'Passing (75-89)', 'At Risk (<75)'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#28a745', '#17a2b8', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            return doughnutChartInstance;
        },

        updateCharts(courses) {
            if (!courses) return;

            if (barChartInstance) {
                barChartInstance.data.labels = courses.map(c => c.code);
                barChartInstance.data.datasets[0].data = courses.map(c => c.grade);
                barChartInstance.update();
            }

            if (doughnutChartInstance) {
                const honor = courses.filter(c => c.grade >= 90).length;
                const passing = courses.filter(c => c.grade >= 75 && c.grade < 90).length;
                const risk = courses.filter(c => c.grade < 75).length;

                doughnutChartInstance.data.datasets[0].data = [honor, passing, risk];
                doughnutChartInstance.update();
            }
        }
    };
})();