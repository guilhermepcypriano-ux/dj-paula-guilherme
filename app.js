/ DJ PAULA & GUILHERME
// Playlist permanente no navegador - sem Firebase

let queue = [];
let playlist = JSON.parse(localStorage.getItem("djPlaylist") || "[]");
let player = null;
let playerReady = false;
let currentIndex = 0;

const $ = id => document.getElementById(id);

function savePlaylist() {
  localStorage.setItem("djPlaylist", JSON.stringify(playlist));
}

function videoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const videoPath =
    u.pathname.split("/embed/")[1];
  return videoPath ?
    videoPath.split("/")[0] ; null;
  }
}

function renderPlaylist() {
  let area = $("playlistManager");

  if (!area) {
    area = document.createElement("div");
    area.id = "playlistManager";
    area.className = "panel";
    $("adminArea")?.appendChild(area);
  }

  area.innerHTML = `
    <h3>🎵 Playlist do DJ</h3>
    <input id="newMusicTitle" placeholder="Nome da música">
    <input id="newMusicUrl" placeholder="Link do YouTube">
    <button id="addMusic">Adicionar música</button>
    <div id="savedMusic"></div>
  `;

  $("addMusic").onclick = () => {
    const title = $("newMusicTitle").value.trim();
    const url = $("newMusicUrl").value.trim();

    if (!title || !videoId(url)) {
      alert("Informe o nome e um link válido do YouTube.");
      return;
    }

    playlist.push({ title, url });
    savePlaylist();
    renderPlaylist();
  };

  const list = $("savedMusic");

  playlist.forEach((music, index) => {
    const row = document.createElement("div");
    row.style.padding = "10px";

    const name = document.createElement("span");
    name.textContent = music.title + " ";

    const play = document.createElement("button");
    play.textContent = "▶";
    play.onclick = () => playMusic(index);

    const remove = document.createElement("button");
    remove.textContent = "Excluir";
    remove.onclick = () => {
      playlist.splice(index, 1);
      savePlaylist();
      renderPlaylist();
    };

    row.append(name, play, remove);
    list.appendChild(row);
  });
}

function playMusic(index) {
  if (!playlist.length) return;

  currentIndex = (index + playlist.length) % playlist.length;

  const music = playlist[currentIndex];

  $("currentTitle").textContent = music.title;
  $("currentArtist").textContent = "Playlist do DJ";

  if (playerReady) {
    player.loadVideoById(videoId(music.url));
    $("playerStatus").textContent = "Reproduzindo";
  }
}

function renderQueue() {
  const box = $("queueList");
  if (!box) return;

  box.innerHTML = "";

  queue.forEach((music, index) => {
    const row = document.createElement("div");
    row.textContent = music.title + " - " + music.name;
    box.appendChild(row);
  });

  if ($("queueCount")) {
    $("queueCount").textContent = queue.length;
  }
}

// Pedidos de músicas
$("requestForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("guestName")?.value.trim();
  const title = $("songName")?.value.trim();
  const url = $("youtubeUrl")?.value.trim();

  if (!name || !title || !videoId(url)) {
    alert("Preencha os campos e informe um link válido.");
    return;
  }

  queue.push({ name, title, url });

  renderQueue();
  event.target.reset();

  alert("Pedido adicionado à fila! 🎵");
});

// Controles
$("nextBtn")?.addEventListener("click", () => {
  if (queue.length) {
    const music = queue.shift();
    renderQueue();

    $("currentTitle").textContent = music.title;
    $("currentArtist").textContent = "Pedido de " + music.name;

    if (playerReady) player.loadVideoById(videoId(music.url));
  } else {
    playMusic(currentIndex + 1);
  }
});

$("prevBtn")?.addEventListener("click", () => {
  playMusic(currentIndex - 1);
});

$("playBtn")?.addEventListener("click", () => {
    if (!playerReady) return;

    const state = player.getPlayerState();

    if (state === 1) {
        player.pauseVideo();
    } else if (state === 2) {
        player.playVideo();
    } else {
        if (playlist.length > 0) {
            playMusic(0)
             } else {
           $("playerStatus").textContent = "Adicione uma música à playlist" ;
        }
    }

// Painel administrativo
$("adminToggle")?.addEventListener("click", () => {
  $("adminArea").hidden = !$("adminArea").hidden;
  renderPlaylist();
});

// Player YouTube
window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player("youtubePlayer", {
    height: "200",
    width: "200",
    videoId: "",
    playerVars: {
      playsinline: 1,
      rel: 0
    },
    events: {
      onReady: () => {
        playerReady = true;

        $("playerStatus").textContent =
          "Player pronto";
      },
      onStateChange: event => {
        if (event.data === YT.PlayerState.ENDED) {
          if (queue.length) {
            $("nextBtn").click();
          } else {
            playMusic(currentIndex + 1);
          }
        }
      }
    }
  });
};

renderQueue();
