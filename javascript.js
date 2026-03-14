// ========== VARIABLES GLOBALES ==========
let tareas = [];
let usuarioActual = "";

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    cargarDatos();
});

function inicializarApp() {
    // Event listeners autenticación
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    
    document.querySelectorAll('.toggle-auth').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthPanel(link.dataset.panel);
        });
    });

    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('addTaskForm')?.addEventListener('submit', handleAddTask);

    mostrarSeccion('auth');
}

// ========== AUTENTICACIÓN ==========

function toggleAuthPanel(panel) {
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panel + 'Panel').classList.add('active');
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        mostrarNotificacion('Por favor completa todos los campos', 'error');
        return;
    }

    if (!validarEmail(email)) {
        mostrarNotificacion('Correo inválido', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarNotificacion('Contraseña debe tener 6+ caracteres', 'error');
        return;
    }

    usuarioActual = email.split('@')[0];
    mostrarNotificacion('¡Bienvenido ' + usuarioActual + '!', 'success');

    setTimeout(() => {
        document.getElementById('userName').textContent = usuarioActual.charAt(0).toUpperCase() + usuarioActual.slice(1);
        document.getElementById('loginForm').reset();
        mostrarSeccion('tasks');
        renderizarTareas();
    }, 800);
}

function handleRegister(e) {
    e.preventDefault();

    const nombre = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPassword2').value;

    if (!nombre || !email || !password || !confirmPassword) {
        mostrarNotificacion('Completa todos los campos', 'error');
        return;
    }

    if (!validarEmail(email)) {
        mostrarNotificacion('Correo inválido', 'error');
        return;
    }

    if (nombre.length < 3) {
        mostrarNotificacion('Nombre debe tener 3+ caracteres', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarNotificacion('Contraseña debe tener 6+ caracteres', 'error');
        return;
    }

    if (password !== confirmPassword) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }

    mostrarNotificacion('¡Registro exitoso! Inicia sesión', 'success');

    setTimeout(() => {
        document.getElementById('registerForm').reset();
        toggleAuthPanel('login');
    }, 800);
}

function handleLogout() {
    if (confirm('¿Cerrar sesión?')) {
        tareas = [];
        usuarioActual = '';
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        mostrarSeccion('auth');
        toggleAuthPanel('login');
        mostrarNotificacion('Sesión cerrada', 'success');
        localStorage.clear();
    }
}

// ========== TAREAS ==========

function handleAddTask(e) {
    e.preventDefault();

    const taskInput = document.getElementById('taskInput');
    const descripcion = taskInput.value.trim();

    if (!descripcion) {
        mostrarNotificacion('Escribe una tarea', 'error');
        return;
    }

    if (descripcion.length < 3) {
        mostrarNotificacion('Tarea muy corta (mín 3 caracteres)', 'error');
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        descripcion: descripcion,
        completada: false,
        fecha: new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    };

    tareas.push(nuevaTarea);
    taskInput.value = '';
    taskInput.focus();

    mostrarNotificacion('✓ Tarea añadida', 'success');
    renderizarTareas();
    guardarDatos();
}

function completarTarea(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        renderizarTareas();
        guardarDatos();
    }
}

function eliminarTarea(id) {
    if (confirm('¿Eliminar tarea?')) {
        tareas = tareas.filter(t => t.id !== id);
        mostrarNotificacion('Tarea eliminada', 'success');
        renderizarTareas();
        guardarDatos();
    }
}

function renderizarTareas() {
    const pendingContainer = document.getElementById('pendingTasks');
    const completedContainer = document.getElementById('completedTasks');

    const tareasPendientes = tareas.filter(t => !t.completada);
    const tareasCompletadas = tareas.filter(t => t.completada);

    // Actualizar contadores
    document.getElementById('pendingCount').textContent = tareasPendientes.length;
    document.getElementById('completedCount').textContent = tareasCompletadas.length;

    // Pendientes
    if (tareasPendientes.length === 0) {
        pendingContainer.innerHTML = '<div class="empty-message"><p>📝 Crea tu primera tarea</p></div>';
    } else {
        pendingContainer.innerHTML = '';
        tareasPendientes.forEach(tarea => {
            pendingContainer.appendChild(crearElementoTarea(tarea));
        });
    }

    // Completadas
    if (tareasCompletadas.length === 0) {
        completedContainer.innerHTML = '<div class="empty-message"><p>🎯 Completa tus primeras tareas</p></div>';
    } else {
        completedContainer.innerHTML = '';
        tareasCompletadas.forEach(tarea => {
            completedContainer.appendChild(crearElementoTarea(tarea, true));
        });
    }
}

function crearElementoTarea(tarea, completada = false) {
    const div = document.createElement('div');
    div.className = `task-item ${completada ? 'completed' : ''}`;
    
    div.innerHTML = `
        <div class="task-content">
            <div class="task-text">${escaparHTML(tarea.descripcion)}</div>
            <div class="task-date">${tarea.fecha}</div>
        </div>
        <div class="task-actions">
            <button class="btn-complete" onclick="completarTarea(${tarea.id})">
                ${completada ? 'Deshacer' : '✓'}
            </button>
        </div>
    `;
    
    return div;
}

// ========== UTILIDADES ==========

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function mostrarSeccion(seccion) {
    document.querySelectorAll('.auth-section, .tasks-section').forEach(el => {
        el.classList.remove('active');
    });

    if (seccion === 'auth') {
        document.getElementById('authSection').classList.add('active');
    } else if (seccion === 'tasks') {
        document.getElementById('tasksSection').classList.add('active');
    }
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        z-index: 9999;
        animation: slideUp 0.4s ease;
        max-width: 350px;
        word-wrap: break-word;
    `;

    if (tipo === 'success') {
        notif.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        notif.style.color = 'white';
        notif.style.boxShadow = '0 8px 16px rgba(72, 187, 120, 0.3)';
    } else {
        notif.style.background = 'linear-gradient(135deg, #f56565, #e53e3e)';
        notif.style.color = 'white';
        notif.style.boxShadow = '0 8px 16px rgba(245, 101, 101, 0.3)';
    }

    notif.textContent = mensaje;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'slideDown 0.4s ease';
        setTimeout(() => notif.remove(), 400);
    }, 3500);
}

// ========== ALMACENAMIENTO ==========

function guardarDatos() {
    localStorage.setItem('taskMasterTareas', JSON.stringify(tareas));
    localStorage.setItem('taskMasterUsuario', usuarioActual);
}

function cargarDatos() {
    const tareasGuardadas = localStorage.getItem('taskMasterTareas');
    const usuarioGuardado = localStorage.getItem('taskMasterUsuario');

    if (tareasGuardadas) {
        tareas = JSON.parse(tareasGuardadas);
    }

    if (usuarioGuardado) {
        usuarioActual = usuarioGuardado;
    }
}
