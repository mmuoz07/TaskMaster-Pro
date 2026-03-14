let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = ""; 
let fechaSQL = "";           

// --- FUNCIONES DE NAVEGACIÓN ---
function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');

    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

// --- REGISTRO ---
async function ejecutarRegistro() {
    const nombre = document.getElementById('regNombre').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    if (!nombre || !email || !pass) return alert("Rellena todos los campos.");

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_completo: nombre, email_corporativo: email, password: pass })
        });
        if (res.ok) {
            alert("Usuario registrado.");
            mostrar('login');
        } else {
            alert("Error al registrar.");
        }
    } catch (err) {
        alert("Sin conexión con el servidor.");
    }
}

// --- LOGIN ---
async function ejecutarLogin() {
    const email = document.getElementById('emailUser').value;
    const pass = document.getElementById('passUser').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_corporativo: email, password: pass })
        });
        const data = await res.json();
        if (res.ok) {
            alert("Bienvenido " + data.usuario);
            cargarTareasDesdeDB();
            mostrar('menu');
        } else {
            alert("Credenciales incorrectas.");
        }
    } catch (err) {
        alert("Error de conexión.");
    }
}

// --- CARGAR TAREAS ---
async function cargarTareasDesdeDB() {
    try {
        const res = await fetch('/api/tareas');
        const data = await res.json();
        
        tareasPendientes = data.filter(t => t.estado === 'Pendiente').map(t => ({
            id: t.id,
            titulo: t.descripcion,
            fecha: t.fecha_vencimiento ? new Date(t.fecha_vencimiento).toLocaleDateString() : "Sin fecha"
        }));

        tareasCompletadas = data.filter(t => t.estado === 'Completada').map(t => ({
            id: t.id,
            titulo: t.descripcion,
            fecha: "Hecha"
        }));

        renderPendientes();
    } catch (error) {
        console.log("Error al cargar datos");
    }
}

// --- AGREGAR TAREA ---
async function agregarTarea() {
    const input = document.getElementById('taskInput');
    const texto = input.value;

    if (!texto) return alert("Escribe una descripción.");

    const nuevaTarea = {
        descripcion: texto,
        fecha_vencimiento: fechaSQL || null
    };

    try {
        const response = await fetch('/api/tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea)
        });

        if (response.ok) {
            await cargarTareasDesdeDB();
            // Limpiar formulario
            input.value = "";
            fechaSeleccionada = "";
            fechaSQL = "";
            document.getElementById('selectedDateText').innerText = "Seleccionar fecha";
            document.getElementById('calendarWrapper').classList.add('hidden');
            mostrar('menu');
        }
    } catch (error) {
        alert("No se pudo guardar.");
    }
}

// --- RENDERIZADO ---
function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    if (!lista) return;
    lista.innerHTML = tareasPendientes.length ? "" : "<p>No hay tareas pendientes</p>";

    tareasPendientes.forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${t.titulo}</strong><br>
                <small>${t.fecha}</small>
            </div>
            <button class="tick-btn" onclick="completarTarea(${i})">✓</button>
        `;
        lista.appendChild(li);
    });
}

async function completarTarea(i) {
    const tarea = tareasPendientes[i];
    // Aquí podrías añadir un fetch PUT para actualizar en DB
    const movida = tareasPendientes.splice(i, 1)[0];
    tareasCompletadas.push(movida);
    renderPendientes();
}

function renderCompletadas() {
    const lista = document.getElementById('listaCompletadas');
    if (!lista) return;
    lista.innerHTML = tareasCompletadas.length ? "" : "<p>No hay tareas completadas</p>";

    tareasCompletadas.forEach((t) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${t.titulo}</span>`;
        lista.appendChild(li);
    });
}

// --- CALENDARIO ---
function toggleCalendario() {
    const wrapper = document.getElementById('calendarWrapper');
    if (wrapper) wrapper.classList.toggle('hidden');
}

function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full');
    if (!container) return;
    
    container.innerHTML = ""; // Limpiar antes de generar
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    meses.forEach((mes, mesIndex) => {
        const monthBox = document.createElement('div');
        monthBox.className = "month-box";
        
        const title = document.createElement('h4');
        title.innerText = mes;
        monthBox.appendChild(title);

        const daysGrid = document.createElement('div');
        daysGrid.className = "days-grid";
        const numDias = new Date(2026, mesIndex + 1, 0).getDate();

        for (let d = 1; d <= numDias; d++) {
            const day = document.createElement('div');
            day.className = "day";
            day.innerText = d;
            day.onclick = () => {
                // Quitar selección previa
                document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
                day.classList.add('selected');
                
                fechaSeleccionada = `${d} de ${mes}, 2026`;
                const mesIso = String(mesIndex + 1).padStart(2, '0');
                const diaIso = String(d).padStart(2, '0');
                fechaSQL = `2026-${mesIso}-${diaIso}`;
                
                document.getElementById('selectedDateText').innerText = fechaSeleccionada;
                toggleCalendario(); // Cerrar al seleccionar
            };
            daysGrid.appendChild(day);
        }
        monthBox.appendChild(daysGrid);
        container.appendChild(monthBox);
    });
}

window.onload = () => {
    generarCalendarioCompleto();
};
