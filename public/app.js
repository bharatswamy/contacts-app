const demoContacts = [
  {
    name: "Aarav Mehta",
    number: "9876543210",
    message: "Product designer. Prefers evening calls and short, clear updates."
  },
  {
    name: "Diya Kapoor",
    number: "9123456780",
    message: "College friend. Good person to ping for travel plans and weekend catchups."
  },
  {
    name: "Kabir Sharma",
    number: "9988776655",
    message: "Frontend engineer. Usually available on weekdays after 6 PM."
  }
];

const state = {
  contacts: [],
  search: "",
  editingId: null,
  previewId: null
};

const elements = {
  contactsGrid: document.querySelector("#contacts-grid"),
  emptyState: document.querySelector("#empty-state"),
  totalCount: document.querySelector("#total-count"),
  searchCount: document.querySelector("#search-count"),
  apiStatus: document.querySelector("#api-status"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  clearSearch: document.querySelector("#clear-search"),
  refreshList: document.querySelector("#refresh-list"),
  clearAll: document.querySelector("#clear-all"),
  seedDemo: document.querySelector("#seed-demo"),
  editorForm: document.querySelector("#editor-form"),
  formEyebrow: document.querySelector("#form-eyebrow"),
  formTitle: document.querySelector("#form-title"),
  submitButton: document.querySelector("#submit-button"),
  cancelEdit: document.querySelector("#cancel-edit"),
  formMessage: document.querySelector("#form-message"),
  name: document.querySelector("#name"),
  number: document.querySelector("#number"),
  message: document.querySelector("#message"),
  previewAvatar: document.querySelector("#preview-avatar"),
  previewName: document.querySelector("#preview-name"),
  previewNumber: document.querySelector("#preview-number"),
  previewMessage: document.querySelector("#preview-message"),
  cardTemplate: document.querySelector("#contact-card-template")
};

const apiBase = getApiBase();

elements.searchForm.addEventListener("submit", onSearch);
elements.clearSearch.addEventListener("click", clearSearch);
elements.refreshList.addEventListener("click", () => {
  fetchContacts({ message: "List refreshed." });
});
elements.clearAll.addEventListener("click", clearAllContacts);
elements.seedDemo.addEventListener("click", seedDemoContacts);
elements.editorForm.addEventListener("submit", onSaveContact);
elements.cancelEdit.addEventListener("click", resetForm);

if (!apiBase) {
  elements.apiStatus.textContent = "Set public/config.js or use a custom domain with api.*";
  setFormMessage("API base is not configured. Set public/config.js or use api.yourdomain.com.", "error");
} else {
  elements.apiStatus.textContent = apiBase;
  fetchContacts();
}

async function fetchContacts(options = {}) {
  setFormMessage(options.loadingMessage || "Loading contacts...");

  try {
    const query = state.search.trim()
      ? `?search=${encodeURIComponent(state.search.trim())}`
      : "";
    const response = await fetch(`${apiBase}${query}`, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    const data = await response.json();
    state.contacts = data.contacts || [];
    syncSelection();
    render();
    setFormMessage(options.message || "Contacts synced with Django.");
  } catch (error) {
    console.error(error);
    setFormMessage("Could not load contacts from the Django API.", "error");
  }
}

function render() {
  elements.totalCount.textContent = String(state.contacts.length);
  elements.searchCount.textContent = String(state.contacts.length);
  elements.contactsGrid.innerHTML = "";
  elements.emptyState.classList.toggle("is-hidden", state.contacts.length > 0);

  state.contacts.forEach((contact, index) => {
    const fragment = elements.cardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".contact-card");
    const avatar = fragment.querySelector(".contact-avatar");
    const order = fragment.querySelector(".contact-order");
    const name = fragment.querySelector(".contact-name");
    const number = fragment.querySelector(".contact-number");
    const message = fragment.querySelector(".contact-message");
    const previewButton = fragment.querySelector(".contact-view");
    const editButton = fragment.querySelector(".contact-edit");
    const deleteButton = fragment.querySelector(".contact-delete");

    avatar.textContent = getInitial(contact.name);
    order.textContent = `Contact ${index + 1}`;
    name.textContent = contact.name;
    number.textContent = contact.number;
    message.textContent = contact.message || "No notes saved yet for this contact.";

    previewButton.addEventListener("click", () => {
      state.previewId = contact.id;
      render();
    });

    editButton.addEventListener("click", () => {
      populateForm(contact);
      state.previewId = contact.id;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    deleteButton.addEventListener("click", () => {
      deleteContact(contact.id);
    });

    if (state.previewId === contact.id) {
      card.classList.add("is-selected");
    }

    elements.contactsGrid.appendChild(fragment);
  });

  renderPreview();
}

function renderPreview() {
  const contact = state.contacts.find((item) => item.id === state.previewId);

  if (!contact) {
    elements.previewAvatar.textContent = "C";
    elements.previewName.textContent = "Contact Canvas";
    elements.previewNumber.textContent = "Select a contact to inspect it here.";
    elements.previewMessage.textContent =
      "Contact notes will appear here. This Cloudflare frontend expects a Django API backend.";
    return;
  }

  elements.previewAvatar.textContent = getInitial(contact.name);
  elements.previewName.textContent = contact.name;
  elements.previewNumber.textContent = contact.number;
  elements.previewMessage.textContent =
    contact.message || "No notes saved yet for this contact.";
}

async function onSearch(event) {
  event.preventDefault();
  state.search = elements.searchInput.value;
  await fetchContacts({ message: "Search updated." });
}

async function clearSearch() {
  state.search = "";
  elements.searchInput.value = "";
  await fetchContacts({ message: "Search cleared." });
}

async function onSaveContact(event) {
  event.preventDefault();

  const payload = {
    name: elements.name.value.trim(),
    number: elements.number.value.trim(),
    message: elements.message.value.trim()
  };

  if (!payload.name || !payload.number) {
    setFormMessage("Name and phone number are required.", "error");
    return;
  }

  if (state.editingId) {
    await saveContact(`${apiBase}${state.editingId}/`, "PUT", payload, "Contact updated.");
    return;
  }

  await saveContact(apiBase, "POST", payload, "Contact created.");
}

async function saveContact(url, method, payload, successMessage) {
  setFormMessage("Saving to Django...");

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setFormMessage(formatErrors(data.errors), "error");
      return;
    }

    state.previewId = data.contact.id;
    resetForm();
    await fetchContacts({ message: successMessage });
  } catch (error) {
    console.error(error);
    setFormMessage("Save request failed.", "error");
  }
}

function populateForm(contact) {
  state.editingId = contact.id;
  elements.name.value = contact.name;
  elements.number.value = contact.number;
  elements.message.value = contact.message;
  elements.formEyebrow.textContent = "Edit Entry";
  elements.formTitle.textContent = `Update ${contact.name}`;
  elements.submitButton.textContent = "Save Changes";
  setFormMessage("Editing existing contact.");
}

function resetForm() {
  state.editingId = null;
  elements.editorForm.reset();
  elements.formEyebrow.textContent = "New Entry";
  elements.formTitle.textContent = "Create Contact";
  elements.submitButton.textContent = "Save Contact";
}

async function deleteContact(contactId) {
  const contact = state.contacts.find((item) => item.id === contactId);
  if (!contact) {
    return;
  }

  const confirmed = window.confirm(`Delete ${contact.name}?`);
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${apiBase}${contactId}/`, {
      method: "DELETE"
    });

    if (!response.ok) {
      setFormMessage("Delete request failed.", "error");
      return;
    }

    if (state.editingId === contactId) {
      resetForm();
    }
    if (state.previewId === contactId) {
      state.previewId = null;
    }
    await fetchContacts({ message: "Contact deleted." });
  } catch (error) {
    console.error(error);
    setFormMessage("Delete request failed.", "error");
  }
}

async function clearAllContacts() {
  if (state.contacts.length === 0) {
    setFormMessage("There are no contacts to delete.");
    return;
  }

  const confirmed = window.confirm("Delete all saved contacts from the Django database?");
  if (!confirmed) {
    return;
  }

  for (const contact of [...state.contacts]) {
    await deleteContact(contact.id);
  }
}

async function seedDemoContacts() {
  for (const contact of demoContacts) {
    await saveContact(apiBase, "POST", contact, `Added ${contact.name}.`);
  }
  await fetchContacts({ message: "Demo contacts loaded into Django." });
}

function syncSelection() {
  if (!state.previewId && state.contacts.length > 0) {
    state.previewId = state.contacts[0].id;
    return;
  }

  if (!state.contacts.some((contact) => contact.id === state.previewId)) {
    state.previewId = state.contacts[0]?.id || null;
  }
}

function setFormMessage(message, tone = "") {
  elements.formMessage.textContent = message;
  elements.formMessage.dataset.tone = tone;
}

function formatErrors(errors) {
  if (!errors) {
    return "Something went wrong.";
  }

  return Object.values(errors)
    .flat()
    .join(" ");
}

function getInitial(name) {
  return (name || "C").trim().charAt(0).toUpperCase();
}

function getApiBase() {
  if (window.CONTACTS_API_BASE) {
    return ensureTrailingSlash(window.CONTACTS_API_BASE);
  }

  const { hostname } = window.location;
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://127.0.0.1:8001/api/contacts/";
  }

  if (hostname.endsWith(".pages.dev")) {
    return "";
  }

  const cleanHost = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  return `https://api.${cleanHost}/api/contacts/`;
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
