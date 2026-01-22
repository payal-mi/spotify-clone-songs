console.log("Spotify Clone Ready");

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = 0;
let lastVolume = 0.5;

function cleanName(name) {
    return name.replace(".mp3", "").replaceAll("_", " ");
}

function secondsToMinutesSeconds(sec) {
    if (!sec || isNaN(sec)) return "00:00";
    let m = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ✅ SONGS JSON SE LOAD HONGE
async function getsongs(folder) {
    currFolder = "songs/" + folder;
    let res = await fetch(`${currFolder}/songs.json`);
    return await res.json();
}

function playMusic(track, pause = false) {
    currentIndex = songs.indexOf(track);
    currentSong.src = `${currFolder}/${track}`;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = cleanName(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    document.querySelectorAll(".songlist li").forEach(li =>
        li.classList.remove("active")
    );

    let active = document.querySelector(`[data-track="${track}"]`);
    if (active) active.classList.add("active");
}

function renderSongs() {
    let ul = document.querySelector(".songlist ul");
    ul.innerHTML = "";

    songs.forEach(song => {
        ul.innerHTML += `
        <li data-track="${song}">
            <div class="info">
                <span>${cleanName(song)}</span>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="img/play.svg" class="invert">
            </div>
        </li>`;
    });
}

// ✅ ALBUMS JSON (OPTIONAL BUT SAFE)
async function displayAlbums() {
    let res = await fetch("songs/albums.json");
    let albums = await res.json();
    let cardContainer = document.querySelector(".cardContainer");

    for (let folder of albums) {
        let info = { title: folder, description: "" };
        try {
            info = await (await fetch(`songs/${folder}/info.json`)).json();
        } catch {}

        cardContainer.innerHTML += `
        <div class="card" data-folder="${folder}">
            <div class="play">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                </svg>
            </div>
            <img src="songs/${folder}/cover.jpg"
                 onerror="this.src='songs/defaultcover.jpg'">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        </div>`;
    }
}

async function main() {
    await displayAlbums();

    songs = await getsongs("cs"); // default album
    renderSongs();
    playMusic(songs[0], true);

    play.onclick = () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    };

    next.onclick = () => {
        currentIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[currentIndex]);
    };

    previous.onclick = () => {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[currentIndex]);
    };

    currentSong.ontimeupdate = () => {
        if (!currentSong.duration) return;
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    };

    document.querySelector(".seekbar").onclick = e => {
        currentSong.currentTime =
            (e.offsetX / e.target.clientWidth) * currentSong.duration;
    };

    document.querySelector(".range input").oninput = e => {
        currentSong.volume = e.target.value / 100;
        document.querySelector(".volume img").src =
            currentSong.volume === 0 ? "img/mute.svg" : "img/volume.svg";
    };

    document.querySelector(".volume img").onclick = e => {
        if (currentSong.volume > 0) {
            lastVolume = currentSong.volume;
            currentSong.volume = 0;
            e.target.src = "img/mute.svg";
        } else {
            currentSong.volume = lastVolume;
            e.target.src = "img/volume.svg";
        }
        document.querySelector(".range input").value = currentSong.volume * 100;
    };

    document.querySelector(".songlist").onclick = e => {
        let li = e.target.closest("li");
        if (li) playMusic(li.dataset.track);
    };

    document.querySelector(".cardContainer").onclick = async e => {
        let card = e.target.closest(".card");
        if (!card) return;

        songs = await getsongs(card.dataset.folder);
        renderSongs();
        playMusic(songs[0]);
    };

    currentSong.onended = () => next.click();

    document.querySelector(".hamburger").onclick =
        () => document.querySelector(".left").style.left = "0";

    document.querySelector(".close").onclick =
        () => document.querySelector(".left").style.left = "-120%";
}

main();
