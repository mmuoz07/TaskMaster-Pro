let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = ""; 
let fechaSQL = "";          

// 1. GESTIÓN DE PANTALLAS
function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    
    // Al entrar a pendientes, intentamos cargar desde la DB
    if (id === 'pendientes') cargarTareasDesdeDB();
    if (id === 'completadas') renderCompletadas();
}

// 2. FUNCIONES DEL CALENDARIO
function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full'); 
    if (!container) return;

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    container.innerHTML = ""; 

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
                fechaSeleccionada = `${d} de ${mes}, 2026`;
                const mIso = String(mesIndex + 1).padStart(2, '0');
                const dIso = String(d).padStart(2, '0');
                fechaSQL = `2026-${mIso}-${dIso}`;
                
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

// 3. LLAMADAS A LA API (CON SOPORTE DE TOKEN JWT)

async function ejecutarRegistro() {
    const nombre = document.getElementById('regNombre').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

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
            const data = await res.json();
            alert(data.error || "Error en el registro");
        }
    } catch (e) { alert("Error al conectar con el servidor."); }
}

async function ejecutarLogin() {
    const email = document.getElementById('emailUser').value;
    const pass = document.getElementById('passUser').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_corporativo: email, password: pass })
        });
        
        // Verificamos si la respuesta es válida antes de procesar JSON
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Credenciales inválidas");
        }
        
        const data = await res.json();
        
        // --- CAMBIO CLAVE: GUARDAR EL TOKEN ---
        if (data.token) {
            localStorage.setItem('tokenMaster', data.token);
        }
        
        alert("Bienvenido " + data.usuario); 
        mostrar('menu'); 
    } catch (e) { 
        alert(e.message); 
    }
}

async function agregarTarea() {
    const input = document.getElementById('taskInput');
    if (!input.value) return alert("Escribe la descripción.");
    
    // Recuperamos el token para poder pasar el middleware
    const token = localStorage.getItem('tokenMaster');

    try {
        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Enviamos la llave
            },
            body: JSON.stringify({ descripcion: input.value, fecha_vencimiento: fechaSQL })
        });

        if (res.ok) {
            input.value = "";
            document.getElementById('selectedDateText').innerText = "Seleccionar fecha";
            mostrar('menu');
        } else {
            alert("No tienes permiso o sesión expirada.");
        }
    } catch (e) { alert("Error al guardar tarea."); }
}

async function cargarTareasDesdeDB() {
    const token = localStorage.getItem('tokenMaster');
    
    try {
        const res = await fetch('/api/tasks', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` // Enviamos la llave
            }
        });

        if (!res.ok) {
            console.error("No autorizado");
            return;
        }

        const data = await res.json();
        
        tareasPendientes = data.filter(t => t.estado === 'Pendiente');
        tareasCompletadas = data.filter(t => t.estado === 'Completada');
        
        renderPendientes();
    } catch (e) { 
        console.error("Error al cargar datos o JSON inválido"); 
    }
}

// 4. RENDERING
function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    if (!lista) return;
    lista.innerHTML = tareasPendientes.length ? "" : "<p>No hay tareas pendientes</p>";
    
    tareasPendientes.forEach((t) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${t.descripcion}</strong><br>
                <small>${t.fecha_vencimiento || "Sin fecha"}</small>
            </div>
            <button class="tick-btn" onclick="completarTarea(${t.id})">✓</button>`;
        lista.appendChild(li);
    });
}

function renderCompletadas() {
    const lista = document.getElementById('listaCompletadas');
    if (!lista) return;
    lista.innerHTML = tareasCompletadas.length ? "" : "<p>No hay tareas completadas</p>";
    
    tareasCompletadas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${t.descripcion}</span>`;
        lista.appendChild(li);
    });
}

// Lógica para completar tarea (Faltaba en tu código base)
async function completarTarea(id) {
    const token = localStorage.getItem('tokenMaster');
    try {
        // Asumiendo que crearás una ruta para actualizar tareas
        const res = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) cargarTareasDesdeDB();
    } catch (e) { console.error("Error al completar"); }
}

window.onload = () => {
    generarCalendarioCompleto();
};
