let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = ""; 
let fechaSQL = "";          

// 1. GESTIÓN DE PANTALLAS (Simplificada)
function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    
    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

// 2. ACCESO DIRECTO (Sin validación real)
function ejecutarLogin() {
        mostrar('menu');
}

function ejecutarRegistro() {
        mostrar('login');
}

// 3. GESTIÓN DE TAREAS LOCALES
function agregarTarea() {
    const input = document.getElementById('taskInput');
    if (!input.value) return alert("Escribe la descripción de la tarea.");

    const nuevaTarea = {
        id: Date.now(),
        descripcion: input.value,
        fecha: fechaSeleccionada || "Sin fecha",
        estado: 'Pendiente'
    };

    tareasPendientes.push(nuevaTarea);
    
    // Limpiar campos
    input.value = "";
    document.getElementById('selectedDateText').innerText = "Seleccionar fecha";
    fechaSeleccionada = "";
    fechaSQL = "";

    alert("Tarea añadida a Pendientes");
    mostrar('menu');
}

function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    if (!lista) return;
    lista.innerHTML = tareasPendientes.length ? "" : "<p>No hay tareas pendientes</p>";
    
    tareasPendientes.forEach((t, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="flex-grow: 1;">
                <strong>${t.descripcion}</strong><br>
                <small>📅 ${t.fecha}</small>
            </div>
            <button class="tick-btn" onclick="completarTareaLocal(${index})">✓</button>
        `;
        lista.appendChild(li);
    });
}

function completarTareaLocal(index) {
    const tarea = tareasPendientes.splice(index, 1)[0];
    tarea.estado = 'Completada';
    tareasCompletadas.push(tarea);
    renderPendientes();
    alert("¡Tarea completada!");
}

function renderCompletadas() {
    const lista = document.getElementById('listaCompletadas');
    if (!lista) return;
    lista.innerHTML = tareasCompletadas.length ? "" : "<p>No hay tareas completadas aún</p>";
    
    tareasCompletadas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `<span>✅ ${t.descripcion}</span>`;
        lista.appendChild(li);
    });
}

// --- CALENDARIO (Se mantiene igual que tu código original) ---
function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full'); 
    if (!container) return;
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    container.innerHTML = ""; 
    meses.forEach((mes, mesIndex) => {
        const monthBox = document.createElement('div');
        monthBox.className = "month-box";
        const title = document.createElement('h4'); title.innerText = mes;
        monthBox.appendChild(title);
        const daysGrid = document.createElement('div');
        daysGrid.className = "days-grid";
        const numDias = new Date(2026, mesIndex + 1, 0).getDate();
        for (let d = 1; d <= numDias; d++) {
            const day = document.createElement('div');
            day.className = "day"; day.innerText = d;
            day.onclick = () => {
                fechaSeleccionada = `${d} de ${mes}, 2026`;
                const label = document.getElementById('selectedDateText');
                if (label) label.innerText = fechaSeleccionada;
                document.getElementById('calendarWrapper').classList.add('hidden');
            };
            daysGrid.appendChild(day);
        }
        monthBox.appendChild(daysGrid);
        container.appendChild(monthBox);
    });
}

function toggleCalendario() {
    const cal = document.getElementById('calendarWrapper');
    if (cal) cal.classList.toggle('hidden');
}

window.onload = () => {
    generarCalendarioCompleto();
};
