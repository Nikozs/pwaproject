import SodexoData from "./modules/sodexo-data";
import FazerData from "./modules/fazer-data";
import mapApi from "./modules/hsl-map";
import HSLData from "./modules/hsl-data";
import Announcements from "./assets/data/announcements.json";
import Localization from "./assets/data/localization.json";

const today = new Date().toISOString().split("T")[0];
const todayLocal = new Date().toLocaleDateString("fi-Fi"); // Get current date in finnish format

/**
 * Default userSettings
 */
let userSettings = {
  theme: "light",
  currentLang: "fi",
};


const campuses = [
  {
    campus: "myyrmaki",
    campusDisplayName: "Myyrmäen kampus",
    campusDisplayNameEn: "Myyrmäki Campus",
    campusCoordsLat: 60.2584767,
    campusCoordsLong: 24.8441723,
    restaurants: [
      {
        displayName: "Myyrmäen Sodexo",
        name: "sodexo-myyrmaki",
        id: 152,
        type: SodexoData,
        campus: "myyrmaki",
        parsedMenu: [],
      },
    ],
  },
  {
    campus: "karamalmi",
    campusDisplayName: "Karamalmin kampus",
    campusDisplayNameEn: "Karamalmi Campus",
    campusCoordsLat: 60.2238761,
    campusCoordsLong: 24.7580606,
    restaurants: [
      {
        displayName: "Fazer Karakaarenkuja",
        name: "fazer-kp",
        id: 270540,
        type: FazerData,
        campus: "karamalmi",
        parsedMenu: [],
      },
    ],
  },
  // {
  //   campus: "arabia",
  //   campusDisplayName: "Arabian kampus",
  //   campusDisplayNameEn: "Arabia Campus",
  //   campusCoordsLat: 60.2098936,
  //   campusCoordsLong: 24.9766740,
  //   restaurants: [{
  //     displayName: "Hämeentie Sodexo",
  //     name: "sodexo-hameentie",
  //     id: 0,
  //     type: SodexoData,
  //      campus: "arabia",
  //     parsedMenu: [],
  // }]
  // },
  {
    campus: "myllypuro",
    campusDisplayName: "Myllypuron kampus",
    campusDisplayNameEn: "Myllypuro Campus",
    campusCoordsLat: 60.22353,
    campusCoordsLong: 25.07843,
    restaurants: [
      {
        displayName: "Myllypuro Sodexo",
        name: "sodexo-myllypuro",
        id: 158,
        type: SodexoData,
        campus: "myllypuro",
        parsedMenu: [],
      },
    ],
  },
];


/**
 * @param {String} text
 * @returns text in currently selected language
 */
const getLocalText = (text) => {
  let textitem = Localization.data.find(
    (x) => x.lang == userSettings.currentLang && x.text == text
  );
  return textitem.localtext;
};



let defval = localStorage.getItem("userConfig");
/**
 * Checks if userConfig exist
 */
const checkIfuserConfigExists = () => {
  if (!defval) {
    localStorage.setItem("userConfig", JSON.stringify(userSettings)); // if not then create it
  } else {
    userSettings = JSON.parse(localStorage.getItem("userConfig")); // if it already exists then use existing one
  }
};

/**
 * Call to update changed settings to localStorage
 */
const updateSettings = () => {
  localStorage.setItem("userConfig", JSON.stringify(userSettings));
};

/**
 * Switches theme between light/dark
 * and updates preference to localStorage
 */
const toggleTheme = () => {
  if (JSON.parse(localStorage.getItem("userConfig")).theme == "light") {
    userSettings.theme = "dark";
    document.body.classList = "dark-theme";
    updateSettings();
  } else {
    userSettings.theme = "light";
    document.body.classList = "";
    updateSettings();
  }
};

/**
 * Switches application language between en/fi and saves it to localStorage
 * then updates menu data and ui
 */
const switchLanguage = async () => {
  if (JSON.parse(localStorage.getItem("userConfig")).currentLang === "fi") {
    userSettings.currentLang = "en";
    updateSettings();
  } else {
    userSettings.currentLang = "fi";
    updateSettings();
  }
  await loadAllMenuData();
  localizeUI();

  if(valittu != "") {
    showSelected(valittu);
  } else {
   document.querySelector("#etusivu").click();
  }
};

/**
 * @param {Object} menuData
 * @returns menu items
 */
const renderMenu = (menuData) => {
  let menuitems = "";
  for (const item of menuData) {
    menuitems +=
      "<li><p id='menutitle'>" +
      isnull(item.title, "") +
      "</p><p id='menudiets'>" +
      isnull(item.diets, "") +
      "</p><p id='menuprice'>" +
      isnull(item.price, "") +
      "</p></li>";
  }
  return menuitems;
};



