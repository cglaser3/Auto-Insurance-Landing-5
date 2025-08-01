document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="container">
      <h2>Auto Insurance Quote Form</h2>
      <p class="progress">Step 1 of 5</p>
      <form id="step1">
        <input type="text" name="firstName" placeholder="First Name" required />
        <input type="text" name="lastName" placeholder="Last Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="date" name="dob" placeholder="Date of Birth" required />
        <input type="tel" name="phone" placeholder="Phone (10 digits)" required pattern="[0-9]{10}" />
        <input type="text" name="address" placeholder="Street Address" required />
        <input type="text" name="city" placeholder="City" required />
        <input type="text" name="state" placeholder="State" required />
        <input type="text" name="zip" placeholder="ZIP Code" required />
        <button type="submit">Next</button>
      </form>
    </div>
  `;
});
