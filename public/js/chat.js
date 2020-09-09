const socket = io();
const $messageForm = document.getElementById("message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.getElementById("messages");
const $locationMsg = document.getElementById("send-location-msg");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const LocationTemp = document.getElementById("Send-location-tempelate")
  .innerHTML;
const sidebartemplates = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height o f the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  // Visible height
  const VisibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have i scrolled
  const scrollOffset = $messages.scrollTop + VisibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};
socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAT: moment(message.createdAT).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("LocationMessage", (url) => {
  const html = Mustache.render(LocationTemp, {
    username: url.username,
    url: url.url,
    createdAT: moment(url.createdAT).format("h:mm a"),
  });
  $locationMsg.insertAdjacentHTML("beforeend", html);
  autoScroll();
});
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebartemplates, {
    room,
    users,
  });
  document.getElementById("side-bar").innerHTML = html;
});

const btn = document.getElementById("submit");
const input = document.getElementById("send");

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // disable
  $messageFormButton.setAttribute("disabled", "disabled");
  let inputVal = input.value;
  socket.emit("sendInputMsg", inputVal, (error) => {
    // enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered!");
  });
});
// const video = document.createElement("video");

const sendLocation = document.getElementById("send-location");

sendLocation.addEventListener("click", () => {
  console.log("The event listener is working");
  sendLocation.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "SendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        sendLocation.removeAttribute("disabled");
        console.log("Location Shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

// navigator.mediaDevices.getUserMedia(
//   {
//     audio: true,
//     video: true,
//   },
//   (stream) => {
//     const video = document.querySelector("video");
//     video.srcObject = stream;

//     video.onloadedmetadata = (e) => {
//       video.play();
//     };
//   }
// );

// if (navigator.doNotTrack) {
//   console.log("1");
// } else {
//   console.log("null");
// }
