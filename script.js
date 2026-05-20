let balance = 0;
let goal = 0;

let categoryData = {
    Food: 0,
    Transportation: 0,
    School: 0,
    Entertainment: 0,
    Savings: 0, 
    Others: 0
};

let pieChart;

window.onload = function() {
    // Interface ready
};

function toggleAuthMode(isSignUp) {
    const loginSection = document.getElementById("loginFormSection");
    const signupSection = document.getElementById("signupFormSection");
    
    document.getElementById("loginError").style.display = "none";
    document.getElementById("signupError").style.display = "none";

    if (isSignUp) {
        loginSection.style.display = "none";
        signupSection.style.display = "block";
    } else {
        loginSection.style.display = "block";
        signupSection.style.display = "none";
    }
}

function handleSignUp() {
    const usernameInp = document.getElementById("signupUsername").value.trim();
    const passwordInp = document.getElementById("signupPassword").value;
    const errorMsg = document.getElementById("signupError");

    if (!usernameInp || !passwordInp) {
        errorMsg.innerText = "Please complete all fields.";
        errorMsg.style.display = "block";
        return;
    }

    if (localStorage.getItem(usernameInp)) {
        errorMsg.innerText = "Username is already taken.";
        errorMsg.style.display = "block";
        return;
    }

    localStorage.setItem(usernameInp, passwordInp);
    
    toggleAuthMode(false);
    document.getElementById("loginUsername").value = usernameInp;
    document.getElementById("signupUsername").value = "";
    document.getElementById("signupPassword").value = "";
}

function handleLogin() {
    const userInp = document.getElementById("loginUsername").value.trim();
    const passInp = document.getElementById("loginPassword").value;
    const errorMsg = document.getElementById("loginError");

    const registeredPassword = localStorage.getItem(userInp);

    if (registeredPassword && registeredPassword === passInp) {
        document.getElementById("authModal").style.display = "none";
        document.getElementById("mainApp").style.display = "block";
        initChart();
    } else {
        errorMsg.style.display = "block";
        document.getElementById("loginPassword").value = "";
    }
}

function initChart() {
    const canvas = document.getElementById("pieChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    pieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                label: 'Expenses by Category',
                data: Object.values(categoryData),
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

function updateChart() {
    if (pieChart) {
        pieChart.data.datasets[0].data = Object.values(categoryData);
        pieChart.update();
    }
}

function setGoal() {
    goal = parseFloat(document.getElementById("goalAmount").value);
    if (isNaN(goal) || goal <= 0) {
        return;
    }
    document.getElementById("goalText").innerText = "Goal: ₱" + goal.toFixed(2);
    updateProgress();
}

function updateProgress() {
    const progressBar = document.getElementById("progress");
    if (!goal || goal <= 0) {
        progressBar.style.width = "0%";
        return;
    }

    let percent = (categoryData.Savings / goal) * 100;
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;

    progressBar.style.width = percent + "%";
    progressBar.style.background = (percent === 100) ? "#28a745" : "#4caf50";
}

function addTransaction(type) {
    const amountInput = document.getElementById("amount");
    const descriptionInput = document.getElementById("description");
    const categoryInput = document.getElementById("category");

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;
    const category = categoryInput.value;

    if (isNaN(amount) || amount <= 0) {
        return;
    }

    if (type === "Allowance") {
        balance += amount;
        if (category == "Savings") {
            categoryData.Savings += amount;
            updateChart();
        }
    } else {
        balance -= amount;
        if (categoryData.hasOwnProperty(category)) {
            if (category === "Savings") {
                categoryData.Savings -= amount;
                if (categoryData.Savings < 0) categoryData.Savings = 0;
            } else {
                categoryData[category] += amount;
            }
        }
        updateChart();
    }

    document.getElementById("balance").innerText = "Balance: ₱" + balance.toFixed(2);

    const row = `
        <tr>
            <td>${type}</td>
            <td>₱${amount.toFixed(2)}</td>
            <td>${category}</td>
            <td>${description}</td>
        </tr>
    `;
    document.getElementById("tableBody").innerHTML += row;

    amountInput.value = "";
    descriptionInput.value = "";
    updateProgress();
}