let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = ""; 
let fechaSQL = "";          

function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
    }

    if (id === 'pendientes') renderPendientes();
    if (id === 'completadas') renderCompletadas();
}

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
        
        tareasPendientes = data.filter(t => t.estado === 'Pendiente').map(t => ({
            id: t.id, titulo: t.descripcion, fecha: t.fecha_vencimiento || "Plazo no definido"
        }));
        
        tareasCompletadas = data.filter(t => t.estado === 'Completada').map(t => ({
            id: t.id, titulo: t.descripcion
        }));
        
        renderPendientes();
    } catch (e) { console.error("Error al sincronizar"); }
}

async function agregarTarea() {
    const input = document.getElementById('taskInput');
    if (!input.value) return alert("Describa la tarea.");

    try {
        const res = await fetch('api.php?action=tareas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion: input.value, fecha_vencimiento: fechaSQL })
        });

        if (res.ok) {
            await cargarTareasDesdeDB();
            input.value = "";
            fechaSQL = "";
            document.getElementById('selectedDateText').innerText = "Pendiente de fecha";
            mostrar('menu');
        }
    } catch (error) { alert("Error al guardar."); }
}

function renderPendientes() {
    const lista = document.getElementById('listaPendientes');
    if (!lista) return;
    lista.innerHTML = tareasPendientes.length ? "" : "<p class='text-muted'>Sin tareas.</p>";
    tareasPendientes.forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<div><strong>${t.titulo}</strong><small>${t.fecha}</small></div>
                        <button class="btn-small-outline" onclick="completarTarea(${i})">✓ FINALIZAR</button>`;
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
    lista.innerHTML = tareasCompletadas.length ? "" : "<p class='text-muted'>Historial vacío.</p>";
    tareasCompletadas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${t.titulo}</span> <small style="color:var(--success)">COMPLETADA</small>`;
        lista.appendChild(li);
    });
}

function toggleCalendario() { 
    document.getElementById('calendarWrapper').classList.toggle('hidden'); 
}

function generarCalendarioCompleto() {
    const container = document.getElementById('calendar2026Full');
    if (!container) return;
    container.innerHTML = "";
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    meses.forEach((mes, mesIndex) => {
        const monthBox = document.createElement('div');
        monthBox.className = "month-box";
        monthBox.innerHTML = `<h4>${mes}</h4>`;
        const daysGrid = document.createElement('div');
        daysGrid.className = "days-grid";
        const numDias = new Date(2026, mesIndex + 1, 0).getDate();
        for (let d = 1; d <= numDias; d++) {
            const day = document.createElement('div');
            day.className = "day"; day.innerText = d;
            day.onclick = () => {
                fechaSeleccionada = `${d} ${mes}, 2026`;
                fechaSQL = `2026-${String(mesIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                document.getElementById('selectedDateText').innerText = fechaSeleccionada;
                toggleCalendario();
            };
            daysGrid.appendChild(day);
        }
        monthBox.appendChild(daysGrid);
        container.appendChild(monthBox);
    });
}

window.onload = generarCalendarioCompleto;
