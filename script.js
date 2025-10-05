// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    } else {
        console.error('Mobile menu elements not found!');
    }

    // Grab all grocery item cards
    const groceryItems = Array.from(
        document.querySelectorAll('[data-name][data-price]')
    );
    console.log('Found grocery items:', groceryItems.length); // Debug: Should log 10

    if (groceryItems.length === 0) {
        console.error('No grocery items found! Check data attributes in HTML.');
        return;
    }

    // Elements for calculator table body and grand total
    const calcTableBody = document.getElementById('calc-table-body');
    const grandTotalEl = document.getElementById('grand-total');
    const canvas = document.getElementById('priceChart');

    if (!calcTableBody || !grandTotalEl || !canvas) {
        console.error('Calculator or graph elements not found!');
        return;
    }

    // Chart.js setup (check if Chart is available)
    let priceChart = null;
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded! Check CDN or add local file.');
        // Fallback: Alert or hide graph section
        document.getElementById('graph').innerHTML = '<p class="text-red-500 text-center">Chart.js failed to load. Please check your internet connection.</p>';
        return;
    }
    const ctx = canvas.getContext('2d');

    // Function to format currency in Indian Rupees
    function formatINR(amount) {
        return '₹' + parseFloat(amount).toFixed(2);
    }

    // Function to update calculator and graph
    function updateCalculations() {
        let grandTotal = 0;
        const rows = [];
        const labels = [];
        const data = [];

        groceryItems.forEach((item) => {
            const name = item.getAttribute('data-name');
            const price = parseFloat(item.getAttribute('data-price'));
            const input = item.querySelector('.quantity-input');
            let quantity = parseFloat(input ? input.value : 0);

            if (isNaN(quantity) || quantity < 0) {
                quantity = 0;
                if (input) input.value = 0;
            }

            // Calculate total price for this item (same logic as original)
            let totalPrice = price * quantity; // Simplified: All items use price * quantity (per unit/kg/L/packet)

            if (quantity > 0) {
                rows.push(
                    `<tr>
                        <td class="py-2 px-4 border border-green-200">${name}</td>
                        <td class="py-2 px-4 border border-green-200 text-right">${formatINR(price)}</td>
                        <td class="py-2 px-4 border border-green-200 text-center">${quantity}</td>
                        <td class="py-2 px-4 border border-green-200 text-right">${formatINR(totalPrice)}</td>
                    </tr>`
                );
                labels.push(name);
                data.push(totalPrice);
                grandTotal += totalPrice;
            }
        });

        calcTableBody.innerHTML = rows.join('');
        grandTotalEl.textContent = formatINR(grandTotal);

        // Update Chart (only if data exists)
        if (priceChart) {
            priceChart.destroy();
        }
        if (data.length > 0) {
            priceChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Price Distribution',
                            data: data,
                            backgroundColor: [
                                '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0',
                                '#15803d', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'
                            ],
                            borderColor: '#ffffff',
                            borderWidth: 2,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#166534',
                                font: {
                                    weight: 'bold',
                                },
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const total = data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                    return `${context.label}: ${formatINR(context.parsed)} (${percentage}%)`;
                                },
                            },
                        },
                    },
                },
            });
        } else {
            // Empty chart if no data
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = '#6b7280';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Enter quantities to see the graph', ctx.canvas.width / 2, ctx.canvas.height / 2);
        }
    }

    // Attach event listeners to all quantity inputs
    groceryItems.forEach((item) => {
        const input = item.querySelector('.quantity-input');
        if (input) {
            input.addEventListener('input', () => {
                if (input.value < 0) input.value = 0;
                updateCalculations();
            });
        }
    });

    // Initial calculation on page load
    updateCalculations();
    console.log('Script loaded successfully!'); // Debug
});