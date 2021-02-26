"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let bloodList = [];
let halfList = [];
let pureList = [];
let expelled = [];
let systemHacked = false;
let currentlyDisplayed = [];

//Prototype for all students:
const Student = {
  firstname: "",
  middlename: "",
  nickname: "",
  surname: "",
  gender: "",
  house: "",
  prefect: false,
  inquisition: false,
  expelled: false,
  blood: 0,
  grade: "",
  gradenumber: 0,
};

function start() {
  console.log("%c ready", "background: #222; color: #bada55; font-size: 200%");

  loadJBlood();
  loadJSON();

  //add event listeners here
  document.querySelector("#show-pure").addEventListener("click", clickPureButton);
  // document.querySelector("#show-clubs").addEventListener("click", clickClubsButton);
  document.querySelector("#show-inq").addEventListener("click", clickInqButton);
  document.querySelector("#show-prefects").addEventListener("click", clickPrefectsButton);
  document.querySelector("#show-exp").addEventListener("click", clickExpButton);
  document.querySelector("#show-all").addEventListener("click", loadJSON);
  //add dropdowns sorting
  document.querySelector(".dropdown-submit").addEventListener("click", clickHouseFilter);
  document.querySelector(".sorting-submit").addEventListener("click", clickSort);
  //add search event listener
  document.querySelector("#search").addEventListener("click", searchClicked);
  //refresh numbers
  setInterval(refreshNumbers, 1000);
}

async function loadJSON() {
  const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

async function loadJBlood() {
  const response = await fetch("https://petlatkea.dk/2021/hogwarts/families.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  bloodList = jsonData;
  halfList = Object.values(bloodList)[0];
  pureList = Object.values(bloodList)[1];
}

function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareStudent);

  displayList(allStudents);
}

function prepareStudent(jsonObject) {
  const student = Object.create(Student);

  //create variables
  let capitalized;
  let fullName = jsonObject.fullname;
  let firstName = "";
  let middleName = "";
  let nickName = "";
  let surname = "";
  let house = jsonObject.house;
  let gender = jsonObject.gender;
  let grade = Math.floor(Math.random() * 6);

  //clean up space
  if (fullName.charAt(fullName.length - 1) === " ") {
    fullName = fullName.substring(0, fullName.length - 1);
  }

  //first name
  if (fullName.includes(" ") === true) {
    if (fullName.charAt(0) === " ") {
      fullName = fullName.slice(1);
    }
    let firstSpace = fullName.indexOf(" ");
    let lastSpace = fullName.lastIndexOf(" ");

    firstName = fullName.substring(0, firstSpace);
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    //prepare text - names - middlename + NICKNAME
    middleName = fullName.substring(firstSpace, lastSpace);

    if (middleName.charAt(1) == '"') {
      nickName = middleName;
      middleName = "";
      nickName = nickName.replaceAll('"', "");
    } else {
      middleName = middleName.charAt(1).toUpperCase() + middleName.slice(2).toLowerCase();
    }
    //prepare text - names - surname

    surname = fullName.substring(lastSpace);
    if (surname.includes("-") === true) {
      const firstHyphen = surname.indexOf("-");
      surname = surname.charAt(1).toUpperCase() + surname.slice(2, firstHyphen + 1).toLowerCase() + surname.charAt(firstHyphen + 1).toUpperCase() + surname.slice(firstHyphen + 2).toLowerCase();
    } else {
      surname = surname.charAt(1).toUpperCase() + surname.slice(2).toLowerCase();
    }
  } else {
    firstName = fullName;
  }
  //prepare text - house
  if (house.charAt(0) === " ") {
    house = house.slice(1);
  }

  house = house.replace(" ", "");

  house = house.charAt(0).toUpperCase() + house.slice(1).toLowerCase();

  if (gender.charAt(0) === " ") {
    gender = gender.slice(1);
  }
  gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

  //prepare grades

  switch (grade) {
    case 0:
      student.grade = "Troll (T)";
      break;
    case 1:
      student.grade = "Dreadful (D)";
      break;
    case 2:
      student.grade = "Poor (P)";
      break;
    case 3:
      student.grade = "Acceptable (A)";
      break;
    case 4:
      student.grade = "Exceeds Expectations (E)";
      break;
    case 5:
      student.grade = "Outstanding (O)";
  }

  //declare elements of the object
  student.firstname = firstName;
  student.middlename = middleName;
  student.nickname = nickName;
  student.surname = surname;
  student.gender = gender;
  student.house = house;
  student.prefect = false;
  student.inquisition = false;
  student.expelled = false;
  student.gradenumber = grade;

  //blood

  if (pureList.includes(surname)) {
    student.blood = 0;
  } else if (halfList.includes(surname)) {
    student.blood = 1;
  } else {
    student.blood = 2;
  }

  return student;
}

