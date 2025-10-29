document.addEventListener("DOMContentLoaded", () => {
    // URL de tu API
    const API_URL = 'http://67.202.26.61:5000';

    // --- Elementos de "Crear Demo" ---
    const demoNombreInput = document.getElementById("demo-nombre-input");
    const sequenceBuilderControls = document.querySelector(".sequence-builder-controls");
    const demoSequenceList = document.getElementById("demo-sequence-list");
    const saveDemoButton = document.getElementById("save-demo-button");
    const clearDemoButton = document.getElementById("clear-demo-button");
    
    // --- Elementos de "Demos Existentes" ---
    const demoList = document.getElementById("demo-list");

    // --- Estado Local ---
    let currentSequence = []; // Aquí guardamos los movimientos

    // --- 1. LÓGICA DE CARGAR DEMOS ---

    /**
     * Carga la lista de demos existentes desde la API
     */
    async function loadDemos() {
        demoList.innerHTML = '<li>Cargando...</li>';
        try {
            const response = await fetch(`${API_URL}/demos`);
            if (!response.ok) {
                demoList.innerHTML = '<li>Error al cargar demos.</li>';
                return;
            }
            const demos = await response.json();

            if (demos.length === 0) {
                demoList.innerHTML = '<li>No hay demos guardadas.</li>';
                return;
            }

            demoList.innerHTML = ''; // Limpiar
            demos.forEach(demo => {
                const li = document.createElement('li');
                li.textContent = demo.nombre;
                
                // Añadir botón de Ejecutar
                const runButton = document.createElement('button');
                runButton.textContent = 'Ejecutar';
                runButton.className = 'demo-run-button';
                runButton.dataset.id = demo.id;
                
                runButton.addEventListener('click', () => {
                    runDemo(demo.id, demo.nombre);
                });
                
                li.appendChild(runButton);
                demoList.appendChild(li);
            });

        } catch (error) {
            console.error('Error de red al cargar demos:', error);
            demoList.innerHTML = '<li>Error de conexión con la API.</li>';
        }
    }

    // --- 2. LÓGICA DE CREAR DEMO ---

    /**
     * Actualiza la lista visual de la secuencia actual
     */
    function updateSequenceList() {
        if (currentSequence.length === 0) {
            demoSequenceList.innerHTML = '<li>Añade movimientos...</li>';
            return;
        }
        
        demoSequenceList.innerHTML = ''; // Limpiar
        currentSequence.forEach((comando, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${comando}`;
            demoSequenceList.appendChild(li);
        });
    }

    // Event listener para los botones del constructor
    sequenceBuilderControls.addEventListener('click', (e) => {
        // Solo reacciona si se hizo clic en un botón con 'data-command'
        if (e.target.matches('.control-button-demo')) {
            const command = e.target.dataset.command;
            currentSequence.push(command);
            updateSequenceList();
        }
    });

    // Event listener para el botón de Limpiar
    clearDemoButton.addEventListener('click', () => {
        currentSequence = [];
        updateSequenceList();
    });

    // Event listener para el botón de Guardar
    saveDemoButton.addEventListener('click', async () => {
        const nombre = demoNombreInput.value.trim();
        
        if (nombre === '') {
            alert('Por favor, ponle un nombre a la demo.');
            return;
        }
        if (currentSequence.length === 0) {
            alert('Por favor, añade al menos un movimiento a la secuencia.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/demos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre,
                    movimientos: currentSequence
                })
            });
            
            if (!response.ok) {
                alert('Error al guardar la demo. Revisa la consola.');
                return;
            }
            
            alert('¡Demo guardada con éxito!');
            
            // Limpiar y recargar la lista de demos
            demoNombreInput.value = '';
            currentSequence = [];
            updateSequenceList();
            loadDemos(); // Recargar la lista de la derecha

        } catch (error) {
            console.error('Error de red al guardar demo:', error);
            alert('Error de conexión con la API.');
        }
    });

    // --- 3. LÓGICA DE EJECUTAR DEMO ---
    
    async function runDemo(id, nombre) {
        if (!confirm(`¿Estás seguro de que quieres ejecutar la demo "${nombre}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/demos/ejecutar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });

            if (!response.ok) {
                alert('Error al ejecutar la demo.');
                return;
            }
            
            const result = await response.json();
            alert(`Demo "${nombre}" ejecutada. ${result.movimientos} comandos enviados al historial.`);
            
            // Opcional: Redirigir al monitor para ver la ejecución
            window.location.href = 'monitor.html';

        } catch (error) {
            console.error('Error de red al ejecutar demo:', error);
            alert('Error de conexión con la API.');
        }
    }


    // --- INICIALIZACIÓN ---
    loadDemos(); // Carga las demos existentes al abrir la página
    updateSequenceList(); // Prepara la lista de secuencia (vacía)

});
