let tareas = []; // Usaremos un solo array para simplificar
let fechaSeleccionada = "";
let fechaSQL = "";

function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (id === 'pendientes') renderListas();
    if (id === 'completadas') renderListas();
}

// Simulación de login sin servidor
function loginSimulado() {
    mostrar('menu');
}

function agregarTareaLocal() {
    const input = document.getElementById('taskInput');
    if (!input.value) return alert("Escribe una tarea");

    const nuevaTarea = {
        id: Date.now(),
        descripcion: input.value,
        fecha: fechaSeleccionada || "Sin fecha",
        estado: 'Pendiente'
    };

    tareas.push(nuevaTarea);
    input.value = "";
    fechaSeleccionada = "";
    document.getElementById('selectedDateText').innerText = "Sin fecha seleccionada";
    
    alert("Tarea guardada correctamente");
    mostrar('menu');
}

function renderListas() {
    const listaPendientes = document.getElementById('listaPendientes');
    const listaCompletadas = document.getElementById('listaCompletadas');
    
    if (listaPendientes) {
        listaPendientes.innerHTML = "";
        tareas.filter(t => t.estado === 'Pendiente').forEach(t => {
            const li = document.createElement('li');
            li.innerHTML = `<div><strong>${t.descripcion}</strong><br><small>${t.fecha}</small></div>
                            <button class="btn-small-outline" onclick="completarTareaLocal(${t.id})">✓</button>`;
            listaPendientes.appendChild(li);
        });
    }

    if (listaCompletadas) {
        listaCompletadas.innerHTML = "";
        tareas.filter(t => t.estado === 'Completada').forEach(t => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${t.descripcion}</span> <small style="color:green">Listo</small>`;
            listaCompletadas.appendChild(li);
        });
    }
}

function completarTareaLocal(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.estado = 'Completada';
        renderListas();
    }
}

function toggleCalendario() {
    document.getElementById('calendarWrapper').classList.toggle('hidden');
}

function generarCalendario() {
    const container = document.getElementById('calendar2026Full');
    if (!container) return;
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    meses.forEach((mes, i) => {
        const box = document.createElement('div');
        box.className = "month-box";
        box.innerHTML = `<h4>${mes}</h4>`;
        const grid = document.createElement('div');
        grid.className = "days-grid";
        const dias = new Date(2026, i + 1, 0).getDate();
        
        for (let d = 1; d <= dias; d++) {
            const day = document.createElement('div');
            day.className = "day";
            day.innerText = d;
            day.onclick = () => {
                fechaSeleccionada = `${d} de ${mes}, 2026`;
                document.getElementById('selectedDateText').innerText = fechaSeleccionada;
                toggleCalendario();
            };
            grid.appendChild(day);
        }
        box.appendChild(grid);
        container.appendChild(box);
    });
}

window.onload = generarCalendario;