function displayList(students) {
  //store current list in external variable
  currentlyDisplayed = students;

  // clear the list
  document.querySelector(".students").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);

  //show the number of results
  document.querySelector("#current-number").textContent = students.length + " results";
}

function displayStudent(student) {
  //create clone
  const clone = document.querySelector("#template").content.cloneNode(true);

  //data to find an image
  let letter = student.firstname.charAt(0).toLowerCase();
  let lowercase = student.surname.toLowerCase();

  if (lowercase === "patil") {
    letter = student.firstname.toLowerCase();
  } else if (lowercase.includes("-")) {
    const firstHyphen = lowercase.indexOf("-");
    lowercase = lowercase.slice(firstHyphen + 1);
  } else if (student.firstname === "Leanne" || student.firstname === "Agata") {
    lowercase = "noname";
    letter = "x";
  }

  //put expelled filter
  if (student.expelled === true) {
    clone.querySelector("#student-tile").classList.add("grayscale");
  }

  //set clone data
  clone.querySelector("#tile-name").textContent = student.firstname;
  clone.querySelector("#tile-surname").textContent = student.surname;
  clone.querySelector("img").src = "images/" + lowercase + "_" + letter + ".png";

  //fill in icons - gender - house - prefect - pureblood
  switch (student.house) {
    case "Gryffindor":
      clone.querySelector("#house").innerText = String.fromCodePoint(0x1f981);
      break;
    case "Slytherin":
      clone.querySelector("#house").innerText = String.fromCodePoint(0x1f40d);
      break;
    case "Hufflepuff":
      clone.querySelector("#house").innerText = String.fromCodePoint(0x1f9a1);
      break;
    case "Ravenclaw":
      clone.querySelector("#house").innerText = String.fromCodePoint(0x1f985);
  }

  switch (student.gender) {
    case "Girl":
      clone.querySelector("#gender").innerText = String.fromCodePoint(0x2640);
      break;
    case "Boy":
      clone.querySelector("#gender").innerText = String.fromCodePoint(0x2642);
  }

  switch (student.blood) {
    case 0:
      clone.querySelector("#pureblood").innerText = String.fromCodePoint(0x1fa78);
      break;
    case 1:
      clone.querySelector("#pureblood").innerText = "";
      break;
    case 2:
      clone.querySelector("#pureblood").innerText = String.fromCodePoint(0x1f922);
  }

  switch (student.prefect) {
    case true:
      clone.querySelector("#prefect").innerText = String.fromCodePoint(0x2b50);
      break;
    case false:
      clone.querySelector("#prefect").innerText = "";
  }

  //create modal link
  let img = "images/" + lowercase + "_" + letter + ".png";
  showModal(clone, student, img);
  // append clone to list
  const parentElem = document.querySelector(".students");
  parentElem.appendChild(clone);
}

//filter functions

function clickPureButton() {
  console.log("filter Pure-Bloods");
  const onlyPure = allStudents.filter(isPure);
  displayList(onlyPure);
}

function isPure(student) {
  if (student.blood === 0) {
    return true;
  } else {
    return false;
  }
}

function clickInqButton() {
  console.log("filter Inquisitorial Squad");
  const onlyInq = allStudents.filter(isInq);
  displayList(onlyInq);
}

function isInq(student) {
  if (student.inquisition === true) {
    return true;
  } else {
    return false;
  }
}

function clickPrefectsButton() {
  console.log("filter Prefects");
  const onlyPrefects = allStudents.filter(isPrefects);
  displayList(onlyPrefects);
}

