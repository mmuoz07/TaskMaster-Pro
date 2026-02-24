let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = "";

function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

function toggleCalendario() {
    document.getElementById('calendarWrapper').classList.toggle('hidden');
}

function agregarTarea() {
    const input = document.getElementById('taskInput');
    const texto = input.value.trim();

    if (!texto) {
        alert("Ingrese una descripción para la tarea.");
        return;
    }

    const tarea = {
        id: Date.now(),
        titulo: texto,
        fecha: fechaSeleccionada || "Sin fecha"
    };

    tareasPendientes.push(tarea);

    // Limpiar formulario
    input.value = "";
    fechaSeleccionada = "";
    document.getElementById('selectedDateText').innerText = "Seleccionar en calendario";
    document.getElementById('calendarWrapper').classList.add('hidden');

    mostrar('menu');
}

function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    lista.innerHTML = tareasPendientes.length ? "" : "<p style='text-align:center; margin-top:20px; color:#555;'>No hay tareas activas</p>";

    tareasPendientes.forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <div style="font-weight:600; font-size:15px;">${t.titulo}</div>
                <div style="font-size:11px; color:#71717a; margin-top:4px;">${t.fecha}</div>
            </div>
            <button class="check-btn" onclick="completarTarea(${i})">✓</button>
        `;
        lista.appendChild(li);
    });
}

function completarTarea(i) {
    const tarea = tareasPendientes.splice(i, 1)[0];
    tareasCompletadas.push(tarea);
    renderPendientes();
}

function renderCompletadas() {
    const lista = document.getElementById('listaCompletadas');
    lista.innerHTML = tareasCompletadas.length ? "" : "<p style='text-align:center; margin-top:20px; color:#555;'>Historial vacío</p>";

    tareasCompletadas.forEach((t) => {
        const li = document.createElement('li');
        li.style.borderLeftColor = "#52525b";
        li.innerHTML = `
            <div>
                <div class="tachado" style="font-size:15px;">${t.titulo}</div>
                <div style="font-size:11px; color:#52525b; margin-top:4px;">Completada</div>
            </div>
        `;
        lista.appendChild(li);
    });
}

// Generador del Calendario Completo 2026
function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full');
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    meses.forEach((mes, mesIndex) => {
        const monthContainer = document.createElement('div');
        monthContainer.className = "month-container";
        
        const title = document.createElement('div');
        title.className = "month-title";
        title.innerText = mes;
        monthContainer.appendChild(title);

        const daysGrid = document.createElement('div');
        daysGrid.className = "days-grid";

        // Obtener días del mes en 2026
        const numDias = new Date(2026, mesIndex + 1, 0).getDate();

        for (let d = 1; d <= numDias; d++) {
            const day = document.createElement('div');
            day.className = "day";
            day.innerText = d;
            day.onclick = () => {
                // Quitar selección previa
                document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
                day.classList.add('selected');
                
                fechaSeleccionada = `${d} ${mes}, 2026`;
                document.getElementById('selectedDateText').innerText = fechaSeleccionada;
                toggleCalendario();
            };
            daysGrid.appendChild(day);
        }
        
        monthContainer.appendChild(daysGrid);
        container.appendChild(monthContainer);
    });
}

window.onload = generarCalendarioCompleto;
