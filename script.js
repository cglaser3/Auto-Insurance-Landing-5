document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  let formData = {};

  const vehicleYears = [2020, 2021, 2022, 2023];
  const makesByYear = {
    2020: ["Ford", "Toyota", "Honda"],
    2021: ["Ford", "Toyota", "Honda", "Chevrolet"],
    2022: ["Ford", "Toyota", "Honda", "Chevrolet", "Nissan"],
    2023: ["Ford", "Toyota", "Honda", "Chevrolet", "Nissan", "BMW"],
  };

  function renderStep1() {
    app.innerHTML = `
      <div class="container">
        <h2>Auto Insurance Quote Form</h2>
        <p class="progress">Step 1 of 5</p>
        <form id="step1">
          <input type="text" name="firstName" placeholder="First Name" required />
          <input type="text" name="lastName" placeholder="Last Name" required />
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
          <input type="text" name="model${i}" placeholder="Model" required />
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
          model: document.querySelector(`input[name=model${i}]`).value,
        });
      }
      console.log(formData); // placeholder for next steps
    });
  }

  renderStep1();
});
