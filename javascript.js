let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = "";

function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

function toggleCalendar() {
    document.getElementById('calendarContainer').classList.toggle('hidden');
}

function agregarTarea() {
    const input = document.getElementById('taskInput');
    const texto = input.value.trim();

    if (texto === "") {
        alert("Por favor, describe la tarea antes de guardar.");
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        titulo: texto,
        fecha: fechaSeleccionada || "Sin fecha asignada"
    };

    tareasPendientes.push(nuevaTarea);

    input.value = "";
    fechaSeleccionada = "";
    document.getElementById('selectedDateLabel').innerText = "Ninguna";
    document.getElementById('calendarContainer').classList.add('hidden');

    alert("Tarea guardada correctamente.");
    mostrar('menu');
}

function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    lista.innerHTML = "";

    if (tareasPendientes.length === 0) {
        lista.innerHTML = "<p style='color: #64748b; text-align: center;'>No hay tareas en curso.</p>";
        return;
    }

    tareasPendientes.forEach((t, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong style="font-size: 1.1rem; display: block;">${t.titulo}</strong>
                <small style="color: #94a3b8;">Plazo: ${t.fecha}</small>
            </div>
            <button class="tick-btn" onclick="completarTarea(${index})">OK</button>
        `;
        lista.appendChild(li);
    });
}

function completarTarea(index) {
    const tarea = tareasPendientes.splice(index, 1)[0];
    tareasCompletadas.push(tarea);
    renderPendientes();
    alert("Tarea completada.");
}

function renderCompletadas() {
    const lista = document.getElementById('listaCompletadas');
    lista.innerHTML = "";

    if (tareasCompletadas.length === 0) {
        lista.innerHTML = "<p style='color: #64748b; text-align: center;'>Historial de completado vacío.</p>";
        return;
    }

    tareasCompletadas.forEach((t) => {
        const li = document.createElement('li');
        li.style.borderLeftColor = "#475569";
        li.innerHTML = `
            <div>
                <span class="tachado" style="font-size: 1.1rem; display: block;">${t.titulo}</span>
                <small style="color: #475569;">Completada con éxito</small>
            </div>
            <span style="color: #10b981; font-weight: bold; font-size: 12px;">FINALIZADA</span>
        `;
        lista.appendChild(li);
    });
}

function initCalendar() {
    const container = document.getElementById('calendar2026');
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    meses.forEach((nombre, mesIdx) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = "month-box";
        monthDiv.innerHTML = `<h4>${nombre}</h4>`;

        const daysGrid = document.createElement('div');
        daysGrid.className = "days-grid";

        const diasEnMes = new Date(2026, mesIdx + 1, 0).getDate();

        for (let dia = 1; dia <= diasEnMes; dia++) {
            const daySpan = document.createElement('div');
            daySpan.className = "day";
            daySpan.innerText = dia;
            daySpan.onclick = function() {
                document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                this.classList.add('selected');

                fechaSeleccionada = `${dia} de ${nombre}, 2026`;
                document.getElementById('selectedDateLabel').innerText = fechaSeleccionada;
            };
            daysGrid.appendChild(daySpan);
        }

        monthDiv.appendChild(daysGrid);
        container.appendChild(monthDiv);
    });
}

window.onload = initCalendar;

