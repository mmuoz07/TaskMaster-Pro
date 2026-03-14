let tareas = [];
let fechaSeleccionada = "";
let currentScreen = "login";

// Mostrar/ocultar pantallas
function mostrar(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screenElement = document.getElementById(id);
    if (screenElement) {
        screenElement.classList.add('active');
    }
    
    currentScreen = id;
    
    if (id === 'pendientes' || id === 'completadas') {
        renderListas();
    }
}

// Alternar entre login y registro
function alternarAuth(pantalla) {
    mostrar(pantalla);
}

// Simulación de login
function loginSimulado(e) {
    if (e) e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
    
    if (!email || !password) {
        alert("Por favor completa todos los campos");
        return;
    }
    
    // Validar formato email
    if (!email.includes('@')) {
        alert("Por favor ingresa un correo válido");
        return;
    }
    
    alert("¡Bienvenido!");
    mostrar('menu');
    
    // Limpiar formulario
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// Simulación de registro
function registroSimulado(e) {
    if (e) e.preventDefault();
    
    const nombre = document.getElementById('registerName')?.value || '';
    const email = document.getElementById('registerEmail')?.value || '';
    const password = document.getElementById('registerPassword')?.value || '';
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value || '';
    
    if (!nombre || !email || !password || !confirmPassword) {
        alert("Por favor completa todos los campos");
        return;
    }
    
    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }
    
    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
    }
    
    alert("¡Registro exitoso! Ahora inicia sesión");
    mostrar('login');
    
    // Limpiar formulario
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
}

// Agregar tarea
function agregarTareaLocal(e) {
    if (e) e.preventDefault();
    
    const input = document.getElementById('taskInput');
    if (!input.value.trim()) {
        alert("Por favor escribe una tarea");
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        descripcion: input.value.trim(),
        fecha: fechaSeleccionada || "Sin fecha",
        estado: 'Pendiente'
    };

    tareas.push(nuevaTarea);
    input.value = "";
    fechaSeleccionada = "";
    document.getElementById('selectedDateText').innerText = "Sin fecha seleccionada";
    
    alert("✓ Tarea guardada correctamente");
    mostrar('menu');
}

// Renderizar listas de tareas
function renderListas() {
    const listaPendientes = document.getElementById('listaPendientes');
    const listaCompletadas = document.getElementById('listaCompletadas');
    
    if (listaPendientes) {
        listaPendientes.innerHTML = "";
        const pendientes = tareas.filter(t => t.estado === 'Pendiente');
        
        if (pendientes.length === 0) {
            listaPendientes.innerHTML = '<li style="text-align: center; color: var(--text-muted); padding: 30px 0;">No hay tareas pendientes</li>';
        } else {
            pendientes.forEach(t => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div>
                        <strong>${t.descripcion}</strong>
                        <br>
                        <small style="color: var(--text-muted);">📅 ${t.fecha}</small>
                    </div>
                    <button class="btn-small-outline" onclick="completarTareaLocal(${t.id})">✓</button>
                `;
                listaPendientes.appendChild(li);
            });
        }
    }

    if (listaCompletadas) {
        listaCompletadas.innerHTML = "";
        const completadas = tareas.filter(t => t.estado === 'Completada');
        
        if (completadas.length === 0) {
            listaCompletadas.innerHTML = '<li style="text-align: center; color: var(--text-muted); padding: 30px 0;">Aún no hay tareas completadas</li>';
        } else {
            completadas.forEach(t => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div>
                        <strong style="text-decoration: line-through; color: var(--text-muted);">${t.descripcion}</strong>
                        <br>
                        <small style="color: var(--success);">✓ Completada</small>
                    </div>
                `;
                listaCompletadas.appendChild(li);
            });
        }
    }
}

// Completar tarea
function completarTareaLocal(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.estado = 'Completada';
        renderListas();
    }
}

// Toggle calendario
function toggleCalendario() {
    document.getElementById('calendarWrapper').classList.toggle('hidden');
}

// Generar calendario
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

// Cerrar sesión
function cerrarSesion() {
    if (confirm("¿Deseas cerrar sesión?")) {
        mostrar('login');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    }
}

// Inicializar
window.addEventListener('load', () => {
    generarCalendario();
    mostrar('login');
});;
