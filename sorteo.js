// Función para normalizar nombres eliminando tildes y haciendo minúsculas
function normalizarNombre(nombre) {
    return nombre
        .normalize("NFD") // Normaliza caracteres Unicode, separa los diacríticos
        .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos (tildes)
        .toLowerCase(); // Convierte a minúsculas
}

// Función para cargar el JSON de amigos
async function cargarAmigos() {
    try {
        const response = await fetch('amigos.json'); // Cargar el archivo amigos.json
        const amigosData = await response.json(); // Convertir la respuesta en JSON
        return amigosData;
    } catch (error) {
        console.error('Error cargando amigos.json:', error);
        return null;
    }
}

// Función para descubrir el amigo secreto
async function descubrirAmigo(event) {
    event.preventDefault(); // Evita que el formulario se recargue
    const nombreUsuarioInput = document.getElementById('nombreConsulta').value.trim();
    const nombreUsuario = normalizarNombre(nombreUsuarioInput);
    const resultadoElement = document.getElementById('resultado');
    const amigoSecretoResultado = document.getElementById('amigoSecretoResultado');
    const gustosResultado = document.getElementById('gustosResultado');
    const noGustosResultado = document.getElementById('noGustosResultado');

    // Ocultar resultado previo
    resultadoElement.style.display = 'none';

    if (nombreUsuario === '') {
        amigoSecretoResultado.innerText = 'Por favor, ingresa tu nombre registrado.';
        resultadoElement.style.display = 'block';
        return;
    }

    // Cargar los datos del JSON
    const amigosData = await cargarAmigos();

    // Verificar si el usuario existe en el JSON
    const nombresNormalizados = Object.keys(amigosData).reduce((acc, nombre) => {
        acc[normalizarNombre(nombre)] = amigosData[nombre];
        return acc;
    }, {});

    if (!nombresNormalizados[nombreUsuario]) {
        amigoSecretoResultado.innerText = 'Usuario no encontrado. Asegúrate de haber escrito bien tu nombre.';
        resultadoElement.style.display = 'block';
        return;
    }

    // Revisar si ya hay un amigo secreto guardado en Local Storage
    const amigoSecretoGuardado = localStorage.getItem(`amigoSecreto-${nombreUsuario}`);
    if (amigoSecretoGuardado) {
        const amigoSecreto = JSON.parse(amigoSecretoGuardado);
        amigoSecretoResultado.innerText = `Tu amigo secreto es: ${amigoSecreto.nombre}`;
        gustosResultado.innerText = `Le gusta: ${amigoSecreto.gustos}`;
        noGustosResultado.innerText = `No le gusta: ${amigoSecreto.noGustos}`;
        resultadoElement.style.display = 'block';
        return;
    }

    // Obtener la lista de amigos disponibles
    const amigosDisponibles = Object.keys(nombresNormalizados).filter(nombre => nombre !== nombreUsuario && !nombresNormalizados[nombre].amigoSecreto);

    if (amigosDisponibles.length === 0) {
        amigoSecretoResultado.innerText = 'No hay amigos disponibles para asignar.';
        resultadoElement.style.display = 'block';
        return;
    }

    // Seleccionar un amigo secreto aleatorio
    const amigoSecretoNombre = amigosDisponibles[Math.floor(Math.random() * amigosDisponibles.length)];
    const amigoSecreto = {
        nombre: nombresNormalizados[amigoSecretoNombre].nombre,
        gustos: nombresNormalizados[amigoSecretoNombre].gustos,
        noGustos: nombresNormalizados[amigoSecretoNombre].noGustos
    };

    // Guardar la asignación en Local Storage para que siempre sea la misma
    localStorage.setItem(`amigoSecreto-${nombreUsuario}`, JSON.stringify(amigoSecreto));

    // Mostrar el resultado
    amigoSecretoResultado.innerText = `Tu amigo secreto es: ${amigoSecreto.nombre}`;
    gustosResultado.innerText = `Le gusta: ${amigoSecreto.gustos}`;
    noGustosResultado.innerText = `No le gusta: ${amigoSecreto.noGustos}`;
    resultadoElement.style.display = 'block';
}

// Asignar el evento de submit al formulario
document.getElementById('sorteoForm').addEventListener('submit', descubrirAmigo);