function isPrefects(student) {
  if (student.prefect === true) {
    return true;
  } else {
    console.log("prefects");
    return false;
  }
}

function clickExpButton() {
  console.log("filter Expelled");
  displayList(expelled);
}

function clickHouseFilter() {
  console.log("filter House");
  let e = document.querySelector("#dropdown-house");
  let operator = e.options[e.selectedIndex].value;
  let onlyHouse;

  switch (operator) {
    case "0":
      onlyHouse = allStudents.filter(isGryffindor);
      console.log("gryff");
      break;
    case "1":
      onlyHouse = allStudents.filter(isSlytherin);
      break;
    case "2":
      onlyHouse = allStudents.filter(isHufflepuff);
      break;
    case "3":
      onlyHouse = allStudents.filter(isRavenclaw);
      break;
    case "4":
      onlyHouse = allStudents;
  }

  displayList(onlyHouse);
}

function isGryffindor(student) {
  if (student.house === "Gryffindor") {
    return true;
  } else {
    return false;
  }
}

function isRavenclaw(student) {
  if (student.house === "Ravenclaw") {
    return true;
  } else {
    return false;
  }
}

function isSlytherin(student) {
  if (student.house === "Slytherin") {
    return true;
  } else {
    return false;
  }
}

function isHufflepuff(student) {
  if (student.house === "Hufflepuff") {
    return true;
  } else {
    return false;
  }
}

//MODAL

