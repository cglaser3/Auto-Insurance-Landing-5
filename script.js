document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  let formData = {};

  // Generate a list of years from 1981 through 2025
  const vehicleYears = Array.from({ length: 2025 - 1981 + 1 }, (_, i) => 1981 + i);

  // Cache for API responses to avoid repeated network requests
  let makeCache = null;
  const modelCache = {};

  async function fetchMakesForYear() {
    if (!makeCache) {
      const makeMap = new Map();
      const url =
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/${encodeURIComponent(
          "passenger car"
        )}?format=json`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        data.Results.forEach((r) =>
          makeMap.set(r.MakeName, { id: r.MakeId, name: r.MakeName })
        );
      } catch (err) {
        console.error("Error fetching makes", err);
      }
      makeCache = Array.from(makeMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }
    return makeCache;
  }

  async function fetchModelsForMakeYear(make, year) {
    const key = `${make}-${year}`;
    if (!modelCache[key]) {
      const modelSet = new Set();
      const url =
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(
          make
        )}/modelyear/${year}/vehicletype/${encodeURIComponent(
          "passenger car"
        )}?format=json`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        data.Results.forEach((r) => modelSet.add(r.Model_Name));
      } catch (err) {
        console.error("Error fetching models", err);
      }
      modelCache[key] = Array.from(modelSet).sort();
    }
    return modelCache[key];
  }

  function renderStep1() {
    app.innerHTML = `
      <div class="container">
        <h2>AI Insurance Advisor</h2>
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
      yearSelect.addEventListener("change", async (e) => {
        const fieldset = e.target.closest(".vehicle");
        const makeSelect = fieldset.querySelector(".make");
        makeSelect.innerHTML = '<option value="" disabled selected>Loading…</option>';
        makeSelect.disabled = true;

        const makes = await fetchMakesForYear();
        makeSelect.innerHTML =
          '<option value="" disabled selected>Select make</option>' +
          makes.map((m) => `<option value="${m.name}">${m.name}</option>`).join("");
        makeSelect.disabled = makes.length === 0;

        const modelSelect = fieldset.querySelector(".model");
        modelSelect.innerHTML = '<option value="" disabled selected>Select model</option>';
        modelSelect.disabled = true;
      });
    });

    // Populate models when a make is selected
    container.querySelectorAll(".make").forEach((makeSelect) => {
      makeSelect.addEventListener("change", async (e) => {
        const fieldset = e.target.closest(".vehicle");
        const year = fieldset.querySelector(".year").value;
        const mk = e.target.value;
        const modelSelect = fieldset.querySelector(".model");
        modelSelect.innerHTML = '<option value="" disabled selected>Loading…</option>';
        modelSelect.disabled = true;

        const models = await fetchModelsForMakeYear(mk, year);
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
        <h2>AI Insurance Advisor</h2>
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
      renderStep3();
    });
  }

  function renderStep3() {
    app.innerHTML = `
      <div class="container">
        <h2>AI Insurance Advisor</h2>
        <p class="progress">Step 3 of 5</p>
        <form id="step3">
          <label for="driverCount">Number of Drivers</label>
          <select name="driverCount" id="driverCount">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          <div id="driversContainer"></div>
          <button type="submit">Next</button>
        </form>
      </div>
    `;

    const driverCount = document.getElementById("driverCount");
    const driversContainer = document.getElementById("driversContainer");

    const renderDriverInputs = (count) => {
      driversContainer.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const first = i === 0 ? formData.firstName || "" : "";
        const last = i === 0 ? formData.lastName || "" : "";
        const dob = i === 0 ? formData.dob || "" : "";
        driversContainer.insertAdjacentHTML(
          "beforeend",
          `
            <fieldset class="driver" data-index="${i}">
              <legend>Driver ${i + 1}</legend>
              <input type="text" name="driverFirst${i}" placeholder="First Name" value="${first}" required />
              <input type="text" name="driverLast${i}" placeholder="Last Name" value="${last}" required />
              <input type="date" name="driverDob${i}" placeholder="Date of Birth" value="${dob}" required />
              <input type="text" name="driverLicense${i}" placeholder="Driver License # (optional)" />
            </fieldset>
          `
        );
      }
    };

    const updateDrivers = () => {
      renderDriverInputs(parseInt(driverCount.value, 10));
    };

    driverCount.addEventListener("change", updateDrivers);
    updateDrivers();

    document.getElementById("step3").addEventListener("submit", (e) => {
      e.preventDefault();
      const count = parseInt(driverCount.value, 10);
      formData.drivers = [];
      for (let i = 0; i < count; i++) {
        formData.drivers.push({
          first: document.querySelector(`input[name=driverFirst${i}]`).value,
          last: document.querySelector(`input[name=driverLast${i}]`).value,
          dob: document.querySelector(`input[name=driverDob${i}]`).value,
          license: document.querySelector(`input[name=driverLicense${i}]`).value,
        });
      }
      renderStep4();
    });
  }

  function renderStep4() {
    const vehicleCoverages = formData.vehicles
      .map((v, i) => {
        return `
          <fieldset class="vehicleCoverage" data-index="${i}">
            <legend>Vehicle ${i + 1} Coverage</legend>
            <label>Coverage Type</label>
            <select name="coverageType${i}" class="coverageType">
              <option value="full">Full Coverage</option>
              <option value="liability">Liability Only</option>
            </select>
            <label class="deductibleLabel">Deductible</label>
            <select name="deductible${i}" class="deductible">
              <option value="250">250</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </fieldset>`;
      })
      .join("");

    app.innerHTML = `
      <div class="container">
        <h2>AI Insurance Advisor</h2>
        <p class="progress">Step 4 of 5</p>
        <form id="step4">
          <label>Coverage Limits</label>
          <select name="currentLimits" required>
            <option value="25/50">25,000/50,000</option>
            <option value="50/100">50,000/100,000</option>
            <option value="100/300">100,000/300,000</option>
            <option value="gt100/300">Greater than 100,000/300,000</option>
          </select>
          ${vehicleCoverages}
          <label>Time with Current Company</label>
          <select name="currentTime" required>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="4">4 years</option>
            <option value="5">5 years</option>
            <option value="gt5">Greater than 5 years</option>
          </select>
          <label>Current Premium</label>
          <input type="text" name="currentPremium" placeholder="Amount" />
          <select name="payFrequency">
            <option value="">Select frequency</option>
            <option value="monthly">Monthly</option>
            <option value="6-month">Every 6 Months</option>
          </select>
          <button type="submit">Next</button>
        </form>
      </div>
    `;

    // toggle deductible visibility based on coverage selection
    app.querySelectorAll('.vehicleCoverage').forEach((fs) => {
      const cov = fs.querySelector('.coverageType');
      const dedLabel = fs.querySelector('.deductibleLabel');
      const dedSel = fs.querySelector('.deductible');
      const update = () => {
        if (cov.value === 'full') {
          dedLabel.classList.remove('hidden');
          dedSel.classList.remove('hidden');
          dedSel.disabled = false;
        } else {
          dedLabel.classList.add('hidden');
          dedSel.classList.add('hidden');
          dedSel.disabled = true;
        }
      };
      cov.addEventListener('change', update);
      update();
    });

    document.getElementById("step4").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const vehicleCoveragesData = formData.vehicles.map((_, i) => {
        const type = f[`coverageType${i}`].value;
        const deductibleField = f[`deductible${i}`];
        return {
          type,
          deductible: type === 'full' ? deductibleField.value : "",
        };
      });
      formData.currentInsurance = {
        limits: f.currentLimits.value,
        timeWithCompany: f.currentTime.value,
        currentPremium: f.currentPremium.value,
        frequency: f.payFrequency.value,
        vehicleCoverages: vehicleCoveragesData,
      };
      renderStep5();
    });
  }

  function renderStep5() {
    app.innerHTML = `
      <div class="container">
        <h2>Thank You</h2>
        <p class="progress">Step 5 of 5</p>
        <p>Your quote will be emailed to you within the next 20 minutes.</p>
      </div>
    `;
  }

  renderStep1();
});
