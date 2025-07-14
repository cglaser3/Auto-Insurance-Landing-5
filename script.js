document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  let formData = {};

  // Generate a list of years from 1981 through 2025
  const vehicleYears = Array.from({ length: 2025 - 1981 + 1 }, (_, i) => 1981 + i);

  // Common makes available for each year
  const makes = [
    "Ford",
    "Chevrolet",
    "Toyota",
    "Honda",
    "Nissan",
    "BMW",
  ];

  // Map every year to the same list of makes
  const makesByYear = vehicleYears.reduce((acc, y) => {
    acc[y] = makes;
    return acc;
  }, {});

  // Models available for each make
  const modelsByMake = {
    Ford: ["F-150", "Mustang", "Explorer"],
    Chevrolet: ["Silverado", "Malibu", "Camaro"],
    Toyota: ["Camry", "Corolla", "RAV4"],
    Honda: ["Accord", "Civic", "CR-V"],
    Nissan: ["Altima", "Sentra", "Rogue"],
    BMW: ["3 Series", "5 Series", "X5"],
  };

  function renderStep1() {
    app.innerHTML = `
      <div class="container">
        <h2>Auto Insurance Quote Form</h2>
        <p class="progress">Step 1 of 5</p>
        <form id="step1">
          <input type="text" name="firstName" placeholder="First Name" required />
          <input type="text" name="lastName" placeholder="Last Name" required />
          <input type="date" name="dob" placeholder="Date of Birth" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="tel" name="phone" placeholder="Phone (10 digits)" required pattern="\\d{10}" />
          <input type="text" name="address" placeholder="Street Address" required />
          <input type="text" name="city" placeholder="City" required />
          <input type="text" name="state" placeholder="State" required />
          <input type="text" name="zip" placeholder="ZIP Code" required />
          <button type="submit">Next</button>
        </form>
      </div>
    `;
    document.getElementById("step1").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      formData = {
        firstName: f.firstName.value,
        lastName: f.lastName.value,
        dob: f.dob.value,
        email: f.email.value,
        phone: f.phone.value,
        address: f.address.value,
        city: f.city.value,
        state: f.state.value,
        zip: f.zip.value,
      };
      renderStep2();
    });
  }

  function renderVehicleInputs(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const yearOptions = vehicleYears.map((y) => `<option value="${y}">${y}</option>`).join("");
      container.insertAdjacentHTML(
        "beforeend",
        `
        <fieldset class="vehicle" data-index="${i}">
          <legend>Vehicle ${i + 1}</legend>
          <label>Year</label>
          <select name="year${i}" class="year">
            <option value="" disabled selected>Select year</option>
            ${yearOptions}
          </select>
          <label>Make</label>
          <select name="make${i}" class="make" disabled>
            <option value="" disabled selected>Select make</option>
          </select>
          <label>Model</label>
          <select name="model${i}" class="model" disabled>
            <option value="" disabled selected>Select model</option>
          </select>
        </fieldset>
        `
      );
    }

    container.querySelectorAll(".year").forEach((yearSelect) => {
      yearSelect.addEventListener("change", (e) => {
        const yr = e.target.value;
        const fieldset = e.target.closest(".vehicle");
        const makeSelect = fieldset.querySelector(".make");
        const makes = makesByYear[yr] || [];
        makeSelect.innerHTML =
          '<option value="" disabled selected>Select make</option>' +
          makes.map((m) => `<option value="${m}">${m}</option>`).join("");
        makeSelect.disabled = makes.length === 0;

        // Reset model dropdown when year changes
        const modelSelect = fieldset.querySelector(".model");
        modelSelect.innerHTML = '<option value="" disabled selected>Select model</option>';
        modelSelect.disabled = true;
      });
    });

    // Populate models when a make is selected
    container.querySelectorAll(".make").forEach((makeSelect) => {
      makeSelect.addEventListener("change", (e) => {
        const mk = e.target.value;
        const fieldset = e.target.closest(".vehicle");
        const modelSelect = fieldset.querySelector(".model");
        const models = modelsByMake[mk] || [];
        modelSelect.innerHTML =
          '<option value="" disabled selected>Select model</option>' +
          models.map((m) => `<option value="${m}">${m}</option>`).join("");
        modelSelect.disabled = models.length === 0;
      });
    });
  }

  function renderStep2() {
    app.innerHTML = `
      <div class="container">
        <h2>Auto Insurance Quote Form</h2>
        <p class="progress">Step 2 of 5</p>
        <form id="step2">
          <label for="vehicleCount">Number of Vehicles</label>
          <select name="vehicleCount" id="vehicleCount">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          <div id="vehiclesContainer"></div>
          <button type="submit">Next</button>
        </form>
      </div>
    `;
    const vehicleCount = document.getElementById("vehicleCount");
    const vehiclesContainer = document.getElementById("vehiclesContainer");

    const updateInputs = () => {
      renderVehicleInputs(vehiclesContainer, parseInt(vehicleCount.value, 10));
    };

    vehicleCount.addEventListener("change", updateInputs);
    updateInputs();

    document.getElementById("step2").addEventListener("submit", (e) => {
      e.preventDefault();
      const count = parseInt(vehicleCount.value, 10);
      formData.vehicles = [];
      for (let i = 0; i < count; i++) {
        formData.vehicles.push({
          year: document.querySelector(`select[name=year${i}]`).value,
          make: document.querySelector(`select[name=make${i}]`).value,
          model: document.querySelector(`select[name=model${i}]`).value,
        });
      }
      console.log(formData); // placeholder for next steps
    });
  }

  renderStep1();
});
