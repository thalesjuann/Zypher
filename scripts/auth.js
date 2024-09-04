document.addEventListener("DOMContentLoaded", function () {
    const themeToggleButton = document.querySelector(".btn-theme-toggle");
    const body = document.body;
    const authContainer = document.querySelector(".auth-container");

    themeToggleButton.addEventListener("click", function () {
        body.classList.toggle("dark-theme");
        authContainer.classList.toggle("dark-theme");
        const isDarkTheme = body.classList.contains("dark-theme");
        themeToggleButton.innerHTML = isDarkTheme
            ? '<i class="fa-solid fa-moon"></i>'
            : '<i class="fa-solid fa-sun"></i>';
    });

    document
        .getElementById("goToRegister")
        .addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelector(".login-form-container").style.transform =
                "translateX(-100%)";
            document.querySelector(".register-form-container").style.transform =
                "translateX(0)";
        });

    document
        .getElementById("goToLogin")
        .addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelector(".login-form-container").style.transform =
                "translateX(0)";
            document.querySelector(".register-form-container").style.transform =
                "translateX(100%)";
        });
});
