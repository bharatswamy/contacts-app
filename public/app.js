const STORAGE_KEY = "contact-canvas-static-v1";

const demoContacts = [
  {
    id: crypto.randomUUID(),
    name: "Aarav Mehta",
    number: "9876543210",
    message: "Product designer. Prefers evening calls and short, clear updates."
  },
  {
    id: crypto.randomUUID(),
    name: "Diya Kapoor",
    number: "9123456780",
    message: "College friend. Good person to ping for travel plans and weekend catchups."
  },
  {
    id: crypto.randomUUID(),
    name: "Kabir Sharma",
    number: "9988776655",
    message: "Frontend engineer. Usually available on weekdays after 6 PM."
  }
];

const state = {
  contacts: loadContacts(),
  search: "",
  editingId: null,
  previewId: null
};

const elements = {
  contactsGrid: document.querySelector("#contacts-grid"),
  emptyState: document.querySelector("#empty-state"),
  totalCount: document.querySelector("#total-count"),
  searchCount: document.querySelector("#search-count"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  clearSearch: document.querySelector("#clear-search"),
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

elements.searchForm.addEventListener("submit", onSearch);
elements.clearSearch.addEventListener("click", clearSearch);
elements.clearAll.addEventListener("click", clearAllContacts);
elements.seedDemo.addEventListener("click", seedDemoContacts);
elements.editorForm.addEventListener("submit", onSaveContact);
elements.cancelEdit.addEventListener("click", resetForm);

render();

function loadContacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read contacts from localStorage", error);
    return [];
  }
}

function saveContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.contacts));
}

function getFilteredContacts() {
  const query = state.search.trim().toLowerCase();
  if (!query) {
    return state.contacts;
  }

  return state.contacts.filter((contact) => {
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.number.toLowerCase().includes(query) ||
      (contact.message || "").toLowerCase().includes(query)
    );
  });
}

function render() {
  const filteredContacts = getFilteredContacts();

  elements.totalCount.textContent = String(state.contacts.length);
  elements.searchCount.textContent = String(filteredContacts.length);
  elements.contactsGrid.innerHTML = "";
  elements.emptyState.classList.toggle("is-hidden", filteredContacts.length > 0);

  filteredContacts.forEach((contact, index) => {
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
      renderPreview();
    });

    editButton.addEventListener("click", () => {
      populateForm(contact);
      state.previewId = contact.id;
      renderPreview();
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

  if (!state.previewId && filteredContacts.length > 0) {
    state.previewId = filteredContacts[0].id;
  }

  if (filteredContacts.length === 0) {
    state.previewId = null;
  } else if (!filteredContacts.some((contact) => contact.id === state.previewId)) {
    state.previewId = filteredContacts[0].id;
  }

  renderPreview();
}

function renderPreview() {
  const contact = state.contacts.find((item) => item.id === state.previewId);

  if (!contact) {
    elements.previewAvatar.textContent = "C";
    elements.previewName.textContent = "Contact Canvas";
    elements.previewNumber.textContent = "Select a contact to inspect it here.";
    elements.previewMessage.textContent =
      "Contact notes will appear here. This panel helps the static app still feel like a profile view.";
    return;
  }

  elements.previewAvatar.textContent = getInitial(contact.name);
  elements.previewName.textContent = contact.name;
  elements.previewNumber.textContent = contact.number;
  elements.previewMessage.textContent =
    contact.message || "No notes saved yet for this contact.";
}

function onSearch(event) {
  event.preventDefault();
  state.search = elements.searchInput.value;
  render();
}

function clearSearch() {
  state.search = "";
  elements.searchInput.value = "";
  render();
}

function onSaveContact(event) {
  event.preventDefault();

  const payload = {
    id: state.editingId || crypto.randomUUID(),
    name: elements.name.value.trim(),
    number: elements.number.value.trim(),
    message: elements.message.value.trim()
  };

  if (!payload.name || !payload.number) {
    setFormMessage("Name and phone number are required.");
    return;
  }

  if (!/^[A-Za-z]/.test(payload.name)) {
    setFormMessage("Name should start with a letter.");
    return;
  }

  if (payload.name[0] !== payload.name[0].toUpperCase()) {
    setFormMessage("Name should start with a capital letter.");
    return;
  }

  const existingIndex = state.contacts.findIndex((contact) => contact.id === payload.id);
  if (existingIndex >= 0) {
    state.contacts[existingIndex] = payload;
  } else {
    state.contacts.unshift(payload);
  }

  saveContacts();
  state.previewId = payload.id;
  resetForm();
  render();
  setFormMessage("Contact saved successfully.");
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

function deleteContact(contactId) {
  const contact = state.contacts.find((item) => item.id === contactId);
  if (!contact) {
    return;
  }

  const confirmed = window.confirm(`Delete ${contact.name}?`);
  if (!confirmed) {
    return;
  }

  state.contacts = state.contacts.filter((item) => item.id !== contactId);
  if (state.editingId === contactId) {
    resetForm();
  }
  if (state.previewId === contactId) {
    state.previewId = null;
  }
  saveContacts();
  render();
  setFormMessage("Contact deleted.");
}

function clearAllContacts() {
  if (state.contacts.length === 0) {
    setFormMessage("There are no contacts to delete.");
    return;
  }

  const confirmed = window.confirm("Delete all saved contacts from this browser?");
  if (!confirmed) {
    return;
  }

  state.contacts = [];
  state.previewId = null;
  resetForm();
  saveContacts();
  render();
  setFormMessage("All contacts removed from this browser.");
}

function seedDemoContacts() {
  state.contacts = demoContacts.map((contact) => ({ ...contact, id: crypto.randomUUID() }));
  state.previewId = state.contacts[0]?.id ?? null;
  saveContacts();
  render();
  setFormMessage("Demo contacts loaded.");
}

function setFormMessage(message) {
  elements.formMessage.textContent = message;
}

function getInitial(name) {
  return (name || "C").trim().charAt(0).toUpperCase();
}
