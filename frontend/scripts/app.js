// creamos la clase principal
class CreditosApp {
    constructor() {
        // url base de la api
        this.API_URL = 'http://localhost:5000/creditos';
        // array para almacenar los créditos
        this.creditos = [];
        // id del crédito en edición
        this.editingId = null;
        // id del crédito a eliminar
        this.deleteId = null;
        
        // inicializar elementos del dom
        this.initializeElements();
        // configurar event listeners
        this.setupEventListeners();
        // cargar créditos iniciales
        this.loadCreditos();
    }

    initializeElements() {
        // elementos del formulario
        this.form = document.getElementById('creditoForm');
        this.clienteInput = document.getElementById('cliente');
        this.montoInput = document.getElementById('monto');
        this.tasaInteresInput = document.getElementById('tasa_interes');
        this.plazoInput = document.getElementById('plazo');
        this.fechaInput = document.getElementById('fecha_otorgamiento');
        this.creditoIdInput = document.getElementById('creditoId');
        this.submitBtn = document.getElementById('submitBtn');
        this.cancelBtn = document.getElementById('cancelBtn');

        // elementos de la tabla
        this.creditosBody = document.getElementById('creditosBody');
        this.searchInput = document.getElementById('searchInput');
        this.tableInfo = document.getElementById('tableInfo');

        // elementos del modal de confirmación
        this.modal = document.getElementById('confirmModal');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalConfirmBtn = document.getElementById('modalConfirmBtn');
        this.modalCancelBtn = document.getElementById('modalCancelBtn');

        // elementos para mostrar errores
        this.errorElements = {
            cliente: document.getElementById('clienteError'),
            monto: document.getElementById('montoError'),
            tasa_interes: document.getElementById('tasaInteresError'),
            plazo: document.getElementById('plazoError'),
            fecha_otorgamiento: document.getElementById('fechaError')
        };
    }

