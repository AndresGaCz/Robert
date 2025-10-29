document.addEventListener("DOMContentLoaded", () => {
    // URL de tu API (ajústala si tu API no corre en localhost:5000)
    const API_URL = 'http://67.202.26.61:5000'; // Asegúrate que esta URL sea correcta

    const allButtons = document.querySelectorAll(".control-button");
    const lastCommandDisplay = document.getElementById("last-command-display");
    const displayedCommand = document.getElementById("displayed-command");

    /**
     * Maneja el envío de un comando.
     * @param {string} command - El comando a ejecutar.
     */
    async function handleCommand(command) {
        // 1. Activa el botón visualmente
        allButtons.forEach(button => {
            button.classList.toggle("active", button.dataset.command === command);
        });

        // 2. Muestra el comando en el indicador local
        displayedCommand.textContent = command;
        lastCommandDisplay.classList.remove("hidden");

        console.log(`[Rover Control] Enviando comando: ${command}`);

        // 3. Envía el comando a la API (¡ESTA ES LA PARTE QUE FALTABA!)
        try {
            const response = await fetch(`${API_URL}/comando`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command: command }),
            });
            
            if (!response.ok) {
                console.error('Error al enviar el comando a la API');
            } else {
                const result = await response.json();
                console.log(`[Rover API] Respuesta: ${result.status}`);
            }
            
        } catch (error) {
            console.error('Fallo la conexión con la API:', error);
        }

        // 4. Simula la ejecución (solo para la UI)
        setTimeout(() => {
            allButtons.forEach(button => button.classList.remove("active"));
            lastCommandDisplay.classList.add("hidden");
        }, 300);
    }

    // Añadir un 'event listener' a cada botón
    allButtons.forEach(button => {
        button.addEventListener("click", () => {
            const command = button.dataset.command;
            handleCommand(command);
        });
    });

});
