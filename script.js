
// ===================================
// UNICURRENCY - BASIC SYSTEM
// ===================================

// INITIAL WALLET BALANCE
let balance = Number(localStorage.getItem("balance")) || 1000;

let transactions = JSON.parse(
    localStorage.getItem("transactions") || "[]"
);

let convertedValue = 0;

// SAMPLE EXCHANGE RATES
// These are fictional demonstration rates.
const rates = {
    USD: 58,
    EUR: 63,
    JPY: 0.39,
    PHP: 1
};

// ===================================
// NAVIGATION
// ===================================

function showPage(page, button) {

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    document.getElementById(page).classList.add("active");

    document.querySelectorAll(".menu").forEach(b => {
        b.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {
        document.querySelectorAll(".menu").forEach(b => {
            if (b.getAttribute("onclick").includes("'" + page + "'")) {
                b.classList.add("active");
            }
        });
    }

    const titles = {
        dashboard: "Dashboard",
        exchange: "Exchange Money",
        cashin: "Cash In",
        send: "Send Money",
        history: "Transactions",
        profile: "My Profile"
    };

    document.getElementById("pageTitle").textContent = titles[page];

    if (page === "history") {
        displayHistory();
    }

    window.scrollTo(0, 0);
}

// ===================================
// WALLET BALANCE
// ===================================

function updateBalance() {

    document.getElementById("balance").textContent =
        "₱" + balance.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    localStorage.setItem("balance", balance);

    displayRecent();
}

function formatMoney(amount) {
    return "₱" + amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ===================================
// TRANSACTION RECORD
// ===================================

function addTransaction(type, amount, details) {

    transactions.unshift({
        type: type,
        amount: amount,
        details: details,
        date: new Date().toLocaleString()
    });

    transactions = transactions.slice(0, 50);

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    updateBalance();
    alert("Transaction successful!");
}

// ===================================
// CURRENCY EXCHANGE
// ===================================

function calculateExchange() {

    const amount = Number(
        document.getElementById("exchangeAmount").value
    );

    const from = document.getElementById("fromCurrency").value;
    const to = document.getElementById("toCurrency").value;

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Enter a valid amount.");
        return;
    }

    // Convert source currency into PHP,
    // then convert PHP into the target currency.
    convertedValue = amount * rates[from] / rates[to];

    const symbol = {
        USD: "$",
        EUR: "€",
        JPY: "¥",
        PHP: "₱"
    };

    document.getElementById("convertedAmount").textContent =
        symbol[to] + convertedValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    document.getElementById("rateText").textContent =
        `1 ${from} = ${(rates[from] / rates[to]).toFixed(4)} ${to}`;
}

// ===================================
// ADD EXCHANGE TO WALLET
// ===================================

function addExchange() {

    const from = document.getElementById("fromCurrency").value;
    const to = document.getElementById("toCurrency").value;

    if (to !== "PHP") {
        alert("Please select PHP as your receiving currency.");
        return;
    }

    calculateExchange();

    if (!Number.isFinite(convertedValue) || convertedValue <= 0) {
        return;
    }

    if (!confirm("Add the converted PHP amount to your wallet?")) {
        return;
    }

    balance += convertedValue;

    addTransaction(
        "Currency Exchange",
        convertedValue,
        `${from} to PHP`
    );
}

// ===================================
// CASH IN
// ===================================

function cashIn() {

    const amount = Number(
        document.getElementById("cashAmount").value
    );

    const method = document.getElementById("cashMethod").value;

    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
        alert("Enter an amount between ₱0.01 and ₱100,000.");
        return;
    }

    balance += amount;

    document.getElementById("cashAmount").value = "";

    addTransaction("Cash In", amount, method);
}

// ===================================
// SEND MONEY
// ===================================

function sendMoney() {

    const recipient = document.getElementById("recipient").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const amount = Number(
        document.getElementById("sendAmount").value
    );

    if (!recipient || !/^09\d{9}$/.test(mobile)) {
        alert("Enter a recipient name and valid demo mobile number.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Enter a valid amount.");
        return;
    }

    if (amount > balance) {
        alert("Insufficient wallet balance!");
        return;
    }

    if (!confirm(`Send ${formatMoney(amount)} to ${recipient}?`)) {
        return;
    }

    balance -= amount;

    addTransaction(
        "Send Money",
        amount,
        "To " + recipient
    );

    document.getElementById("recipient").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("sendAmount").value = "";
}

// ===================================
// TRANSACTION HISTORY
// ===================================

function displayRecent() {

    const container = document.getElementById("recentHistory");

    container.innerHTML = "";

    if (transactions.length === 0) {
        container.innerHTML =
            '<p class="empty">No transactions yet.</p>';
        return;
    }

    transactions.slice(0, 5).forEach(t => {

        const div = document.createElement("div");
        div.className = "history-item";

        const info = document.createElement("div");
        const title = document.createElement("strong");
        const details = document.createElement("small");

        title.textContent = t.type;
        details.textContent = t.details + " • " + t.date;

        info.append(title, details);

        const amount = document.createElement("strong");
        amount.className =
            t.type === "Cash In" || t.type === "Currency Exchange"
                ? "income" : "expense";

        amount.textContent =
            (amount.className === "income" ? "+" : "-") +
            formatMoney(t.amount);

        div.append(info, amount);
        container.appendChild(div);
    });
}

function displayHistory() {

    const container = document.getElementById("allHistory");

    container.innerHTML = "";

    if (transactions.length === 0) {
        container.innerHTML =
            '<p class="empty">No transactions yet.</p>';
        return;
    }

    transactions.forEach(t => {

        const div = document.createElement("div");
        div.className = "history-item";

        const info = document.createElement("div");
        const title = document.createElement("strong");
        const details = document.createElement("small");

        title.textContent = t.type;
        details.textContent = t.details + " • " + t.date;

        info.append(title, details);

        const amount = document.createElement("strong");
        amount.className =
            t.type === "Cash In" || t.type === "Currency Exchange"
                ? "income" : "expense";

        amount.textContent =
            (amount.className === "income" ? "+" : "-") +
            formatMoney(t.amount);

        div.append(info, amount);
        container.appendChild(div);
    });
}

// ===================================
// SAVE PROFILE
// ===================================

function saveProfile() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const country = document.getElementById("country").value.trim();

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    const profile = { name, email, phone, country };

    localStorage.setItem("profile", JSON.stringify(profile));

    document.querySelector(".profile strong").textContent = name;

    alert("Profile saved successfully!");
}

// ===================================
// LOAD PROFILE
// ===================================

function loadProfile() {

    const profile = JSON.parse(
        localStorage.getItem("profile") || "null"
    );

    if (!profile) return;

    document.getElementById("name").value = profile.name || "";
    document.getElementById("email").value = profile.email || "";
    document.getElementById("phone").value = profile.phone || "";
    document.getElementById("country").value = profile.country || "";
}

// ===================================
// START SYSTEM
// ===================================

loadProfile();
updateBalance();
