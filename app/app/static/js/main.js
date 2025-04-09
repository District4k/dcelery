// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add active class to current navigation item
    const currentLocation = window.location.pathname;
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });

    // Example of a simple form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields');
            }
        });
    });
});

// Example of a simple dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

let currentData = null;

async function loadFile(fileId) {
    try {
        const response = await fetch(`/get-file-data/${fileId}/`);
        const data = await response.json();
        currentData = data;
        
        // Show graph container
        document.getElementById('graph-container').style.display = 'block';
        
        // Populate axis selectors
        const columns = data.columns;
        const xSelect = document.getElementById('x-axis');
        const ySelect = document.getElementById('y-axis');
        
        xSelect.innerHTML = '';
        ySelect.innerHTML = '';
        
        columns.forEach(column => {
            xSelect.add(new Option(column, column));
            ySelect.add(new Option(column, column));
        });
        
        // Set default selections
        if (columns.length >= 2) {
            xSelect.value = columns[0];
            ySelect.value = columns[1];
        }
        
        updateGraph();
    } catch (error) {
        console.error('Error loading file:', error);
        alert('Error loading file data');
    }
}

function updateGraph() {
    if (!currentData) return;
    
    const xAxis = document.getElementById('x-axis').value;
    const yAxis = document.getElementById('y-axis').value;
    const graphType = document.getElementById('graph-type').value;
    
    const trace = {
        x: currentData.data[xAxis],
        y: currentData.data[yAxis],
        type: graphType,
        mode: graphType === 'scatter' ? 'markers' : 'lines'
    };
    
    const layout = {
        title: `${yAxis} vs ${xAxis}`,
        xaxis: { title: xAxis },
        yaxis: { title: yAxis }
    };
    
    Plotly.newPlot('graph', [trace], layout);
} 