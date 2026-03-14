let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = ""; 
let fechaSQL = "";          

/**
 * Control de navegación entre pantallas
 */
function mostrar(id) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Activar la pantalla objetivo
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
    }

    // Cargar datos específicos según la pantalla
    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

// --- LLAMADAS A LA API PHP ---

async function ejecutarRegistro() {
    const section = document.getElementById('registro');
    const nombre = section.querySelector('input[placeholder="Nombre Completo"]').value;
    const email = section.querySelector('input[placeholder="Email Corporativo"]').value;
    const pass = section.querySelector('input[placeholder="Contraseña"]').value;

    if (!nombre || !email || !pass) return alert("Por favor, rellene todos los campos.");

    try {
        const res = await fetch('api.php?action=register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_completo: nombre, email_corporativo: email, password: pass })
        });
        if (res.ok) { 
            alert("Perfil profesional creado correctamente."); 
            mostrar('login'); 
        }
    } catch (error) {
        alert("Error en el servidor de registro.");
    }
}

async function ejecutarLogin() {
    const section = document.getElementById('login');
    const email = section.querySelector('input[placeholder="Email Corporativo"]').value;
    const pass = section.querySelector('input[placeholder="Contraseña"]').value;

    if (!email || !pass) return alert("Ingrese credenciales.");

    try {
        const res = await fetch('api.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_corporativo: email, password: pass })
        });
        
        const data = await res.json();
        if (res.ok) { 
            alert("Autenticación exitosa. Bienvenido " + data.usuario); 
            cargarTareasDesdeDB(); 
            mostrar('menu'); 
        } else { 
            alert("Acceso denegado: Verifique sus credenciales."); 
        }
    } catch (error) {
        alert("Error de conexión con el servidor.");
    }
}

async function cargarTareasDesdeDB() {
    try {
        const res = await fetch('api.php?action=tareas');
        const data = await res.json();
        
        // Mapeo de datos desde la base de datos
        tareasPendientes = data.filter(t => t.estado === 'Pendiente').map(t => ({
            id: t.id, 
            titulo: t.descripcion, 
            fecha: t.fecha_vencimiento || "Plazo no definido"
        }));
        
        tareasCompletadas = data.filter(t => t.estado === 'Completada').map(t => ({
            id: t.id, 
            titulo: t.descripcion
        }));
        
        renderPendientes();
    } catch (e) { 
        console.error("Error al sincronizar tareas"); 
    }
}

async function agregarTarea() {
    const input = document.getElementById('taskInput');
    if (!input.value) return alert("Describa la tarea antes de guardar.");

    try {
        const res = await fetch('api.php?action=tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                descripcion: input.value, 
                fecha_vencimiento: fechaSQL 
            })
        });

        if (res.ok) {
            await cargarTareasDesdeDB();
            // Resetear formulario
            input.value = "";
            fechaSQL = "";
            document.getElementById('selectedDateText').innerText = "Seleccionar fecha";
            alert("Tarea registrada en el sistema.");
            mostrar('menu');
        }
    } catch (error) {
        alert("No se pudo guardar la tarea.");
    }
}

// --- RENDERIZADO DE INTERFAZ ---

function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    if (!lista) return;
    
    lista.innerHTML = "";
    
    if (tareasPendientes.length === 0) {
        lista.innerHTML = "<p class='text-muted'>No hay tareas pendientes en el registro.</p>";
        return;
    }

    tareasPendientes.forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${t.titulo}</strong>
                <small>${t.fecha}</small>
            </div>
            <button class="btn-small-outline" onclick="completarTarea(${i})">✓ FINALIZAR</button>
        `;
        lista.appendChild(li);
    });
}

function completarTarea(i) {
    // Aquí podrías añadir una llamada fetch para actualizar el estado en la DB
    const movida = tareasPendientes.splice(i, 1)[0];
    tareasCompletadas.push(movida);
    renderPendientes();
}

function renderCompletadas() {
    const lista = document.getElementById('listaCompletadas');
    if (!lista) return;

    lista.innerHTML = "";

    if (tareasCompletadas.length === 0) {
        lista.innerHTML = "<p class='text-muted'>El historial está vacío.</p>";
        return;
    }

    tareasCompletadas.forEach(t => {
        const li = document.createElement('li');
        li.style.opacity = "0.6";
        li.innerHTML = `<span>${t.titulo}</span> <small style="color:var(--success)">COMPLETADA</small>`;
        lista.appendChild(li);
    });
}

// --- CALENDARIO PROFESIONAL ---

function toggleCalendario() { 
    document.getElementById('calendarWrapper').classList.toggle('hidden'); 
}

function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full');
    if (!container) return;
    
    container.innerHTML = ""; // Limpiar contenido previo
    
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
                fechaSeleccionada = `${d} ${mes}, 2026`;
                const mIso = String(mesIndex + 1).padStart(2, '0');
                const dIso = String(d).padStart(2, '0');
                fechaSQL = `2026-${mIso}-${dIso}`;
                
                document.getElementById('selectedDateText').innerText = fechaSeleccionada;
                toggleCalendario();
            };
            daysGrid.appendChild(day);
        }
        monthBox.appendChild(daysGrid);
        container.appendChild(monthBox);
    });
}

// Inicialización
window.onload = () => {
    generarCalendarioCompleto();
};
        usuarioActual = usuarioGuardado;
    }
}
