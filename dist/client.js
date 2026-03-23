"use strict";
const ws = new WebSocket("ws://localhost:8080");
let currentRoom = "";
const loginContainer = document.getElementById("loginContainer");
const chatFullContainer = document.getElementById("chatFullContainer");
const roomScreen = document.getElementById("roomScreen");
const chatScreen = document.getElementById("chatScreen");
const chatBox = document.getElementById("chatBox");
const roomTitle = document.getElementById("roomTitle");
const createInput = document.getElementById("createRoomInput");
const joinInput = document.getElementById("joinRoomInput");
const messageInput = document.getElementById("messageInput");
// CREATE ROOM
function createRoom() {
    const room = createInput.value.trim();
    if (!room) {
        alert("Enter room name");
        return false;
    }
    joinRoomCommon(room);
    return false;
}
// JOIN ROOM
function joinRoom() {
    const room = joinInput.value.trim();
    if (!room) {
        alert("Enter room name");
        return false;
    }
    joinRoomCommon(room);
    return false;
}
// JOIN GLOBAL ROOM
function joinGlobalRoom() {
    joinRoomCommon("GLOBAL");
    return false;
}
function joinRoomCommon(room) {
    currentRoom = room;
    ws.send(JSON.stringify({ type: "join", room }));
    // Hide login, show chat full
    loginContainer.classList.add("hidden");
    loginContainer.style.display = "none";
    chatFullContainer.classList.remove("hidden");
    chatFullContainer.style.display = "flex";
    chatScreen.classList.remove("hidden");
    chatScreen.style.display = "flex";
    roomTitle.innerText = room === "GLOBAL" ? "Room: GLOBAL (Public, max 100 users)" : "Room: " + currentRoom;
    chatBox.innerHTML = "";
}
//  SEND MESSAGE
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message)
        return;
    ws.send(JSON.stringify({
        type: "chat",
        message
    }));
    addMessage(message, "me");
    messageInput.value = "";
}
//  RECEIVE
ws.onopen = () => {
    console.log("Connected to server");
    // Show login/room UI by default
    loginContainer.classList.remove("hidden");
    loginContainer.style.display = "flex";
    chatFullContainer.classList.add("hidden");
    chatFullContainer.style.display = "none";
    roomScreen.classList.remove("hidden");
    roomScreen.style.display = "block";
    chatScreen.classList.add("hidden");
    chatScreen.style.display = "none";
};
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "joined") {
        // Optionally, data.count = number of users in room (if server sends it)
        if (typeof data.count === "number" && data.count > 100) {
            alert("Room is full (max 100 users). Please try another room.");
            // Go back to login/room UI
            chatFullContainer.classList.add("hidden");
            chatFullContainer.style.display = "none";
            loginContainer.classList.remove("hidden");
            loginContainer.style.display = "flex";
            roomScreen.classList.remove("hidden");
            roomScreen.style.display = "block";
            chatScreen.classList.add("hidden");
            chatScreen.style.display = "none";
            return;
        }
        chatFullContainer.classList.remove("hidden");
        chatFullContainer.style.display = "flex";
        chatScreen.classList.remove("hidden");
        chatScreen.style.display = "flex";
        roomTitle.innerText = currentRoom === "GLOBAL" ? "Room: GLOBAL (Public, max 100 users)" : "Room: " + currentRoom;
    }
    if (data.type === "chat") {
        addMessage(data.message, "other");
    }
    if (data.type === "error") {
        alert(data.message);
    }
};
//  ADD MESSAGE UI
function addMessage(msg, type) {
    const div = document.createElement("div");
    div.classList.add("msg", type);
    div.innerText = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}
// expose to HTML
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.joinGlobalRoom = joinGlobalRoom;
window.sendMessage = sendMessage;
// Logout returns to login/room UI
window.logout = function logout() {
    localStorage.removeItem('jwt');
    // Hide chat, show login
    chatFullContainer.classList.add("hidden");
    chatFullContainer.style.display = "none";
    loginContainer.classList.remove("hidden");
    loginContainer.style.display = "flex";
    roomScreen.classList.remove("hidden");
    roomScreen.style.display = "block";
    chatScreen.classList.add("hidden");
    chatScreen.style.display = "none";
    // Optionally clear chat
    chatBox.innerHTML = "";
};