const removeElementsIfExists = () => {
  const restaurantsGrid = document.querySelector(".restaurant-container > .grid-container");
  const tiedote = document.querySelector(".tiedote-grid-container");
  if (document.body.contains(restaurantsGrid)) {
    restaurantsGrid.remove();
  }
  if (document.body.contains(tiedote)) {
    tiedote.remove();
  }
};

let valittu = "";
/**
 * @param {String} ev selected campus
 */
const showSelected = async (ev) => {
  removeElementsIfExists();
  valittu = ev;
  // Hide campus frontpage list
  const gridContainer = document.querySelector(".grid-container");
  gridContainer.style.display = "none";
  // Make campus information container visible
  const restaurantsContainer = document.querySelector(".restaurant-container");
  restaurantsContainer.style.display = "grid";

  let camp = campuses.find((x) => x.campus == ev);
  camp.restaurants.forEach(async (restaurant) => {
    if (restaurant.parsedMenu.length == 0) {
      await loadAllMenuData();
      // Just to make sure parsed menu is loaded if user selects campus faster than fetch finishes
    }


    let restaurantContainer = document.createElement("div");
    restaurantContainer.className = "grid-container";
    const campusheader = document.querySelector("#campusHeader > h1");

    let hederi = "";
    if (userSettings.currentLang == "en") {
      hederi = camp.campusDisplayNameEn;
    } else {
      hederi = camp.campusDisplayName;
    }

    campusheader.innerHTML = hederi;

    restaurantContainer.innerHTML =
      `<div class="grid-item" id="restaurantData">
          <h5 class="boxtitle">` +
      getLocalText("Ruokailu") +
      `:</h5>
          <div class="boxInnerWrapper">
          <h4>` +
      todayLocal +
      `</h4>
          <h3>` +
      restaurant.displayName +
      `</h3>
          <section>
            <div class="container">
              <h5 class="div1">Menu</h5>  <h5 class="div2">${getLocalText("Hinta")}</h5>
            </div>
              <ul id="restaurantMenu">` +
      renderMenu(restaurant.parsedMenu, restaurant) +
      ` </ul>
          </section>
        </div>
        </div>

        <div class="grid-item" id="hslData">
        <h5 class="boxtitle">HSL:</h5>
          <section>
             <div id="map" style="height:280px; width: 100%;"/></div>
             <h4 id="stopsTitle">${getLocalText("Lähimmät pysäkit")}:</h4>
             <ul id="hslList" class="hslList"></ul>
          </section>
        </div>`;
    restaurantsContainer.appendChild(restaurantContainer);

    mapApi.renderMap(camp.campusCoordsLat, camp.campusCoordsLong);

    let hslList = document.querySelector(".hslList");

    hsldataa
      .filter((campusstop) => campusstop.campus === camp.campus)
      .forEach((stop) => {
        hslList.innerHTML +=
          "<li><p>" +
          stop.stoppi.place.name +
          " " +
          stop.stoppi.place.code +
          "</p><p>" + getLocalText("Etäisyys") +
          stop.stoppi.distance +
          "m</p></li>";
      });
  });


  // Creates element for announcements
  let wrapper = document.querySelector(".wrapper");
  let tiedoteContainer = document.createElement("div");
  tiedoteContainer.className = "tiedote-grid-container";
  tiedoteContainer.innerHTML = `<div class="tiedote-grid-item"><h5 class="boxtitle">${getLocalText(
    "Tiedote"
  )}:</h5><section id="textslide"><p id="tiedote">placeholder</p></section></div>`;
  wrapper.appendChild(tiedoteContainer);
    wrapper.style.display = "flex";

  clearTimeout(timeoutid);
  announcementLoop();
};

let counter = 0;
let timeoutid  =  0;
/**
 * Loops through announcements
 * @param lang language to show
 */
const announcementLoop = (lang) => {
  let count = Announcements.announcements.announcementMessages.length;
  if (counter > count - 1) counter = 0;
  let announcement = Announcements.announcements.announcementMessages[counter];
  let announcehtml = "";

  if (userSettings.currentLang == "fi") {
    announcehtml =
      "<p id='announcementTitle'>" +
      announcement.titleFi +
      "</p><p id='announcementText'>" +
      announcement.textFi +
      "</p>";
  }

  if (userSettings.currentLang == "en") {
    announcehtml =
      "<p id='announcementTitle'>" +
      announcement.titleEn +
      "</p><p id='announcementText'>" +
      announcement.textEn +
      "</p>";
  }

  let textSlide = document.getElementById("textslide");

  if (typeof textSlide != "undefined" && textSlide != null) {
    try {
      document.getElementById(
        "textslide"
      ).firstElementChild.innerHTML = announcehtml;

      counter++;
      timeoutid=setTimeout(announcementLoop, 3000);
    } catch (e) {
      console.log("announcement error: ", e);
    }
  }
};

