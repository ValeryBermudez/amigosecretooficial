// Inicializa Firebase sin módulos
const firebaseConfig = {
  apiKey: "AIzaSyCrifdi1gDTMMQ6_hza-qpSBGHFZB4ntLw",
  authDomain: "amigosecreto-cdc68.firebaseapp.com",
  databaseURL: "https://amigosecreto-cdc68-default-rtdb.firebaseio.com",
  projectId: "amigosecreto-cdc68",
  storageBucket: "amigosecreto-cdc68.appspot.com",
  messagingSenderId: "999049919734",
  appId: "1:999049919734:web:2568031cb5085b237b80d7",
  measurementId: "G-6347KWWQDL"
};

// Inicialización de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Función para descubrir amigo secreto
document.getElementById('descubrirBtn').addEventListener('click', function() {
    const nombreIngresado = document.getElementById('nombre').value.trim().toLowerCase();
    const nombreNormalizado = nombreIngresado.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const frases = [
        "Un amigo es un tesoro que no se encuentra todos los días.",
        "La verdadera amistad no tiene precio.",
        "Los amigos hacen que los buenos momentos sean mejores.",
        "Un amigo siempre está ahí, en las buenas y en las malas.",
        "La amistad es un regalo que se cuida con el corazón.",
        "Con amigos a tu lado, todo es más fácil.",
        "Un verdadero amigo te acepta tal como eres.",
        "Los amigos son la familia que elegimos.",
        "La vida es mejor con amigos a tu alrededor."
    ];
    
    console.log("Nombre ingresado:", nombreIngresado);
    console.log("Nombre normalizado:", nombreNormalizado);

    db.ref(`busquedas/${nombreNormalizado}`).once('value', (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('resultado').innerText = "Ya descubriste tu amigo secreto. No puedes realizar otra búsqueda.";
            console.log("Ya se realizó una búsqueda para este usuario.");
            return;
        }

        db.ref('registros').once('value').then((snapshot) => {
            const registros = snapshot.val();
            console.log("Registros encontrados:", registros);
            
            let amigo = null;
            let amigosDisponibles = Object.keys(registros).filter(key => {
                return key !== nombreNormalizado;
            });

            console.log("Amigos disponibles:", amigosDisponibles);

            if (amigosDisponibles.length > 0) {
                let amigoSecretoKey = amigosDisponibles[Math.floor(Math.random() * amigosDisponibles.length)];
                let amigoSecreto = registros[amigoSecretoKey];

                console.log("Amigo secreto seleccionado:", amigoSecreto);

                const mensaje = `Eres ${registros[nombreNormalizado].nombre}. Tu amigo secreto es ${amigoSecreto.nombre}. Le gusta: ${amigoSecreto.gustos} y no le gusta: ${amigoSecreto.noGustos}`;
                document.getElementById('resultado').innerText = mensaje;

                db.ref(`busquedas/${nombreNormalizado}`).set({
                    amigoSecreto: amigoSecreto.nombre,
                    fecha: new Date().toISOString()
                });
            } else {
                document.getElementById('error').innerText = "No hay suficientes participantes para realizar el sorteo.";
                console.log("No hay amigos disponibles.");
            }
        }).catch((error) => {
            console.error("Error al obtener los registros:", error);
        });
    }).catch((error) => {
        console.error("Error al verificar las búsquedas:", error);
    });
});
