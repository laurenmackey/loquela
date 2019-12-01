//Check box if user wants to see there password
function showPassword() {
  var pass = document.getElementById("pass");
  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
}

//Checks password, username, and email inputs
function checkPassword(form) {
  var passone = form.passone.value;
  var passtwo = form.passtwo.value;
  var username = form.username.value;
  var email = form.email.value;

  if (username === '') {
    alert("Please enter a Username");
    return false;
  }

  if(email === '') {
    alert("Please enter an Email");
    return false;
  }

  if(passone === '') {
    alert("Please enter Password");
    return false;
  } else if(passtwo === '') {
    alert("Please Verify Password");
    return false;
  } else if(passone != passtwo) {
    alert("Passwords did not match...");
    return false;
  } else {
    return true;
  }
}
