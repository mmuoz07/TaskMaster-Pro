let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = ""; 
let fechaSQL = "";          

function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

// --- LLAMADAS A LA API PHP ---

async function ejecutarRegistro() {
    const nombre = document.querySelector('input[placeholder="Nombre Completo"]').value;
    const email = document.querySelector('input[placeholder="Email Corporativo"]').value;
    const pass = document.querySelector('input[placeholder="Contraseña"]').value;

    const res = await fetch('api.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_completo: nombre, email_corporativo: email, password: pass })
    });
    if (res.ok) { alert("Usuario registrado."); mostrar('login'); }
}

async function ejecutarLogin() {
    const email = document.querySelector('input[placeholder="Correo Electrónico"]').value;
    const pass = document.querySelectorAll('input[placeholder="Contraseña"]')[0].value;

    const res = await fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_corporativo: email, password: pass })
    });
    const data = await res.json();
    if (res.ok) { alert("Bienvenido " + data.usuario); cargarTareasDesdeDB(); mostrar('menu'); }
    else { alert("Error en los datos."); }
}

async function cargarTareasDesdeDB() {
    try {
        const res = await fetch('api.php?action=tareas');
        const data = await res.json();
        tareasPendientes = data.filter(t => t.estado === 'Pendiente').map(t => ({
            id: t.id, titulo: t.descripcion, fecha: t.fecha_vencimiento || "Sin fecha"
        }));
        tareasCompletadas = data.filter(t => t.estado === 'Completada').map(t => ({
            id: t.id, titulo: t.descripcion
        }));
        renderPendientes();
    } catch (e) { console.log("Error al cargar"); }
}

async function agregarTarea() {
    const input = document.getElementById('taskInput');
    if (!input.value) return alert("Escribe algo.");

    const res = await fetch('api.php?action=tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: input.value, fecha_vencimiento: fechaSQL })
    });

    if (res.ok) {
        await cargarTareasDesdeDB();
        input.value = "";
        document.getElementById('selectedDateText').innerText = "Seleccionar fecha";
        mostrar('menu');
    }
}

// --- RENDER Y CALENDARIO (TUS FUNCIONES) ---

function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    if (!lista) return;
    lista.innerHTML = tareasPendientes.length ? "" : "<p>No hay tareas</p>";
    tareasPendientes.forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<div><strong>${t.titulo}</strong><br><small>${t.fecha}</small></div><button onclick="completarTarea(${i})">✓</button>`;
        lista.appendChild(li);
    });
}

function completarTarea(i) {
    const movida = tareasPendientes.splice(i, 1)[0];
    tareasCompletadas.push(movida);
    renderPendientes();
}

function renderCompletadas() {
    const lista = document.getElementById('listaCompletadas');
    if (!lista) return;
    lista.innerHTML = tareasCompletadas.length ? "" : "<p>Vacío</p>";
    tareasCompletadas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${t.titulo}</span>`;
        lista.appendChild(li);
    });
}

function toggleCalendario() { document.getElementById('calendarWrapper').classList.toggle('hidden'); }

function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full');
    if (!container) return;
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    meses.forEach((mes, mesIndex) => {
        const monthContainer = document.createElement('div');
        monthContainer.className = "month-container";
        const title = document.createElement('div');
        title.className = "month-title"; title.innerText = mes;
        monthContainer.appendChild(title);
        const daysGrid = document.createElement('div');
        daysGrid.className = "days-grid";
        const numDias = new Date(2026, mesIndex + 1, 0).getDate();
        for (let d = 1; d <= numDias; d++) {
            const day = document.createElement('div');
            day.className = "day"; day.innerText = d;
            day.onclick = () => {
                fechaSeleccionada = `${d} ${mes}, 2026`;
                const mIso = String(mesIndex + 1).padStart(2, '0');
                const dIso = String(d).padStart(2, '0');
                fechaSQL = `2026-${mIso}-${dIso}`;
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
