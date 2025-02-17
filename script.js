console.log("Script loaded");

// Initialize the basket and total
let basket = [];
let total = 0;

// Function to add item to basket
function addToBasket(name, price) {
    console.log(`Adding to basket: ${name} - ${price} CHF`);
    let item = basket.find(i => i.name === name);
    if (item) {
        item.quantity++;
    } else {
        basket.push({ name: name, price: price, quantity: 1 });
    }
    console.log("Basket after adding item:", basket);
    updateBasket();
}

// Function to remove item from basket
function removeFromBasket(name) {
    console.log(`Removing from basket: ${name}`);
    let itemIndex = basket.findIndex(i => i.name === name);
    if (itemIndex !== -1) {
        basket[itemIndex].quantity--;
        if (basket[itemIndex].quantity === 0) {
            basket.splice(itemIndex, 1);
        }
    }
    console.log("Basket after removing item:", basket);
    updateBasket();
}

// Function to update the basket display
function updateBasket() {
    console.log("Updating basket");
    let basketElement = document.getElementById('basket-items');
    basketElement.innerHTML = '';
    total = 0;
    basket.forEach(item => {
        let li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} CHF</span>
            <button class="remove-item" data-name="${item.name}">X</button>
        `;
        basketElement.appendChild(li);
        total += item.price * item.quantity;
    });
    document.getElementById('total').textContent = total.toFixed(2);
    document.getElementById('total-to-pay').textContent = total.toFixed(2);
    updateChangeAmount();
}

// Function to update change amount
function updateChangeAmount() {
    let paymentAmount = parseFloat(document.getElementById('custom-amount').value) || 0;
    let changeAmount = paymentAmount - total;
    document.getElementById('change-amount').textContent = changeAmount >= 0 ? changeAmount.toFixed(2) : '0.00';
}

// Function to handle payment
function handlePayment() {
    let amount = parseFloat(document.getElementById('custom-amount').value);
    if (isNaN(amount)) {
        alert('Veuillez entrer un montant valide');
        return;
    }
    console.log(`Handling payment: ${amount} CHF`);
    if (amount >= total) {
        let change = amount - total;
        console.log(`Change to be returned: ${change} CHF`);
        document.getElementById('change-amount').textContent = change.toFixed(2);
        // Log the transaction
        let transaction = {
            items: basket.map(item => `${item.name} x${item.quantity}`).join(', '),
            total: total.toFixed(2),
            date: new Date().toISOString()
        };
        logTransactionToIFTTT(transaction);
        // Reset the basket
        basket = [];
        updateBasket();
        // Reset the custom amount input
        document.getElementById('custom-amount').value = '';
        alert(`Payment successful. Change: ${change.toFixed(2)} CHF`);
    } else {
        alert('Montant insuffisant!');
    }
}

// Function to log transaction to IFTTT using JSONP
function logTransactionToIFTTT(transaction) {
    const event = 'POS';

// Put the key from IFFTTT https://maker.ifttt.com/trigger/POS/json/with/key/
   // const key = ''; // Replace with your IFTTT Webhook key
   
    const payload = {
        value1: transaction.items,
        value2: `Total: ${transaction.total} CHF`, // Only send total
        value3: transaction.date
    };

   const jsonpUrl = `https://maker.ifttt.com/trigger/${event}/with/key/${key}?value1=${encodeURIComponent(payload.value1)}&value2=${encodeURIComponent(payload.value2)}&value3=${encodeURIComponent(payload.value3)}&callback=iftttCallback`;
  
    const script = document.createElement('script');
    script.src = jsonpUrl;
    document.body.appendChild(script);
}

// Callback function for IFTTT JSONP
function iftttCallback(data) {
    console.log('IFTTT Response:', data);
    console.log('Transaction logged to IFTTT successfully');
}

// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded and parsed");

    // Add event listeners to menu items
    document.querySelectorAll('.menu-item').forEach(button => {
        button.addEventListener('click', function() {
            let name = this.getAttribute('data-name');
            let price = parseFloat(this.getAttribute('data-price'));
            addToBasket(name, price);
        });
    });

    // Add event listeners to payment buttons
    document.querySelectorAll('.pay-button').forEach(button => {
        button.addEventListener('click', function() {
            let amount = parseFloat(this.getAttribute('data-amount'));
            document.getElementById('custom-amount').value = amount;
            updateChangeAmount();
        });
    });

    // Add event listener to custom amount input
    document.getElementById('custom-amount').addEventListener('input', updateChangeAmount);

    // Add event listener to custom payment button
    document.getElementById('pay-custom').addEventListener('click', handlePayment);

    // Add event listener for remove buttons (using event delegation)
    document.getElementById('basket-items').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            let name = e.target.getAttribute('data-name');
            removeFromBasket(name);
        }
    });
});

console.log("Script execution completed");
