function switchPage() {

    if (document.getElementById("username").value && document.getElementById("webexlink").value) {
        window.location.href='/game';
    } else {
        alert("Please enter the credentials first");
    }
}