document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  const steps = [
    `
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
    `,
    `
      <form id="step2">
        <input type="text" name="vehicleYear" placeholder="Vehicle Year" required />
        <input type="text" name="vehicleMake" placeholder="Vehicle Make" required />
        <input type="text" name="vehicleModel" placeholder="Vehicle Model" required />
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

  const renderStep = () => {
    app.innerHTML = `
      <div class="container">
        <h2>Auto Insurance Quote Form</h2>
        <p class="progress">Step ${currentStep + 1} of ${steps.length}</p>
        ${steps[currentStep]}
      </div>
    `;

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