function showModal(clone, student, img) {
  console.log("showModal - add link to modal");
  clone.querySelector("#student-tile").addEventListener("click", openModalWindow);

  function openModalWindow() {
    console.log("openModalWindow");

    let modal = document.querySelector(".modal");
    let window = document.querySelector(".modal-box");
    let close = document.querySelector(".close-box");

    modal.style.display = "block";
    window.style.display = "block";
    close.addEventListener("click", displayNone);

    function displayNone() {
      console.log("hide modal");
      modal.style.display = "none";
      //remove event listeners from buttons
      document.querySelector("#add-prefect").removeEventListener("click", checkPrefect);
      document.querySelector("#add-inq").removeEventListener("click", toggleInq);
      document.querySelector("#expel").removeEventListener("click", toggleExpelled);
      //remove color themes
      document.querySelector(".modal-box").classList.remove("gryffindor");
      document.querySelector(".modal-box").classList.remove("ravenclaw");
      document.querySelector(".modal-box").classList.remove("hufflepuff");
      document.querySelector(".modal-box").classList.remove("slytherin");
      document.querySelector(".modal-box").classList.remove("grayscale");
      //refresh currently displayed list
      displayList(currentlyDisplayed);
    }
    //decorate modal
    switch (student.house) {
      case "Gryffindor":
        document.querySelector(".modal-box").classList.add("gryffindor");
        document.querySelector(".crest").src = "images/gryffindor_crest.png";
        break;
      case "Hufflepuff":
        document.querySelector(".modal-box").classList.add("hufflepuff");
        document.querySelector(".crest").src = "images/hufflepuff_crest.png";
        break;
      case "Ravenclaw":
        document.querySelector(".modal-box").classList.add("ravenclaw");
        document.querySelector(".crest").src = "images/ravenclaw_crest.png";
        break;
      case "Slytherin":
        document.querySelector(".modal-box").classList.add("slytherin");
        document.querySelector(".crest").src = "images/slytherin_crest.png";
    }

    if (student.expelled === true) {
      document.querySelector(".modal-box").classList.add("grayscale");
    }

    //fill the modal
    document.querySelector(".modal-img").src = img;

    document.querySelector(".modal-name").textContent = student.firstname;
    document.querySelector(".modal-nick").textContent = student.nickname;
    document.querySelector(".modal-surname").textContent = student.surname;
    document.querySelector(".modal-house").textContent = student.house;
    document.querySelector(".modal-gender").textContent = student.gender;

    if (student.blood === 0) {
      document.querySelector(".modal-blood").textContent = "Pure-Blood";
    } else if (student.blood === 1) {
      document.querySelector(".modal-blood").textContent = "Half-Blood";
    } else {
      document.querySelector(".modal-blood").textContent = "Mud-Blood";
    }

    if (student.prefect === true) {
      document.querySelector(".modal-role").textContent = "Prefect";
    } else {
      document.querySelector(".modal-role").textContent = "";
    }

    if (student.expelled === true) {
      document.querySelector(".modal-education").textContent = "Expelled";
    } else {
      document.querySelector(".modal-education").textContent = "Grade: " + student.grade;
    }

    if (student.inquisition === true) {
      document.querySelector(".modal-inq").textContent = "Inquisitorial Squad";
    } else {
      document.querySelector(".modal-inq").textContent = "";
    }

    //fill the buttons correctly
    if (student.prefect === false) {
      document.querySelector("#add-prefect").textContent = "Make Prefect";
    } else {
      document.querySelector("#add-prefect").textContent = "Remove Prefect";
    }

    if (student.inquisition === true) {
      document.querySelector("#add-inq").textContent = "Remove from Inquisitorial Squad";
    } else {
      document.querySelector("#add-inq").textContent = "Add to Inquisitorial Squad";
    }

    if (student.expelled === true) {
      document.querySelector("#expel").textContent = "This student is expelled";
    } else {
      document.querySelector("#expel").textContent = "Expel";
    }

    //event listeners
    document.querySelector("#add-prefect").addEventListener("click", checkPrefect);
    document.querySelector("#add-inq").addEventListener("click", toggleInq);
    document.querySelector("#expel").addEventListener("click", toggleExpelled);

    function checkPrefect() {
      console.log("check the number of prefects in the house");
      let allPrefects = allStudents.filter((Student) => Student.prefect === true);
      let ravPrefects = allPrefects.filter((Student) => Student.house === "Ravenclaw").length;
      let gryfPrefects = allPrefects.filter((Student) => Student.house === "Gryffindor").length;
      let slythPrefects = allPrefects.filter((Student) => Student.house === "Slytherin").length;
      let huffPrefects = allPrefects.filter((Student) => Student.house === "Hufflepuff").length;

      if (student.house === "Ravenclaw" && ravPrefects >= 2 && student.prefect === false) {
        alert("You can't do that. There is already 2 Ravenclaw Prefects.");
      } else if (student.house === "Hufflepuff" && huffPrefects >= 2 && student.prefect === false) {
        alert("You can't do that. There is already 2 Hufflepuff Prefects.");
      } else if (student.house === "Gryffindor" && gryfPrefects >= 2 && student.prefect === false) {
        alert("You can't do that. There is already 2 Gryffindor Prefects.");
      } else if (student.house === "Slytherin" && slythPrefects >= 2 && student.prefect === false) {
        alert("You can't do that. There is already 2 Slytherin Prefects.");
      } else {
        togglePrefect();
      }
    }

    function togglePrefect() {
      console.log("toggle prefect");
      if (student.prefect === false) {
        student.prefect = true;
        document.querySelector("#add-prefect").textContent = "Remove Prefect";
        console.log("toggle to true - text remove prefect");
      } else {
        student.prefect = false;
        document.querySelector("#add-prefect").textContent = "Make Prefect";
        console.log("toggle to false - text add prefect");
      }
      console.log("makePrefect" + student.prefect);
    }

    function toggleInq() {
      console.log("toggle inquisitorial squad");
      if (student.inquisition === false && student.blood === 0) {
        student.inquisition = true;
        document.querySelector("#add-inq").textContent = "Remove from Inquisitorial Squad";
      } else if (student.inquisition === true && student.blood === 0) {
        student.inquisition = false;
        document.querySelector("#add-inq").textContent = "Add to Inquisitorial Squad";
      } else {
        alert("You can't do that. Only Pure-Bloods can join.");
      }
      console.log("makeInq" + student.inquisition);
    }

    function toggleExpelled() {
      console.log("expel student");
      if (student.expelled === false) {
        student.expelled = true;
        document.querySelector("#expel").textContent = "This student is expelled";
        student.prefect = false;
        student.inquisition = false;
        expelled.push(student);
        allStudents.splice(allStudents.indexOf(student), 1);
      }
      console.log("makeExpelled" + student.expelled + allStudents.indexOf(student));
    }
  }
}

