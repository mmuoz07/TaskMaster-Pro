let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = ""; 
let fechaSQL = "";          

// --- VALIDACIONES ---
function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// --- FUNCIONES DE NAVEGACIÓN Y PROTECCIÓN ---
function mostrar(id) {
    // PROTECCIÓN: Si intenta ir a una pantalla que no sea login/inicio y no hay sesión, mandarlo a login
    const usuarioLogueado = localStorage.getItem('usuarioNombre');
    if (!usuarioLogueado && id !== 'inicio' && id !== 'login' && id !== 'registro') {
        alert("Por favor, inicia sesión para acceder.");
        id = 'login';
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');

    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

// --- LÓGICA DE REGISTRO CON VALIDACIÓN ---
async function ejecutarRegistro() {
    const nombre = document.querySelector('input[placeholder="Nombre Completo"]').value.trim();
    const email = document.querySelector('input[placeholder="Email Corporativo"]').value.trim();
    const pass = document.querySelector('input[placeholder="Contraseña"]').value;

    // Validaciones
    if (!nombre) return alert("El nombre es obligatorio.");
    if (!esEmailValido(email)) return alert("Introduce un correo corporativo válido.");
    if (pass.length < 6) return alert("La contraseña debe tener al menos 6 caracteres.");

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_completo: nombre, email_corporativo: email, password: pass })
        });
        const data = await res.json();
        if (res.ok) {
            alert("✅ Registro exitoso. Ahora inicia sesión.");
            mostrar('login');
        } else {
            alert("❌ " + data.error);
        }
    } catch (err) {
        alert("Error de conexión con el servidor.");
    }
}

// --- LÓGICA DE LOGIN ---
async function ejecutarLogin() {
    const email = document.querySelector('input[placeholder="Correo Electrónico"]').value.trim();
    const pass = document.querySelectorAll('input[placeholder="Contraseña"]')[0].value;

    if (!esEmailValido(email)) return alert("Introduce un email válido.");

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_corporativo: email, password: pass })
        });
        const data = await res.json();
        if (res.ok) {
            // Guardar sesión en el navegador
            localStorage.setItem('usuarioNombre', data.usuario);
            alert("🔓 ¡Bienvenido, " + data.usuario + "!");
            cargarTareasDesdeDB();
            mostrar('menu');
        } else {
            alert("❌ " + data.error);
        }
    } catch (err) {
        alert("Error al intentar entrar.");
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuarioNombre');
    location.reload();
}

// --- LOGICA DE BASE DE DATOS: CARGAR TAREAS ---
async function cargarTareasDesdeDB() {
    if (!localStorage.getItem('usuarioNombre')) return; // No cargar si no hay sesión

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
        fecha_vencimiento: fechaSQL || null
    };

    try {
        const response = await fetch('/api/tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTareaParaDB)
        });

        if (response.ok) {
            await cargarTareasDesdeDB();
            input.value = "";
            fechaSeleccionada = "";
            fechaSQL = "";
            document.getElementById('selectedDateText').innerText = "Seleccionar en calendario";
            document.getElementById('calendarWrapper').classList.add('hidden');
            mostrar('menu');
        }
    } catch (error) {
        alert("Error de conexión con el servidor.");
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

// --- CALENDARIO 2026 ---
function toggleCalendario() {
    document.getElementById('calendarWrapper').classList.toggle('hidden');
}

function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full');
    if (!container) return;
    
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

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
                fechaSeleccionada = `${d} ${mes}, 2026`;
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
    
    // Si ya hay sesión guardada, cargar tareas
    if (localStorage.getItem('usuarioNombre')) {
        cargarTareasDesdeDB();
    }
};
