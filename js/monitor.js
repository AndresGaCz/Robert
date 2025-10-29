document.addEventListener("DOMContentLoaded", () => {
    // URL de tu API
    const API_URL = 'http://67.202.26.61:5000';

    const roverCurrentCommand = document.getElementById("rover-current-command");
    const commandHistoryList = document.getElementById("command-history");

    /**
     * Obtiene los datos de la API y actualiza la UI
     */
    async function updateMonitorUI() {
        try {
            const response = await fetch(`${API_URL}/historial`);
            if (!response.ok) {
                console.error('Error al obtener el historial');
                roverCurrentCommand.textContent = "Error de Conexión";
                return;
            }
            
            const historial = await response.json();

            // 1. Actualizar el "Estado Actual" con el último comando
            if (historial.length > 0) {
                // El primer item [0] es el más reciente
                roverCurrentCommand.textContent = historial[0].comando; 
                roverCurrentCommand.style.color = 'white';
            } else {
                roverCurrentCommand.textContent = "N/A - Sin comandos";
                roverCurrentCommand.style.color = 'white';
            }

            // 2. Actualizar el historial de comandos
            commandHistoryList.innerHTML = ''; // Limpiar la lista actual
            
            if (historial.length === 0) {
                const li = document.createElement('li');
                li.textContent = "No hay comandos en el historial.";
                commandHistoryList.appendChild(li);
            } else {
                historial.forEach(item => {
                    const li = document.createElement('li');
                    // Usamos los datos que nos dio la API
                    li.textContent = `${item.timestamp}: ${item.comando}`;
                    commandHistoryList.appendChild(li);
                });
            }

        } catch (error) {
            console.error('Fallo la conexión con la API:', error);
            roverCurrentCommand.textContent = "API Desconectada";
        }
    }

    // --- NUEVO: LÓGICA DEL SIMULADOR DE OBSTÁCULOS ---

const obstacleControls = document.getElementById("obstacle-simulator-controls");

obstacleControls.addEventListener('click', async (e) => {
    // Solo reacciona si se hizo clic en un botón con 'data-clave'
    if (e.target.matches('.obstacle-btn')) {
        const clave = e.target.dataset.clave;
        const nombreObstaculo = e.target.textContent;
        
        console.log(`Simulando obstáculo: ${nombreObstaculo} (Clave: ${clave})`);

        try {
            const response = await fetch(`${API_URL}/obstaculo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clave: parseInt(clave) }) // Envía la clave como número
            });

            if (!response.ok) {
                const err = await response.json();
                alert(`Error al simular obstáculo: ${err.error}`);
                return;
            }

            const result = await response.json();
            
            // ¡Éxito!
            alert(`Obstáculo "${nombreObstaculo}" simulado.\n\nMovimiento de evasión ejecutado: ${result.movimiento_sugerido_texto}`);
            
            // Forzamos una actualización inmediata del historial de movimientos
            updateMonitorUI();

        } catch (error) {
            console.error('Error de red al simular obstáculo:', error);
            alert('Error de conexión con la API.');
        }
    }
});
    // Actualizar la UI de monitoreo al cargar la página
    updateMonitorUI();

    // Configurar un intervalo para actualizar el monitoreo periódicamente
    setInterval(updateMonitorUI, 2000); // Actualiza cada 2 segundos

});
