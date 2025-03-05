document.addEventListener("DOMContentLoaded", () => {
    const ordersContainer = document.querySelector("#orders-container");

    // Fetch Orders from Backend
    async function fetchOrders() {
        try {
            const response = await fetch("/api/orders");
            const orders = await response.json();
            renderOrders(orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }

    // Render Orders in Cards
    function renderOrders(orders) {
        ordersContainer.innerHTML = ""; // Clear existing cards

        orders.forEach(order => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <h2>${order.name}</h2>
                <p><strong>Address:</strong> ${order.address}</p>
                <p><strong>Fuel Type:</strong> ${order.fuelType}</p>
                <p><strong>Litres:</strong> ${order.litres}</p>
                <p class="status ${order.status.toLowerCase()}"><strong>Status:</strong> ${order.status}</p>
                <div>
                    ${
                        order.status === "Pending"
                            ? <button onclick="markAsDelivered('${order._id}')">Mark as Delivered</button>
                            : <button class="delivered" disabled>Delivered</button>
                    }
                </div>
            `;

            ordersContainer.appendChild(card);
        });
    }

    // Mark Order as Delivered
    window.markAsDelivered = async (orderId) => {
        try {
            const response = await fetch('/api/orders/${orderId}/deliver', {
                method: "PUT"
            });
            const result = await response.json();
            alert(result.message);
            fetchOrders(); // Refresh the cards
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    // Initial Fetch
    fetchOrders();
});