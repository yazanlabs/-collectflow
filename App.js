const demoData = [

  { customer: "Northstar Studio", email: "billing@northstar.example", invoice: "INV-1042", due_date: "2026-06-15", amount: 4200, status: "Overdue" },

  { customer: "Bluebird Foods", email: "accounts@bluebird.example", invoice: "INV-1088", due_date: "2026-07-02", amount: 1850, status: "Overdue" },

  { customer: "Atlas Works", email: "finance@atlas.example", invoice: "INV-1113", due_date: "2026-07-25", amount: 7600, status: "Overdue" },

  { customer: "Cedar Labs", email: "ap@cedarlabs.example", invoice: "INV-1130", due_date: "2026-08-05", amount: 950, status: "Overdue" }

];

let invoices = [];

let activeIndex = null;

const $ = (id) => document.getElementById(id);

const money = (n) =>

  new Intl.NumberFormat("en-US", {

    style: "currency",

    currency: "USD",

    maximumFractionDigits: 0

  }).format(Number(n) || 0);

function daysOverdue(dateString) {

  const due = new Date(dateString + "T12:00:00");

  const today = new Date();

  return Math.max(0, Math.floor((today - due) / 86400000));

}

function priority(inv) {

  const days = daysOverdue(inv.due_date);

  if (days >= 45 || Number(inv.amount) >= 5000) return "High";

  if (days >= 20 || Number(inv.amount) >= 2000) return "Medium";

  return "Low";

}

function render() {

  const body = $("invoiceBody");

  body.innerHTML = "";

  invoices.forEach((inv, index) => {

    const tr = document.createElement("tr");

    const p = priority(inv);

    tr.innerHTML = `

      <td><strong>${inv.customer}</strong><small>${inv.email}</small></td>

      <td>${inv.invoice}</td>

      <td>${money(inv.amount)}</td>

      <td>${daysOverdue(inv.due_date)}</td>

      <td>${p}</td>

      <td>${inv.status}</td>

      <td>

        <button class="action-btn" data-index="${index}">

          Draft follow-up

        </button>

      </td>

    `;

    body.appendChild(tr);

  });

  const open = invoices.filter(x => x.status !== "Recovered");

  $("totalOutstanding").textContent =

    money(open.reduce((sum, x) => sum + Number(x.amount), 0));

  $("over30").textContent =

    money(

      open

        .filter(x => daysOverdue(x.due_date) >= 30)

        .reduce((sum, x) => sum + Number(x.amount), 0)

    );

  $("highPriority").textContent =

    money(

      open

        .filter(x => priority(x) === "High")

        .reduce((sum, x) => sum + Number(x.amount), 0)

    );

  $("recovered").textContent =

    money(

      invoices

        .filter(x => x.status === "Recovered")

        .reduce((sum, x) => sum + Number(x.amount), 0)

    );

}

$("loadDemoBtn").addEventListener("click", () => {

  invoices = demoData.map(x => ({ ...x }));

  render();

});

document.addEventListener("click", (event) => {

  if (!event.target.classList.contains("action-btn")) return;

  activeIndex = Number(event.target.dataset.index);

  const inv = invoices[activeIndex];

  $("dialogTitle").textContent = `Follow-up · ${inv.customer}`;

  $("dialogMeta").textContent =

    `${inv.invoice} · ${money(inv.amount)} · ${daysOverdue(inv.due_date)} days overdue`;

  $("messageText").value =

`Subject: Payment reminder for ${inv.invoice}

Hi ${inv.customer},

I'm following up regarding invoice ${inv.invoice} for ${money(inv.amount)}.

Could you please confirm the payment status or expected payment date?

Thank you,

CollectFlow`;

  $("messageDialog").showModal();

});

$("skipBtn").addEventListener("click", () => {

  $("messageDialog").close();

});

$("approveBtn").addEventListener("click", () => {

  if (activeIndex === null) return;

  invoices[activeIndex].status = "Recovered";

  $("messageDialog").close();

  activeIndex = null;

  render();

});