//changing object values

function refreshNumbers() {
  let gryfStudents = allStudents.filter((Student) => Student.house === "Gryffindor").length;
  let slythStudents = allStudents.filter((Student) => Student.house === "Slytherin").length;
  let huffStudents = allStudents.filter((Student) => Student.house === "Hufflepuff").length;
  let ravStudents = allStudents.filter((Student) => Student.house === "Ravenclaw").length;
  let expStudents = expelled.length;
  let total = allStudents.length;

  document.querySelector("#gryf-number").textContent = "Gryffindor: " + gryfStudents;
  document.querySelector("#slyth-number").textContent = "Slytherin: " + slythStudents;
  document.querySelector("#huff-number").textContent = "Hufflepuff: " + huffStudents;
  document.querySelector("#rav-number").textContent = "Ravenclaw: " + ravStudents;
  document.querySelector("#exp-number").textContent = "Expelled: " + expStudents;
  document.querySelector("#total-number").textContent = "Total: " + total;
}

//sorting functions

function clickSort() {
  console.log("clickSortButton");

  let e = document.querySelector("#dropdown-sorting");
  let operator = e.options[e.selectedIndex].value;
  let sortedStudents;

  switch (operator) {
    case "0":
      sortedStudents = currentlyDisplayed.sort(compareFunctionName);
      break;
    case "1":
      sortedStudents = currentlyDisplayed.sort(compareFunctionSurname);
      break;
    case "2":
      sortedStudents = currentlyDisplayed.sort(compareFunctionGrades);
      break;
    case "4":
      sortedStudents = currentlyDisplayed.sort(compareFunctionHouses);
  }

  displayList(sortedStudents);
}

function compareFunctionName(a, b) {
  console.log("compareFunction");
  if (a.firstname > b.firstname) {
    return 1;
  } else {
    return -1;
  }
}

function compareFunctionSurname(a, b) {
  console.log("compareFunction");
  if (a.surname > b.surname) {
    return 1;
  } else {
    return -1;
  }
}

function compareFunctionHouses(a, b) {
  console.log("compareFunction");
  if (a.house > b.house) {
    return 1;
  } else {
    return -1;
  }
}

function compareFunctionGrades(a, b) {
  console.log("compareFunction");
  if (a.gradenumber < b.gradenumber) {
    return 1;
  } else {
    return -1;
  }
}

//searching

function searchClicked() {
  let found = [];
  let phrase = document.querySelector("#input-search").value;
  phrase = phrase.toLowerCase();

  var i;
  for (i = 0; i < allStudents.length; i++) {
    let array = Object.values(allStudents[i]);
    array = array.join(", ");
    array = array.toLowerCase();

    console.log(array);

    if (array.indexOf(phrase) > -1) {
      found.push(allStudents[i]);
    }
  }
  displayList(found);
  console.log(found);
}

//hacking

function hackTheSystem() {
  console.log("You have hacked the system!");
  if (systemHacked === false) {
    systemHacked = true;
    injectStudent();
    allStudents.forEach(modifyBlood);
    setInterval(refreshInq, 10000);
    document.querySelector(".hacked").classList.remove("displaynone");
  } else {
    console.log("System is already hacked.");
  }
  displayList(allStudents);
}

function injectStudent() {
  const injectMe = {
    firstname: "Agata",
    middlename: "Monika",
    nickname: "Świstak",
    surname: "Lubańska",
    gender: "Girl",
    house: "Hufflepuff",
    prefect: false,
    inquisition: false,
    expelled: false,
    blood: 1,
  };

  allStudents.push(injectMe);
}

function modifyBlood(student) {
  if (student.blood === 0) {
    student.blood = Math.floor(Math.random() * 3);
  } else {
    student.blood = 0;
  }
}

function refreshInq() {
  allStudents.forEach(changeInq);
}

function changeInq(student) {
  if (student.inquisition === true) {
    student.inquisition = false;
    console.log("Current Inquisitorial Squad will be removed in 10 seconds. " + student.firstname);
  }
}
