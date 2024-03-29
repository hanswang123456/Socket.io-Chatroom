const socket = io("/"); // Create our socket
const videoGrid = document.getElementById("video-grid"); // Find the Video-Grid element

const myPeer = new Peer(); // Creating a peer element which represents the current user
const myVideo = document.createElement("video"); // Create a new video tag to show our video
myVideo.muted = true; // Mute ourselves on our end so there is no feedback loop

// Access the user's video and audio
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    document.getElementById("stopVideo").addEventListener(
      "click",
      (e) => {
        stream.getVideoTracks()[0].enabled =
          !stream.getVideoTracks()[0].enabled;

        if (stream.getVideoTracks()[0].enabled == false) {
          document.getElementsByClassName("nameTag")[0].className = "nameBox";
        } else {
          document.getElementsByClassName("nameBox")[0].className = "nameTag";
        }
      },
      false
    );

    document.getElementById("muteButton").addEventListener(
      "click",
      (e) => {
        stream.getAudioTracks()[0].enabled =
          !stream.getAudioTracks()[0].enabled;
      },
      false
    );
    let displayName = prompt("Enter Your Name", "Unkown");
    addVideoStream(myVideo, stream, "Me"); // Display our video to ourselves

    myPeer.on("call", (call) => {
      // When we join someone's room we will receive a call from them
      call.answer(stream); // Stream them our video/audio
      const video = document.createElement("video"); // Create a video tag for them
      call.on("stream", (userVideoStream) => {
        // When we recieve their stream
        addVideoStream(video, userVideoStream, displayName); // Display their video to ourselves
      });
    });

    socket.on("user-connected", (userId) => {
      // If a new user connect
      connectToNewUser(userId, stream);
    });
  });

myPeer.on("open", (id) => {
  // When we first open the app, have us join a room
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  // This runs when someone joins our room
  const call = myPeer.call(userId, stream); // Call the user who just joined
  // Add their video
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, "Participant");
  });

  // If they leave, remove their video
  socket.on("user-disconnected", () => {
    video.remove();
    video.parentElement.remove();
  });
}

function addVideoStream(video, stream, userId) {
  video.srcObject = stream;
  let container = document.createElement("div");
  container.style.position = "relative";
  let nameTag = document.createElement("div");
  nameTag.className = "nameTag";
  nameTag.innerHTML = userId;
  container.append(video);
  container.append(nameTag);
  video.addEventListener("loadedmetadata", () => {
    // Play the video as it loads
    video.play();
  });
  videoGrid.append(container); // Append video element to videoGrid
}

peer.on("call", (call) => {
  // Here client 2 is answering the call
  // and sending back their stream
  call.answer(stream);
  const vid = document.createElement("video");

  // This event append the user stream.
  call.on("stream", (userStream) => {
    addVideo(vid, userStream);
  });
  call.on("error", (err) => {
    alert(err);
  });
});

var chatField = document.getElementById("send");
var input = document.getElementById("chat_message");
const messages = document.getElementById("main__chat_window");
//chat feature
//when user clicks send button, the client sends message to server
chatField.addEventListener("click", function (e) {
  e.preventDefault();
  //if client has message in the input field
  if (input.value) {
    alert("asdf");
    socket.emit("message", {
      message: input.value,
      room: window.sessionStorage.getItem("broadcast"),
      user: window.sessionStorage.getItem("user"),
      time: new Date().getHours() + ":" + new Date().getMinutes(),
    });
    input.value = "";
  }
});

//recieves chat messages from server
socket.on("message", ({ message, user, time }) => {
  //style time so that minutes like :04 has 0
  var styledTime = time.split(":");
  if (styledTime[1].length == 1) {
    styledTime[1] = "0" + styledTime[1];
    styledTime = styledTime[0] + ":" + styledTime[1];
  } else {
    styledTime = time;
  }

  //create a table that houses each output
  var messageBox = document.createElement("table");
  messageBox.className = "message";

  //1st row of table is the user info and the
  var generalInfo = document.createElement("tr");
  generalInfo.className = "generalInfo";
  //check who sends it
  if (user == window.sessionStorage.getItem("user")) {
    generalInfo.innerHTML =
      "<td>" + "You" + "</td>" + "<td>" + styledTime + "</td>";
    messageBox.style.float = "right";
  } else {
    messageBox.style.float = "left";
    generalInfo.innerHTML =
      "<td>" + user + "</td>" + "<td>" + styledTime + "</td>";
  }

  var text = document.createElement("tr");
  text.className = "messageArea";
  text.innerText = message;

  messageBox.appendChild(generalInfo);
  messageBox.appendChild(text);

  messages.appendChild(messageBox);
  //autoscroll
  messages.scrollTo(0, messages.scrollHeight);
});