/**
 * Load data for all restaurant boxes
 * @async
 */
const loadAllMenuData = async () => {
  for (const camp of campuses) {
    for (const restaurant of camp.restaurants) {
      try {
        const parsedMenu = await restaurant.type.getDailyMenu(
          restaurant.id,
          userSettings.currentLang,
          today
        );
        restaurant.parsedMenu = parsedMenu;
      } catch (error) {
        console.error(error);
      }
    }
  }
};

let hsldataa = [];
/**
 * Loads nearby stops from given longitude and latitude
 * @param {string} campus
 * @param {number} latitude
 * @param {number} longitude
 */
const loadHSLData = async (campus, latitude, longitude) => {
  try {
    const result = await HSLData.getNearbyStops(latitude, longitude);

    result.data.nearest.edges.forEach((stoppi) =>
      hsldataa.push({ campus: campus, stoppi: stoppi.node })
    );
  } catch (e) {
    console.log(e);
  }
};

/**
 * Renders page in selected locale
 */
const localizeUI = () => {
  let etusivutxt = document.querySelector("#etusivu");
  etusivutxt.innerHTML = getLocalText("Etusivu");
  let switchLanguagetxt = document.querySelector("#language");
  switchLanguagetxt.innerHTML = getLocalText("switchLanguage");
  let toggleTheme = document.querySelector("#theme");
  toggleTheme.innerHTML = getLocalText("toggleTheme");
  let Kampukset = document.querySelector("#campusText");
  Kampukset.innerHTML = getLocalText("Kampukset:");
  let campusName = document.querySelector("#campusName-1");
  campusName.innerHTML = getLocalText("Karamalmin kampus");
  let campusName2 = document.querySelector("#campusName-2");
  campusName2.innerHTML = getLocalText("Myllypuron kampus");
  let campusName3 = document.querySelector("#campusName-3");
  campusName3.innerHTML = getLocalText("Myyrmäen kampus");
};

/**
 * Check selected theme from localStorage and apply it
 */
const getThemeFromStorage = () => {
  if (JSON.parse(localStorage.getItem("userConfig")).theme == "dark") {
    document.body.classList = "dark-theme";
  } else {
    document.body.classList = "";
  }
};

const init = async () => {
  checkIfuserConfigExists();
  getThemeFromStorage();
  localizeUI();
  await loadAllMenuData();

  /**
   * Listener for responsive navbar
   */
  let mainNav = document.getElementById("js-menu");
  let navBarToggle = document.getElementById("js-navbar-toggle");
  navBarToggle.addEventListener("click", function () {
    mainNav.classList.toggle("active");
  });

  /**
   * Apply listener for navbar items
   */
  document.querySelector("#etusivu").addEventListener("click", (e) => {

    e.preventDefault();
    valittu = "";
    const gridContainer = document.querySelector(".grid-container");
    const wrapperi = document.querySelector(".wrapper");
    const campusHeader = document.querySelector("#campusHeader > h1");
    campusHeader.innerHTML = getLocalText("Kampukset:");

    /**
     * Stuff to show, hide or remove when clicked
     */
    removeElementsIfExists();
     wrapperi.style.display = "none";
     gridContainer.style.display = "grid";
  });

  document.querySelector("#toggleTheme").addEventListener("click", (e) => {
    e.preventDefault();
    toggleTheme();
  });

  document.querySelector("#switchLanguage").addEventListener("click", (e) => {
    e.preventDefault();
    switchLanguage();
  });

  campuses.forEach(async (camp) => {
    await loadHSLData(camp.campus, camp.campusCoordsLat, camp.campusCoordsLong);
  });
};

window.showSelected = showSelected;
init();

/**
 * Checks if value is was not defined
 * @param {*} value
 * @param {*} replacingValue
 * @returns value you set as a parameter in case it was null
 */
const isnull = (value, replacingValue) => {
  let returnValue = replacingValue;
  try {
    if (value != undefined) {
      if (value != "null" && value != "Unknown") {
        returnValue = value;
      }
    }
  } catch (error) {
    console.log(error);
  }
  return returnValue;
};


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
