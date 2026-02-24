let tareasPendientes = [];
let tareasCompletadas = [];
let fechaSeleccionada = "";


function mostrar(id) {
    document.querySelectorAll('.screen').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
    
    if (id === 'pendientes' || id === 'completadas') {
        actualizarListas();
    }
}


function toggleCalendario() {
    const cal = document.getElementById("calendar2026");
    if (cal.style.display === "none" || cal.style.display === "") {
        cal.style.display = "block";
    } else {
        cal.style.display = "none";
    }
}


function agregarTarea() {
    let texto = document.getElementById("nuevaTarea").value;

    if (texto.trim() === "") {
        alert("Por favor, escribe una tarea");
        return;
    }

    let tareaCompleta = texto;

    if (fechaSeleccionada !== "") {
        tareaCompleta += " - " + fechaSeleccionada;
    }

    tareasPendientes.push(tareaCompleta);

    document.getElementById("nuevaTarea").value = "";
    fechaSeleccionada = "";
    document.getElementById("calendar2026").style.display = "none";

    actualizarListas();
    mostrar('menu');
    
    alert("Tarea agregada exitosamente");
}

function actualizarListas() {
    let listaP = document.getElementById("listaPendientes");
    let listaC = document.getElementById("listaCompletadas");

    listaP.innerHTML = "";
    listaC.innerHTML = "";

   
    if (tareasPendientes.length === 0) {
        listaP.innerHTML = '<p class="empty-message">No hay tareas pendientes</p>';
    } else {
        tareasPendientes.forEach((tarea, index) => {
            let li = document.createElement("li");
            li.innerHTML = '<span>' + tarea + '</span><span class="action-btn">Completar</span>';
            li.onclick = function() {
                completarTarea(index);
            };
            listaP.appendChild(li);
        });
    }

   
    if (tareasCompletadas.length === 0) {
        listaC.innerHTML = '<p class="empty-message">No hay tareas completadas</p>';
    } else {
        tareasCompletadas.forEach((tarea, index) => {
            let li = document.createElement("li");
            li.classList.add("completed");
            li.innerHTML = '<span>✓ ' + tarea + '</span><span class="delete-btn" onclick="event.stopPropagation(); eliminarCompletada(' + index + ')">Eliminar</span>';
            listaC.appendChild(li);
        });
    }
}


function completarTarea(index) {
    const tarea = tareasPendientes[index];
    tareasCompletadas.push(tarea);
    tareasPendientes.splice(index, 1);
    actualizarListas();
}


function eliminarCompletada(index) {
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
        tareasCompletadas.splice(index, 1);
        actualizarListas();
    }
}


function generarCalendario2026() {
    const calendario = document.getElementById("calendarGrid");
    calendario.innerHTML = "";

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];

    for (let mes = 0; mes < 12; mes++) {
        const primerDia = new Date(2026, mes, 1).getDay();
        const diasEnMes = new Date(2026, mes + 1, 0).getDate();

        const mesDiv = document.createElement("div");
        mesDiv.classList.add("mes");

        const titulo = document.createElement("h3");
        titulo.textContent = meses[mes] + " 2026";
        mesDiv.appendChild(titulo);

        const diasDiv = document.createElement("div");
        diasDiv.classList.add("dias");

        
        diasSemana.forEach(dia => {
            const d = document.createElement("div");
            d.innerHTML = "<strong>" + dia + "</strong>";
            diasDiv.appendChild(d);
        });

      
        let ajuste = primerDia === 0 ? 6 : primerDia - 1;

        for (let i = 0; i < ajuste; i++) {
            diasDiv.appendChild(document.createElement("div"));
        }

   
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const d = document.createElement("div");
            d.textContent = dia;

            d.onclick = function() {
                document.querySelectorAll(".dias div").forEach(el => {
                    el.classList.remove("selected");
                    el.style.background = "";
                    el.style.color = "";
                });

                d.classList.add("selected");
                d.style.background = "#28a745";
                d.style.color = "white";

                fechaSeleccionada = dia + "/" + (mes + 1) + "/2026";
            };

            diasDiv.appendChild(d);
        }

        mesDiv.appendChild(diasDiv);
        calendario.appendChild(mesDiv);
    }
}


window.onload = function() {
    generarCalendario2026();
};