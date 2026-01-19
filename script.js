const content2 = document.getElementById("content2");
const content = document.getElementById("content");

const guide = document.getElementById("guide");
const guideContent = document.querySelector(".guide");

const exit = document.getElementById("exit");

guide.addEventListener("click", (e) => {
  e.stopPropagation();
  console.log("game menu open");
  initAudioContext();
  guideContent.style.display = guideContent.style.display = "none"
    ? "block"
    : "none";
  guideContent.classList.remove("hidden");
  guideContent.scrollTop = 0;
});

document.addEventListener("click", (e) => {
  if (!guideContent.contains(e.target) && e.target !== guide) {
    console.log("b");
    guideContent.classList.add("hidden");
  }
});

exit.addEventListener("click", () => {
  console.log("exited");
  guideContent.classList.add("hidden");
});

const audio = document.getElementById("poemAudio");
let timeoutId;

let audioCtx;
let gainNode;
let sourceNode;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioCtx.createMediaElementSource(audio);
    gainNode = audioCtx.createGain();

    sourceNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return gainNode;
}

function playSegment(startTime, endTime) {
  const gain = initAudioContext();
  if (gain) {
    gain.gain.value = Math.min(volumeSlider.value, 3);
  }

  // Check if the audio element exists
  if (!audio) {
    console.error("Audio element not found.");
    return;
  }

  // Check if audio is loaded and ready to play
  if (audio.readyState < 3) {
    // HAVE_FUTURE_DATA
    console.error("Audio is not ready to play.");
    return;
  }

  // Check if startTime and endTime are valid
  if (startTime < 0 || endTime <= startTime || endTime > audio.duration) {
    console.error("Invalid start or end time.");
    return;
  }

  // Check if the audio is already playing
  if (!audio.paused) {
    console.warn("Audio is already playing.");
    return;
  }

  // Set the current time and play the audio
  audio.currentTime = startTime;

  // Play the audio and handle playback errors
  audio.play().catch((error) => {
    console.error("Error playing audio:", error);
  });

  // Stop the audio after the segment ends
  timeoutId = setTimeout(
    () => {
      audio.pause();
    },
    (endTime - startTime) * 1000,
  );
}

audio.addEventListener("pause", () => clearTimeout(timeoutId));
audio.addEventListener("ended", () => clearTimeout(timeoutId));

