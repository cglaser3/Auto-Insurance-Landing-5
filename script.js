document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  const steps = [
    `
      <form id="step1">
        <input type="text" name="firstName" placeholder="First Name" required />
        <input type="text" name="lastName" placeholder="Last Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="tel" name="phone" placeholder="Phone (10 digits)" required pattern="\\d{10}" />
        <input type="date" name="dob" placeholder="Date of Birth" required />
        <input type="text" name="address" placeholder="Street Address" required />
        <input type="text" name="city" placeholder="City" required />
        <input type="text" name="state" placeholder="State" required />
        <input type="text" name="zip" placeholder="ZIP Code" required />
        <button type="submit">Next</button>
      </form>
    `,
    `
      <form id="step2">
        <select id="numVehicles" name="numVehicles" required>
          <option value="" disabled selected>Number of Vehicles</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5+</option>
        </select>
        <input type="text" id="vin" name="vin" placeholder="VIN (optional)" maxlength="17" />
        <select id="vehicleYear" name="vehicleYear" required>
          <option value="" disabled selected>Select Year</option>
        </select>
        <select id="vehicleMake" name="vehicleMake" required disabled>
          <option value="" disabled selected>Select Make</option>
        </select>
        <select id="vehicleModel" name="vehicleModel" required disabled>
          <option value="" disabled selected>Select Model</option>
        </select>
        <button type="submit">Next</button>
      </form>
    `,
    `
      <form id="step3">
        <select name="coverage" required>
          <option value="" disabled selected>Select Coverage Level</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
        <button type="submit">Next</button>
      </form>
    `,
    `
      <form id="step4">
        <input type="number" name="accidents" placeholder="Number of Accidents" required />
        <input type="number" name="tickets" placeholder="Number of Tickets" required />
        <button type="submit">Next</button>
      </form>
    `,
    `
      <form id="step5">
        <p>Please submit your quote request.</p>
        <button type="submit">Submit</button>
      </form>
    `,
  ];

  let currentStep = 0;

  const setupVehicleForm = () => {
    const yearSelect = document.getElementById("vehicleYear");
    const makeSelect = document.getElementById("vehicleMake");
    const modelSelect = document.getElementById("vehicleModel");
    const vinInput = document.getElementById("vin");

    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1981; y--) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }

    yearSelect.addEventListener("change", async () => {
      makeSelect.disabled = true;
      modelSelect.disabled = true;
      makeSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';
      modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';
      const year = yearSelect.value;
      try {
        const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleModelYear/${year}?vehicleType=passenger%20car&format=json`);
        const data = await res.json();
        makeSelect.innerHTML = '<option value="" disabled selected>Select Make</option>';
        (data.Results || []).forEach(m => {
          const o = document.createElement("option");
          o.value = m.Make_Name;
          o.textContent = m.Make_Name;
          makeSelect.appendChild(o);
        });
        makeSelect.disabled = false;
      } catch (err) {
        makeSelect.innerHTML = '<option value="" disabled selected>No data</option>';
      }
    });

    makeSelect.addEventListener("change", async () => {
      modelSelect.disabled = true;
      modelSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';
      const year = yearSelect.value;
      const make = makeSelect.value;
      try {
        const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?vehicleType=passenger%20car&format=json`);
        const data = await res.json();
        modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';
        (data.Results || []).forEach(m => {
          const o = document.createElement("option");
          o.value = m.Model_Name;
          o.textContent = m.Model_Name;
          modelSelect.appendChild(o);
        });
        modelSelect.disabled = false;
      } catch (err) {
        modelSelect.innerHTML = '<option value="" disabled selected>No data</option>';
      }
    });

    vinInput.addEventListener("blur", async () => {
      const vin = vinInput.value.trim();
      if (vin.length === 17) {
        try {
          const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`);
          const data = await res.json();
          const info = data.Results && data.Results[0];
          if (info) {
            if (info.ModelYear) {
              yearSelect.value = info.ModelYear;
              yearSelect.dispatchEvent(new Event("change"));
            }
            if (info.Make) {
              const setMake = () => {
                if (makeSelect.disabled) {
                  setTimeout(setMake, 100);
                } else {
                  makeSelect.value = info.Make;
                  makeSelect.dispatchEvent(new Event("change"));
                }
              };
              setMake();
            }
            if (info.Model) {
              const setModel = () => {
                if (modelSelect.disabled) {
                  setTimeout(setModel, 100);
                } else {
                  modelSelect.value = info.Model;
                }
              };
              setModel();
            }
          }
        } catch (err) {
          // ignore errors
        }
      }
    });
  };

  const renderStep = () => {
    app.innerHTML = `
      <div class="container">
        <h2>Auto Insurance Quote Form</h2>
        <p class="progress">Step ${currentStep + 1} of ${steps.length}</p>
        ${steps[currentStep]}
      </div>
    `;

    if (currentStep === 1) {
      setupVehicleForm();
    }

    const form = app.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep();
      } else {
        app.innerHTML = `
          <div class="container">
            <h2>Thank you!</h2>
            <p>Your information has been submitted.</p>
          </div>
        `;
      }
    });
  };

  renderStep();
});