    setupEventListeners() {
        // evento de envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // evento de cancelar edición
        this.cancelBtn.addEventListener('click', () => this.cancelEdit());

        // evento de búsqueda - corregido
        this.searchInput.addEventListener('input', () => this.filterCreditos());

        // eventos del modal
        this.modalConfirmBtn.addEventListener('click', () => this.confirmDelete());
        this.modalCancelBtn.addEventListener('click', () => this.closeModal());

        // cerrar modal al hacer clic fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    async loadCreditos() {
        try {
            // mostrar indicador de carga
            this.showLoading(true);
            const response = await fetch(this.API_URL);
            
            // verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error('Error al cargar los créditos');
            }
            
            // convertir respuesta a json y almacenar
            this.creditos = await response.json();
            // renderizar créditos en la tabla
            this.renderCreditos();
             // actualizar gráficos si existen
            if (window.creditosCharts) {
                window.creditosCharts.updateCharts(this.creditos);
            }
        } catch (error) {
            // mostrar error en la carga
            this.showError('Error al cargar los créditos: ' + error.message);
        } finally {
            // ocultar indicador de carga
            this.showLoading(false);
        }
    }

    renderCreditos() {
        // renderizar créditos filtrados (todos inicialmente)
        this.renderFilteredCreditos(this.creditos);
        // actualizar información de la tabla
        this.updateTableInfo(this.creditos.length);
    }

    filterCreditos() {
        // obtener término de búsqueda en minúsculas
        const searchTerm = this.searchInput.value.toLowerCase();
        
        // filtrar créditos por nombre de cliente
        const filtered = this.creditos.filter(credito =>
            credito.cliente.toLowerCase().includes(searchTerm)
        );
        
        // renderizar créditos filtrados
        this.renderFilteredCreditos(filtered);
        
        // actualizar contador de la tabla
        this.updateTableInfo(filtered.length);
        return filtered;
    }

    renderFilteredCreditos(filteredCreditos) {
        // generar html para cada crédito y unirlos
        this.creditosBody.innerHTML = filteredCreditos.map(credito => `
            <tr>
                <td>${credito.id}</td>
                <td>${this.escapeHtml(credito.cliente)}</td>
                <td>$${credito.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td>${credito.tasa_interes}%</td>
                <td>${credito.plazo} meses</td>
                <td>${credito.fecha_otorgamiento}</td>
                <td class="acciones">
                    <button class="btn-editar" onclick="app.editCredito(${credito.id})">
                        Editar
                    </button>
                    <button class="btn-eliminar" onclick="app.showDeleteModal(${credito.id})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateTableInfo(count = this.creditos.length) {
        // actualizar texto informativo de la tabla
        this.tableInfo.textContent = `Mostrando ${count} crédito${count !== 1 ? 's' : ''}`;
    }

    async handleSubmit(e) {
        // prevenir envío por defecto del formulario
        e.preventDefault();
        
        // validar formulario antes de enviar
        if (!this.validateForm()) {
            return;
        }

        // preparar datos del formulario
        const formData = {
            cliente: this.clienteInput.value.trim(),
            monto: parseFloat(this.montoInput.value),
            tasa_interes: parseFloat(this.tasaInteresInput.value),
            plazo: parseInt(this.plazoInput.value),
            fecha_otorgamiento: this.fechaInput.value
        };

        try {
            // mostrar indicador de carga
            this.showLoading(true);
            
            // determinar si es edición o creación
            if (this.editingId) {
                await this.updateCredito(this.editingId, formData);
                this.showMessage('Crédito actualizado correctamente');
            } else {
                await this.createCredito(formData);
                this.showMessage('Crédito creado correctamente');
            }
            
            // resetear formulario y recargar datos
            this.resetForm();
            await this.loadCreditos();
        } catch (error) {
            // mostrar error en el guardado
            this.showError('Error al guardar el crédito: ' + error.message);
        } finally {
            // ocultar indicador de carga
            this.showLoading(false);
        }
    }

    validateForm() {
        let isValid = true;
        const errors = {};

        // validar que el cliente no esté vacío
        if (!this.clienteInput.value.trim()) {
            errors.cliente = 'El nombre del cliente es obligatorio';
            isValid = false;
        }

        // validar que el monto sea un número positivo
        const monto = parseFloat(this.montoInput.value);
        if (isNaN(monto) || monto <= 0) {
            errors.monto = 'El monto debe ser un número positivo';
            isValid = false;
        }

        // validar que la tasa sea un número no negativo
        const tasa = parseFloat(this.tasaInteresInput.value);
        if (isNaN(tasa) || tasa < 0) {
            errors.tasa_interes = 'La tasa de interés debe ser un número no negativo';
            isValid = false;
        }

        // validar que el plazo sea un entero positivo
        const plazo = parseInt(this.plazoInput.value);
        if (isNaN(plazo) || plazo <= 0) {
            errors.plazo = 'El plazo debe ser un número entero positivo';
            isValid = false;
        }

        // validar que la fecha no esté vacía y no sea futura
        if (!this.fechaInput.value) {
            errors.fecha_otorgamiento = 'La fecha de otorgamiento es obligatoria';
            isValid = false;
        } else {
            const fecha = new Date(this.fechaInput.value);
            const hoy = new Date();
            if (fecha > hoy) {
                errors.fecha_otorgamiento = 'La fecha no puede ser futura';
                isValid = false;
            }
        }

        // limpiar errores previos y mostrar nuevos
        this.clearErrors();
        Object.keys(errors).forEach(field => {
            this.errorElements[field].textContent = errors[field];
            document.getElementById(field).classList.add('error');
        });

        return isValid;
    }

    clearErrors() {
        // limpiar mensajes de error
        Object.values(this.errorElements).forEach(el => {
            el.textContent = '';
        });
        // remover clase error de los inputs
        Array.from(this.form.elements).forEach(input => {
            if (input.type !== 'hidden') {
                input.classList.remove('error');
            }
        });
    }

    async createCredito(creditoData) {
        // enviar petición post para crear crédito
        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(creditoData)
        });

        // verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error('Error al crear el crédito');
        }

        return await response.json();
    }

    async updateCredito(id, creditoData) {
        // enviar petición put para actualizar crédito
        const response = await fetch(`${this.API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(creditoData)
        });

        // verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error('Error al actualizar el crédito');
        }
    }

    async deleteCredito(id) {
        // enviar petición delete para eliminar crédito
        const response = await fetch(`${this.API_URL}/${id}`, {
            method: 'DELETE'
        });

        // verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error('Error al eliminar el crédito');
        }
    }

    editCredito(id) {
        // buscar crédito por id
        const credito = this.creditos.find(c => c.id === id);
        if (!credito) return;

        // establecer id en edición y almacenar en input hidden
        this.editingId = id;
        this.creditoIdInput.value = id;
        
        // llenar formulario con datos existentes
        this.clienteInput.value = credito.cliente;
        this.montoInput.value = credito.monto;
        this.tasaInteresInput.value = credito.tasa_interes;
        this.plazoInput.value = credito.plazo;
        this.fechaInput.value = credito.fecha_otorgamiento;

        // cambiar texto del botón y mostrar botón cancelar
        this.submitBtn.textContent = 'Actualizar Crédito';
        this.cancelBtn.style.display = 'block';

        // scroll hasta el formulario
        this.form.scrollIntoView({ behavior: 'smooth' });
    }

    cancelEdit() {
        // resetear formulario a estado inicial
        this.resetForm();
    }

    resetForm() {
        // limpiar formulario y estados
        this.form.reset();
        this.clearErrors();
        this.editingId = null;
        this.creditoIdInput.value = '';
        this.submitBtn.textContent = 'Guardar Crédito';
        this.cancelBtn.style.display = 'none';
    }

    showDeleteModal(id) {
        // buscar crédito por id
        const credito = this.creditos.find(c => c.id === id);
        if (!credito) return;

        // almacenar id a eliminar y mostrar modal
        this.deleteId = id;
        this.modalMessage.textContent = `¿Estás segur@ de que quieres eliminar el crédito de "${credito.cliente}" por $${credito.monto}?`;
        this.modal.style.display = 'block';
    }

    closeModal() {
        // ocultar modal y resetear id de eliminación
        this.modal.style.display = 'none';
        this.deleteId = null;
    }

    async confirmDelete() {
        // verificar que hay un id para eliminar
        if (!this.deleteId) return;

        try {
            // mostrar carga, eliminar y recargar
            this.showLoading(true);
            await this.deleteCredito(this.deleteId);
            this.showMessage('Crédito eliminado correctamente');
            await this.loadCreditos();
        } catch (error) {
            // mostrar error en eliminación
            this.showError('Error al eliminar el crédito: ' + error.message);
        } finally {
            // ocultar carga y modal
            this.showLoading(false);
            this.closeModal();
        }
    }

    showLoading(show) {
        // agregar o remover clase de carga al body
        if (show) {
            document.body.classList.add('loading');
        } else {
            document.body.classList.remove('loading');
        }
    }

    showMessage(message) {
        // crear y mostrar mensaje de éxito
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        
        document.querySelector('.container').prepend(messageDiv);
        
        // auto-remover después de 3 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    showError(message) {
        // crear y mostrar mensaje de error global
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message-global';
        errorDiv.textContent = message;
        
        document.querySelector('.container').prepend(errorDiv);
        
        // auto-remover después de 5 segundos
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    escapeHtml(text) {
        // escapar caracteres html para prevenir xss
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// inicializar la aplicación cuando el dom esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CreditosApp();
});