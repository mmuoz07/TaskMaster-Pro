let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = ""; // Formato para mostrar: "12 Marzo, 2026"
let fechaSQL = "";          // Formato para la DB: "2026-03-12"

// --- FUNCIONES DE NAVEGACIÓN ---
function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');

    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

function toggleCalendario() {
    document.getElementById('calendarWrapper').classList.toggle('hidden');
}

// --- LOGICA DE BASE DE DATOS: CARGAR TAREAS ---
async function cargarTareasDesdeDB() {
    try {
        const res = await fetch('/api/tareas');
        const data = await res.json();
        
        // Filtramos y limpiamos las listas locales con datos de la DB
        tareasPendientes = data.filter(t => t.estado === 'Pendiente').map(t => ({
            id: t.id,
            titulo: t.descripcion,
            fecha: t.fecha_vencimiento ? new Date(t.fecha_vencimiento).toLocaleDateString() : "Sin fecha"
        }));

        tareasCompletadas = data.filter(t => t.estado === 'Completada').map(t => ({
            id: t.id,
            titulo: t.descripcion,
            fecha: "Completada"
        }));

        renderPendientes();
    } catch (error) {
        console.error("Error al sincronizar con la DB:", error);
    }
}

// --- LOGICA DE BASE DE DATOS: AGREGAR TAREA ---
async function agregarTarea() {
    const input = document.getElementById('taskInput');
    const texto = input.value.trim();

    if (!texto) {
        alert("Ingrese una descripción para la tarea.");
        return;
    }

    const nuevaTareaParaDB = {
        descripcion: texto,
        fecha_vencimiento: fechaSQL || null // Enviamos el formato YYYY-MM-DD
    };

    try {
        const response = await fetch('/api/tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTareaParaDB)
        });

        if (response.ok) {
            // Si el servidor responde bien, recargamos la lista desde la DB
            await cargarTareasDesdeDB();

            // Limpiar formulario UI
            input.value = "";
            fechaSeleccionada = "";
            fechaSQL = "";
            document.getElementById('selectedDateText').innerText = "Seleccionar en calendario";
            document.getElementById('calendarWrapper').classList.add('hidden');

            mostrar('menu');
        }
    } catch (error) {
        alert("Error de conexión. La tarea se guardará solo localmente.");
    }
}

// --- RENDERIZADO DE LISTAS ---
function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    if (!lista) return;
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

async function completarTarea(i) {
    const tarea = tareasPendientes[i];
    
    try {
        // Opcional: Avisar al servidor que la tarea se completó
        // await fetch(`/api/tareas/${tarea.id}/completar`, { method: 'PUT' });

        const movida = tareasPendientes.splice(i, 1)[0];
        tareasCompletadas.push(movida);
        renderPendientes();
    } catch (err) {
        console.error("Error al completar");
    }
}

function renderCompletadas() {
    const lista = document.getElementById('listaCompletadas');
    if (!lista) return;
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

// --- GENERADOR DE CALENDARIO 2026 ---
function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full');
    if (!container) return;
    
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

        const numDias = new Date(2026, mesIndex + 1, 0).getDate();

        for (let d = 1; d <= numDias; d++) {
            const day = document.createElement('div');
            day.className = "day";
            day.innerText = d;
            day.onclick = () => {
                document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
                day.classList.add('selected');
                
                // Guardamos para mostrar al usuario
                fechaSeleccionada = `${d} ${mes}, 2026`;
                
                // Guardamos en formato ISO para la DB (Mes + 1 porque Enero es 0)
                const mesIso = String(mesIndex + 1).padStart(2, '0');
                const diaIso = String(d).padStart(2, '0');
                fechaSQL = `2026-${mesIso}-${diaIso}`;

                document.getElementById('selectedDateText').innerText = fechaSeleccionada;
                toggleCalendario();
            };
            daysGrid.appendChild(day);
        }
        monthContainer.appendChild(daysGrid);
        container.appendChild(monthContainer);
    });
}

// --- INICIO ---
window.onload = () => {
    generarCalendarioCompleto();
    cargarTareasDesdeDB(); // Carga las tareas de la base de datos al abrir la web
};
