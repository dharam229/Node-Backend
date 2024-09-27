const AnswerOptions = [
  { name: "Video Only", id: 1 },
  { name: "Text Only", id: 2 },
  { name: "Image Only", id: 3 },
  { name: "Polling", id: 4 },
];
const ticketStatus = [
  { name: "New", id: 1 },
  { name: "Resolved", id: 2 },
];
const issueType = [
  { name: "Account deactivate related", id: 1 },
  { name: "Subscription payment related", id: 2 },
];
const adminRoles = [
  { name: "Super Admin", id: 1 },
  { name: "User", id: 2 },
  { name: "Finance Manager", id: 3 },
  { name: "Admin", id: 4 },
  { name: "Backend Staff", id: 5 },
  { name: "Customer Support", id: 6 },
];
const CurrencyOptions = [
  { name: "dollar", icon: "$", id: 1 },
  { name: "Euro", icon: "€", id: 2 },
  { name: "Pounds sterling", icon: "£", id: 3 },
];
module.exports = {
  AnswerOptions,
  ticketStatus,
  issueType,
  adminRoles,
  CurrencyOptions,
};
