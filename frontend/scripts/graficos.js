// creamos la clase para los gráficos
class CreditosCharts {
    // inicializamos los gráficos
    constructor() {
        this.charts = {};
        this.initializeCharts();
    }

    initializeCharts() {
        // inicializar canvases vacíos
        this.charts.total = new Chart(
            document.getElementById('totalChart'),
            this.getTotalChartConfig()
        );
        // gráfico de créditos por cliente
        this.charts.clientes = new Chart(
            document.getElementById('clientesChart'),
            this.getClientesChartConfig()
        );
        // gráfico de mntos por cliente
        this.charts.montos = new Chart(
            document.getElementById('montosChart'),
            this.getMontosChartConfig()
        );
    }
    // creamos la configuración del gráfico total
    getTotalChartConfig() {
        return {
            type: 'bar',
            data: {
                labels: ['Créditos Otorgados por año'],
                datasets: [{
                    data: [0],
                    // colocamos un valor inicial de 0
                    label: 'Total Créditos: ' + 0,
                    backgroundColor: [
                        '#f56565', '#ed8936', '#ecc94b', 
                        '#48bb78', '#38b2ac', '#4299e1'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        };
    }
    // creamos la configuración del gráfico de créditos por cliente
    getClientesChartConfig() {
        return {
            type: 'bar',
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    label: 'Créditos por Cliente',
                    data: [0],
                    backgroundColor: '#48bb78',
                    borderWidth: 0
                }]
            }
        }
    }
    // creamos la configuración del gráfico de montos por cliente
    getMontosChartConfig() {
        return {
            type: 'bar',
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    data: [0],
                    // colocamos un valor inicial de 0
                    label: 'Suma total: ' + 0,
                    backgroundColor: [
                        '#f56565', '#ed8936', '#ecc94b', 
                        '#48bb78', '#38b2ac', '#4299e1'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        };
    }
    // se agregan las funciones de actualización de gráficos
    updateCharts(creditos) {
        if (!creditos || creditos.length === 0) {
            this.resetCharts();
            return;
        }
        // actualiza elementos específicos
        this.updateTotalChart(creditos);
        this.updateClientesChart(creditos);
        this.updateMontosChart(creditos);
    }

    updateTotalChart(creditos) {
        // obtenemos el total de créditos
        this.charts.total.data.datasets[0].data = [creditos.length];
        // agrupar por año de otorgamiento, del 2020 al 2025 de acuerdo al database creado
        const rangosPorAnio = {
            '2020': 0,
            '2021': 0,
            '2022': 0,
            '2023': 0,
            '2024': 0,
            '2025': 0
        };
        // formato -> 'fecha_otorgamiento': '2023-08-25'
        creditos.forEach(credito => {
            // verificamos cuantos créditos hay por año
            const anio = credito.fecha_otorgamiento.split('-')[0];
            if (anio === '2020') rangosPorAnio['2020']++;
            else if (anio === '2021') rangosPorAnio['2021']++;
            else if (anio === '2022') rangosPorAnio['2022']++;
            else if (anio === '2023') rangosPorAnio['2023']++;
            else if (anio === '2024') rangosPorAnio['2024']++;
            else if (anio === '2025') rangosPorAnio['2025']++;
        });
        // actualizamos los elementos del gráfico total
        const rangosAnioConDatos = Object.entries(rangosPorAnio).filter(([, count]) => count > 0);
        this.charts.total.data.labels = rangosAnioConDatos.map(([rango]) => rango);
        this.charts.total.data.datasets[0].data = rangosAnioConDatos.map(([, count]) => count);
        this.charts.total.data.datasets[0].label = 'Total Créditos: ' + creditos.length;
        this.charts.total.update();

    }

    updateClientesChart(creditos) {
        // contar créditos por cliente
        const clientesCount = {};
        creditos.forEach(credito => {
            clientesCount[credito.cliente] = (clientesCount[credito.cliente] || 0) + 1;
        });

        // ordenamos y tomar top 5
        const topClientes = Object.entries(clientesCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        this.charts.clientes.data.labels = topClientes.map(([cliente]) => 
            cliente.length > 15 ? cliente.substring(0, 15) + '...' : cliente
        );
        // actualizamos los datos del gráfico de clientes
        this.charts.clientes.data.datasets[0].data = topClientes.map(([, count]) => count);
        this.charts.clientes.update();
    }

    updateMontosChart(creditos) {
        let sumaTotal = 0;
        // agrupar por rangos de monto
        const rangos = {
            '0-10,000': 0,
            '10,001-50,000': 0,
            '50,001-100,000': 0,
            '100,001-500,000': 0,
            '500,001+': 0
        };
        creditos.forEach(credito => {
            // contamos los créditos por rango de monto
            const monto = credito.monto;
            if (monto <= 10000) rangos['0-10,000']++;
            else if (monto <= 50000) rangos['10,001-50,000']++;
            else if (monto <= 100000) rangos['50,001-100,000']++;
            else if (monto <= 500000) rangos['100,001-500,000']++;
            else rangos['500,001+']++;
            sumaTotal += credito.monto;
        });
        
        // filtramos rangos vacíos
        const rangosConDatos = Object.entries(rangos).filter(([, count]) => count > 0);
        // actualizamos los datos del gráfico de montos
        this.charts.montos.data.labels = rangosConDatos.map(([rango]) => rango);
        this.charts.montos.data.datasets[0].data = rangosConDatos.map(([, count]) => count);
        this.charts.montos.data.datasets[0].label = 'Suma total: ' + sumaTotal;
        this.charts.montos.update();
    }

    resetCharts() {
        // reiniciar gráficos
        this.charts.total.data.labels = ['Sin datos'];
        this.charts.total.data.datasets[0].data = [0];
        this.charts.total.update();

        this.charts.clientes.data.labels = ['Sin datos'];
        this.charts.clientes.data.datasets[0].data = [0];
        this.charts.clientes.update();

        this.charts.montos.data.labels = ['Sin datos'];
        this.charts.montos.data.datasets[0].data = [0];
        this.charts.montos.update();
    }
}

// Inicializar gráficos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.creditosCharts = new CreditosCharts();
});