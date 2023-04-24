const fs = require('fs/promises');
const path = require('path');
const { nanoid } = require('nanoid');

const contactsPath = path.join(__dirname, 'contacts.json');
console.log(contactsPath)

// Read all contacts
const listContacts = async () => {
  console.log("test")
  try {
    const data = await fs.readFile(contactsPath, 'utf8');
    const parsedData = JSON.parse(data);
    return parsedData;
  }
  catch (e) {
    console.error(e);
  }
}
// Read contact by id
const getContactById = async (contactId) => {
  try {
    const data = await listContacts();
    const contactById = data.find(contact => contact.id === contactId);
    return contactById;
  }
  catch (e) {
    console.error(e);
  }
}
// Remove contact by id
const removeContact = async (contactId) => {
  try {
    const data = await listContacts();
    const filterData = data.filter(contact => contact.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(filterData, null, 2), "utf8");
    return filterData;
  }
  catch (e) {
    console.error(e);
  }
}

// Add contact
const addContact = async (body) => {
  const { name, email, phone } = body;
  try {
    const data = await listContacts();
    const newContact = {
      id: nanoid(), name, email, phone
    };
    data.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(data, null, 2), "utf8");
    return newContact;
  }
  catch (e) {
    console.error(e);
  }
}


// UpdateContact
const updateContact = async (id, body) => {
  try {
    const data = await listContacts();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }
    const updatedContact = { ...data[index], ...body }
    data[index] = updatedContact;
    await fs.writeFile(contactsPath, JSON.stringify(data, null, 2));
    return data[index];
  }
  catch (e) {
    console.error(e);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
