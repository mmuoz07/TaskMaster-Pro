// ========== VARIABLES GLOBALES ==========
let tareas = [];
let usuarioActual = "";

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    cargarDatos();
});

function inicializarApp() {
    // Event listeners para autenticación
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleAuthLinks = document.querySelectorAll('.toggle-auth');
    const logoutBtn = document.getElementById('logoutBtn');
    const addTaskForm = document.getElementById('addTaskForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    toggleAuthLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthPanel(link.dataset.panel);
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (addTaskForm) {
        addTaskForm.addEventListener('submit', handleAddTask);
    }

    mostrarPantalla('authSection');
}

// ========== FUNCIONES DE AUTENTICACIÓN ==========

/**
 * Alterna entre paneles de login y registro
 */
function toggleAuthPanel(panel) {
    document.querySelectorAll('.auth-panel').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(panel + 'Panel').classList.add('active');
}

/**
 * Valida formato de email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Maneja el login del usuario
 */
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validaciones
    if (!email || !password) {
        mostrarNotificacion('Por favor completa todos los campos', 'error');
        return;
    }

    if (!validarEmail(email)) {
        mostrarNotificacion('Por favor ingresa un correo válido', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    // Guardar usuario y mostrar bienvenida
    usuarioActual = email.split('@')[0];
    mostrarNotificacion('¡Bienvenido ' + usuarioActual + '!', 'success');

    setTimeout(() => {
        document.getElementById('userName').textContent = usuarioActual.charAt(0).toUpperCase() + usuarioActual.slice(1);
        document.getElementById('loginForm').reset();
        mostrarPantalla('tasksSection');
        renderizarTareas();
    }, 500);
}

/**
 * Maneja el registro del usuario
 */
function handleRegister(e) {
    e.preventDefault();

    const nombre = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPassword2').value;

    // Validaciones
    if (!nombre || !email || !password || !confirmPassword) {
        mostrarNotificacion('Por favor completa todos los campos', 'error');
        return;
    }

    if (!validarEmail(email)) {
        mostrarNotificacion('Por favor ingresa un correo válido', 'error');
        return;
    }

    if (nombre.length < 3) {
        mostrarNotificacion('El nombre debe tener al menos 3 caracteres', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    if (password !== confirmPassword) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }

    mostrarNotificacion('¡Registro exitoso! Ahora inicia sesión', 'success');

    setTimeout(() => {
        document.getElementById('registerForm').reset();
        toggleAuthPanel('login');
    }, 500);
}

/**
 * Maneja logout del usuario
 */
function handleLogout() {
    if (confirm('¿Deseas cerrar sesión?')) {
        tareas = [];
        usuarioActual = '';
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        mostrarPantalla('authSection');
        toggleAuthPanel('login');
        mostrarNotificacion('Sesión cerrada correctamente', 'success');
        localStorage.removeItem('taskMasterTareas');
        localStorage.removeItem('taskMasterUsuario');
    }
}

// ========== FUNCIONES DE TAREAS ==========

/**
 * Maneja agregar nueva tarea
 */
function handleAddTask(e) {
    e.preventDefault();

    const taskInput = document.getElementById('taskInput');
    const descripcion = taskInput.value.trim();

    if (!descripcion) {
        mostrarNotificacion('Por favor escribe una tarea', 'error');
        return;
    }

    if (descripcion.length < 3) {
        mostrarNotificacion('La tarea debe tener al menos 3 caracteres', 'error');
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

    mostrarNotificacion('✓ Tarea añadida correctamente', 'success');
    renderizarTareas();
    guardarDatos();
}

/**
 * Completa o descompleta una tarea
 */
function completarTarea(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        renderizarTareas();
        mostrarNotificacion(
            tarea.completada ? '✓ Tarea completada' : '↩ Tarea marcada como pendiente',
            'success'
        );
        guardarDatos();
    }
}

/**
 * Elimina una tarea
 */
function eliminarTarea(id) {
    if (confirm('¿Deseas eliminar esta tarea?')) {
        tareas = tareas.filter(t => t.id !== id);
        renderizarTareas();
        mostrarNotificacion('Tarea eliminada', 'success');
        guardarDatos();
    }
}

/**
 * Renderiza todas las tareas
 */
function renderizarTareas() {
    const pendingContainer = document.getElementById('pendingTasks');
    const completedContainer = document.getElementById('completedTasks');

    if (!pendingContainer || !completedContainer) return;

    const tareasPendientes = tareas.filter(t => !t.completada);
    const tareasCompletadas = tareas.filter(t => t.completada);

    // Renderizar tareas pendientes
    if (tareasPendientes.length === 0) {
        pendingContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">No hay tareas pendientes</div>
            </div>
        `;
    } else {
        pendingContainer.innerHTML = '';
        tareasPendientes.forEach(tarea => {
            pendingContainer.appendChild(crearElementoTarea(tarea, false));
        });
    }

    // Renderizar tareas completadas
    if (tareasCompletadas.length === 0) {
        completedContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <div class="empty-state-text">Aún no hay tareas completadas</div>
            </div>
        `;
    } else {
        completedContainer.innerHTML = '';
        tareasCompletadas.forEach(tarea => {
            completedContainer.appendChild(crearElementoTarea(tarea, true));
        });
    }
}

/**
 * Crea el elemento HTML de una tarea
 */
function crearElementoTarea(tarea, completada) {
    const div = document.createElement('div');
    div.className = 'task-item';
    
    div.innerHTML = `
        <div class="task-content">
            <div class="task-description ${completada ? 'task-completed' : ''}">
                ${escaparHTML(tarea.descripcion)}
            </div>
            <div class="task-date">${tarea.fecha}</div>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="btn-complete" onclick="completarTarea(${tarea.id})" title="Marcar como ${completada ? 'pendiente' : 'completada'}">
                ${completada ? 'Deshacer' : 'Completar'}
            </button>
        </div>
    `;
    
    return div;
}

// ========== FUNCIONES UTILITARIAS ==========

/**
 * Escapa caracteres HTML para evitar inyecciones
 */
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/**
 * Muestra/oculta pantallas
 */
function mostrarPantalla(seccion) {
    document.querySelectorAll('.container > div').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(seccion).classList.add('active');
}

/**
 * Muestra notificaciones visuales
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
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
        animation: slideInRight 0.4s ease;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        max-width: 350px;
        word-wrap: break-word;
    `;

    if (tipo === 'success') {
        notif.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        notif.style.color = 'white';
    } else if (tipo === 'error') {
        notif.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        notif.style.color = 'white';
    }

    notif.textContent = mensaje;
    document.body.appendChild(notif);

    // Remover notificación después de 3 segundos
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            notif.remove();
        }, 400);
    }, 3000);
}

// ========== ALMACENAMIENTO LOCAL ==========

/**
 * Guarda datos en localStorage
 */
function guardarDatos() {
    localStorage.setItem('taskMasterTareas', JSON.stringify(tareas));
    localStorage.setItem('taskMasterUsuario', usuarioActual);
}

/**
 * Carga datos desde localStorage
 */
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
