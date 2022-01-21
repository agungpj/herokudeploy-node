const emailReciver = "agungprasetya1121@gmail.com";

function submitButton() {
  let firstName = document.getElementById("namadepan").value;
  let lastName = document.getElementById("namabelakang").value;
  let faq = document.getElementById("faq").value;
  let email = document.getElementById("email").value;
  let subject = document.getElementById("subject").value;

  let cookie = document.getElementById("cookie").checked;
  let agree = document.getElementById("agree").checked;

  // condition

  if (cookie) {
    cookie = document.getElementById("cookie").value;
  } else {
    cookie = "";
  }

  if (agree) {
    agree = document.getElementById("agree").value;
  } else {
    agree = "";
  }

  console.log(firstName + " " + lastName);
  console.log(faq);
  console.log(email);
  console.log(subject);
  console.log(cookie);
  console.log(agree);

  // validasi

  if (firstName == "") {
    return alert("Please complete your field.");
  } else if (lastName == "") {
    return alert("Please complete your field.");
  } else if (faq == "") {
    return alert("Please complete your field.");
  } else if (email == "") {
    return alert("Please complete your field.");
  } else if (subject == "") {
    return alert("Please complete your field.");
  }

  const a = document.createElement("a");
  a.href = `mailto:${emailReciver}?subject=${faq}&body=Hello my name is ${
    firstName + " " + lastName
  }, ${subject}`;
  a.click();

  let data = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    jawaban: faq,
    subject: subject,
    agree: agree,
    cookie: cookie,
  };

  console.log(data);
}