document.addEventListener("DOMContentLoaded", () => {
  const game = document.getElementById("lueckenSpiel");
  const restart = document.getElementById("restartGame");
  const submit = document.getElementById("submit");
  const correctCounter = document.getElementById("correctCount");
  const wrongCounter = document.getElementById("wrongCount");
  const note = document.getElementById("grade");
  const results = document.querySelector(".results");
  const difficultySelect = document.getElementById("difficulty");
  const stropheSelect = document.getElementById("stropheSelect");
  const volumeSlider = document.getElementById("volumeSlider");

  function updateVolumeDisplay(value) {
    volumeValue.textContent = `${Math.round(value * 100)}%`;
  }

  // load saved volume
  const savedVolume = localStorage.getItem("poemVolumeBoost");
  const startVolume = savedVolume !== null ? parseFloat(savedVolume) : 1;

  volumeSlider.value = startVolume;
  updateVolumeDisplay(startVolume);

  volumeSlider.addEventListener("input", () => {
    const gain = initAudioContext();
    if (!gain) return;

    const value = parseFloat(volumeSlider.value);
    gain.gain.value = Math.min(value, 3);

    updateVolumeDisplay(value);
    localStorage.setItem("poemVolumeBoost", value);
  });

  //const goethe = document.querySelector(".goethe");

  const originalContent = {}; // store the original tags
  let currentContainer = null; // keep track

  // bring back prime göttinge
  function storeOriginalContent() {
    //const abteilung = [".content", ".content2", ".content3", ".content4", ".content5"];

    let abteilung = [];

    const selectedStrophe = stropheSelect.value;

    const stropheMap = {
      1: ".container .content",
      2: ".container .content2",
      3: ".container .content3",
      4: ".container .content4",
    };

    if (selectedStrophe === "all") {
      abteilung = Object.values(stropheMap);
    } else {
      abteilung = [stropheMap[selectedStrophe]];
    }

    abteilung.forEach((section) => {
      const paragraphs = document.querySelectorAll(`${section} p`);

      if (!originalContent[section]) {
        originalContent[section] = Array.from(paragraphs).map(
          (p) => p.outerHTML,
        );
      }
    });
  }

  game.addEventListener("click", () => {
    console.log("game activated");
    game.disabled = true;
    storeOriginalContent();

    guideContent.style.display = "none";
    submit.style.display = "block";
    const container1 = document.querySelector(".container");
    if (container1 && container1.contains(game)) {
      currentContainer = ".container";
    }

    /*const verse = [
            ...document.querySelectorAll(".content p"),
            ...document.querySelectorAll(".content2 p"),
            ...document.querySelectorAll(".content3 p"),
            ...document.querySelectorAll(".content4 p"),
            ...document.querySelectorAll(".content5 p")
        ];*/

    //const abteilung = [".content", ".content2", ".content3", ".content4", ".content5"];
    let abteilung = [];

    const selectedStrophe = stropheSelect.value;

    const stropheMap = {
      1: ".container .content",
      2: ".container .content2",
      3: ".container .content3",
      4: ".container .content4",
    };

    if (selectedStrophe === "all") {
      abteilung = Object.values(stropheMap);
    } else {
      abteilung = [stropheMap[selectedStrophe]];
    }

    abteilung.forEach((teilung) => {
      const verse = document.querySelectorAll(`${teilung} p`);

      if (verse.length < 2) {
        console.error("Not enough paragraphs to remove in", teilung);
        return;
      }

      const difficulty = difficultySelect.value;

      let removeCount = 2; // default

      if (difficulty === "easy") removeCount = 1;
      if (difficulty === "hard") removeCount = 3;
      if (difficulty === "extreme") removeCount = verse.length;

      removeCount = Math.min(removeCount, verse.length);

      const randomVerses = [];

      while (randomVerses.length < removeCount) {
        const randomVerse = Math.floor(Math.random() * verse.length);
        if (!randomVerses.includes(randomVerse)) {
          randomVerses.push(randomVerse);
        }
      }

      randomVerses.forEach((index) => {
        const p = verse[index];
        const originalText = p.innerText;
        const textField = document.createElement("input");
        const onclickAttr = p.getAttribute("onclick");
        const timeMatches = onclickAttr.match(
          /playSegment\(([^,]+), ([^)]+)\)/,
        );

        let startTime = 0;
        let endTime = 0;

        if (timeMatches) {
          startTime = parseFloat(timeMatches[1]);
          endTime = parseFloat(timeMatches[2]);
          console.log(
            `Extracted times for index ${index}: startTime=${startTime}, endTime=${endTime}`,
          );
        } else {
          console.warn(
            `No matching times found for index ${index} in onclick: ${onclickAttr}`,
          );
        }

        textField.type = "text";
        textField.dataset.originalText = originalText;
        textField.dataset.filled = "false";
        textField.dataset.startTime = startTime;
        textField.dataset.endTime = endTime;
        textField.style.marginBottom = "21px";

        //update filled status
        textField.addEventListener("input", () => {
          textField.dataset.filled =
            textField.value.trim() !== "" ? "true" : "false";
        });

        p.replaceWith(textField);
      });
    });
  });

  restart.addEventListener("click", () => {
    console.log("game restarted");

    const abteilung = [
      ".container .content",
      ".container .content2",
      ".container .content3",
      ".container .content4",
    ];

    abteilung.forEach((section) => {
      const container = document.querySelector(section);

      if (originalContent[section]) {
        container.innerHTML = originalContent[section].join("");
      }
    });

    // reset buttons
    game.disabled = false;
    submit.disabled = false;

    // reset results
    correctCounter.textContent = "Richtig: 0";
    wrongCounter.textContent = "Falsch: 0";
    note.textContent = "Note: -";
    results.style.display = "none";
  });

  submit.addEventListener("click", () => {
    console.log("answers submitted");

    results.style.display = "block";

    const textFields = document.querySelectorAll('input[type="text"]');

    const emptyFields = Array.from(textFields).filter(
      (textField) => textField.dataset.filled === "false",
    );

    if (emptyFields.length > 0) {
      alert("fill befor submitting.");
      results.style.display = "none";
      return;
    }

    submit.disabled = true;

    let correctCount = 0;
    let wrongCount = 0;

    const normalizeText = (text) => {
      return text
        .toLowerCase()
        .replace(/[.,'!?]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const isPartialMatch = (userInput, originalText) => {
      const userWords = userInput.split(" ");
      const originalWords = originalText.split(" ");
      let matchCount = 0;

      // Compare word by word
      userWords.forEach((word) => {
        if (originalWords.includes(word)) {
          matchCount++;
        }
      });

      const wordsMatch = matchCount > 0 && matchCount < originalWords.length;

      return wordsMatch;
    };

    textFields.forEach((textField) => {
      const userInput = normalizeText(textField.value.trim());
      const originalText = normalizeText(textField.dataset.originalText.trim());

      if (userInput === originalText) {
        textField.style.color = "green"; // correct as green
        correctCount++;
      } else if (isPartialMatch(userInput, originalText)) {
        textField.style.color = "#bdbd0b"; // half correct answers as yellow
        wrongCount += 0.5;
        correctCount += 0.5;
      } else {
        textField.style.color = "red"; // incorrect answers as red
        wrongCount++;
      }
    });

    correctCounter.textContent = `Richtig: ${correctCount}`;
    wrongCounter.textContent = `Falsch: ${wrongCount}`;

    const totalQuestions = textFields.length;
    const percentage = (correctCount / totalQuestions) * 100;

    let grade = "6";

    if (percentage === 100) {
      grade = "1";
    } else if (percentage >= 87.5) {
      grade = "2";
    } else if (percentage >= 75) {
      grade = "3";
    } else if (percentage >= 62.5) {
      grade = "4";
    } else if (percentage >= 50) {
      grade = "5";
    }

    note.textContent = `Note: ${grade}`;
    console.log(`Richtig: ${correctCount}`);
    console.log(`Falsch: ${wrongCount}`);
    console.log(`Note: ${grade}`);
    game.disabled = false;
  });
});
