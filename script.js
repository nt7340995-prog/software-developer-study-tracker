// ========================================
// STUDY TRACKER SETTINGS
// ========================================

const topics = [
    "Python",
    "OOP",
    "DSA",
    "SQL",
    "DBMS",
    "Git & GitHub",
    "HTML",
    "CSS",
    "JavaScript",
    "Django",
    "FastAPI",
    "React.js",
    "NumPy + Pandas",
    "Machine Learning",
    "Generative AI + LLMs",
    "RAG + AI Agents"
];

const TOTAL_DAYS = 40;

const STORAGE_KEY = "myStudyTracker40Days";
const NOTES_KEY = "myStudyTrackerDailyNotes";

let currentTopicIndex = 0;
let currentDay = 1;

let progress = loadProgress();
let notes = loadNotes();


// ========================================
// LOAD SAVED PROGRESS
// ========================================

function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const data = JSON.parse(saved);

            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {
                return data;
            }
        }
    } catch (error) {
        console.error("Error loading progress:", error);
    }

    return {};
}


// Make sure every topic has its own progress

topics.forEach(topic => {
    if (!Array.isArray(progress[topic])) {
        progress[topic] = [];
    }

    progress[topic] = [
        ...new Set(
            progress[topic].filter(day =>
                Number.isInteger(day) &&
                day >= 1 &&
                day <= TOTAL_DAYS
            )
        )
    ];
});


// ========================================
// SAVE PROGRESS
// ========================================

function saveProgress() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(progress)
        );
    } catch (error) {
        alert("Could not save progress. Please check browser storage.");
    }
}


// ========================================
// LOAD SAVED DAILY NOTES
// ========================================

function loadNotes() {
    try {
        const saved = localStorage.getItem(NOTES_KEY);

        if (saved) {
            const data = JSON.parse(saved);

            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {
                return data;
            }
        }
    } catch (error) {
        console.error("Error loading notes:", error);
    }

    return {};
}


// ========================================
// CREATE A UNIQUE KEY FOR EACH DAY
// ========================================

function getNotesKey(topic, day) {
    return `${topic}_Day_${day}`;
}


// ========================================
// SAVE NOTES AUTOMATICALLY
// ========================================

function saveDailyNotes(showMessage = false) {
    const notesPad = document.getElementById("notesPad");

    if (!notesPad) {
        return;
    }

    const topic = topics[currentTopicIndex];
    const key = getNotesKey(topic, currentDay);

    notes[key] = notesPad.value;

    try {
        localStorage.setItem(
            NOTES_KEY,
            JSON.stringify(notes)
        );

        if (showMessage) {
            document.getElementById("notesMessage").textContent =
                `✅ ${topic} Day ${currentDay} notes saved successfully!`;
        }
    } catch (error) {
        document.getElementById("notesMessage").textContent =
            "❌ Could not save notes. Please check browser storage.";
    }
}


// ========================================
// SAVE BUTTON FUNCTION
// ========================================

function saveTopicNotes() {
    saveDailyNotes(true);
}


// ========================================
// GET COMPLETED DAYS
// ========================================

function getCompletedDays(topic) {
    return progress[topic] || [];
}


// ========================================
// CALCULATE TOPIC SCORE
// ========================================

function getTopicScore(topic) {
    return Math.round(
        (getCompletedDays(topic).length / TOTAL_DAYS) * 100
    );
}


// ========================================
// DISPLAY ALL TOPICS
// ========================================

function renderTopics() {
    const topicList = document.getElementById("topicList");

    topicList.innerHTML = "";

    topics.forEach((topic, index) => {
        const completed = getCompletedDays(topic).length;
        const score = getTopicScore(topic);

        const button = document.createElement("button");

        button.className = "topic-button";
        button.type = "button";

        if (index === currentTopicIndex) {
            button.classList.add("active");
        }

        if (completed === TOTAL_DAYS) {
            button.classList.add("completed-topic");
        }

        const title = document.createElement("strong");

        title.textContent =
            `${index + 1}. ${topic}` +
            (completed === TOTAL_DAYS ? " 🏆" : "");

        const details = document.createElement("span");

        details.className = "topic-progress-text";
        details.textContent = `${completed}/40 days • ${score}%`;

        button.appendChild(title);
        button.appendChild(details);

        button.addEventListener("click", () => {
            // Save current notes before switching topics
            saveDailyNotes();

            currentTopicIndex = index;
            currentDay = 1;

            renderAll();
        });

        topicList.appendChild(button);
    });
}


// ========================================
// DISPLAY 40 CLICKABLE DAYS
// ========================================

function renderDays() {
    const topic = topics[currentTopicIndex];
    const completedDays = getCompletedDays(topic);

    const dayGrid = document.getElementById("dayGrid");

    dayGrid.innerHTML = "";

    for (let day = 1; day <= TOTAL_DAYS; day++) {
        const isCompleted = completedDays.includes(day);

        const dayCard = document.createElement("button");

        dayCard.type = "button";
        dayCard.className = "day-card";

        if (isCompleted) {
            dayCard.classList.add("completed");
        }

        if (day === currentDay) {
            dayCard.classList.add("selected-day");
        }

        dayCard.setAttribute(
            "aria-pressed",
            String(isCompleted)
        );

        const dayNumber = document.createElement("span");

        dayNumber.className = "day-number";
        dayNumber.textContent = `Day ${day}`;

        const symbol = document.createElement("span");

        symbol.className = "day-symbol";
        symbol.textContent = isCompleted ? "✅" : "⬜";

        const status = document.createElement("span");

        status.className = "day-status";
        status.textContent = isCompleted
            ? "Completed"
            : "Not Completed";

        dayCard.appendChild(dayNumber);
        dayCard.appendChild(symbol);
        dayCard.appendChild(status);

        // One click selects the day AND toggles completion
        dayCard.addEventListener("click", () => {
            // Save the previous day's notes first
            saveDailyNotes();

            currentDay = day;

            toggleDay(topic, day);
        });

        dayGrid.appendChild(dayCard);
    }
}


// ========================================
// COMPLETE OR UNCOMPLETE A DAY
// ========================================

function toggleDay(topic, day) {
    const completedDays = getCompletedDays(topic);

    const index = completedDays.indexOf(day);

    if (index === -1) {
        completedDays.push(day);
    } else {
        completedDays.splice(index, 1);
    }

    progress[topic] = completedDays;

    saveProgress();

    renderAll();
}


// ========================================
// DISPLAY NOTES FOR THE SELECTED DAY
// ========================================

function renderNotes() {
    const topic = topics[currentTopicIndex];

    const notesTopic = document.getElementById("notesTopic");
    const notesDay = document.getElementById("notesDay");
    const notesPad = document.getElementById("notesPad");
    const notesMessage = document.getElementById("notesMessage");

    if (!notesPad) {
        return;
    }

    const key = getNotesKey(topic, currentDay);

    if (notesTopic) {
        notesTopic.textContent = topic;
    }

    if (notesDay) {
        notesDay.textContent = `Day ${currentDay}`;
    }

    // Load only the notes belonging to this topic and day
    notesPad.value = notes[key] || "";

    if (notesMessage) {
        notesMessage.textContent =
            `📝 Write your ${topic} notes for Day ${currentDay}.`;
    }
}


// ========================================
// UPDATE THE SELECTED TOPIC'S STATISTICS
// ========================================

function updateTopicStats() {
    const topic = topics[currentTopicIndex];

    const completed = getCompletedDays(topic).length;
    const score = getTopicScore(topic);
    const remaining = TOTAL_DAYS - completed;

    document.getElementById("currentTopic").textContent = topic;

    document.getElementById("topicBadge").textContent =
        `Topic ${currentTopicIndex + 1} of ${topics.length}`;

    document.getElementById("topicCompleted").textContent =
        `${completed} / ${TOTAL_DAYS}`;

    document.getElementById("topicScore").textContent =
        `${score}%`;

    document.getElementById("topicRemaining").textContent =
        `${remaining} days`;

    document.getElementById("topicProgressBar").style.width =
        `${score}%`;

    const message = document.getElementById("topicMessage");

    if (completed === TOTAL_DAYS) {
        message.textContent =
            `🎉 Congratulations! You completed all 40 days of ${topic}!`;
    } else if (completed === 0) {
        message.textContent =
            `🌟 Start your ${topic} 40-day challenge today!`;
    } else {
        message.textContent =
            `💪 ${completed} days completed! ${remaining} days remaining.`;
    }

    document.getElementById("previousButton").disabled =
        currentTopicIndex === 0;

    document.getElementById("nextButton").disabled =
        currentTopicIndex === topics.length - 1;

    document.getElementById("navigationCount").textContent =
        `${currentTopicIndex + 1} / ${topics.length}`;
}


// ========================================
// UPDATE OVERALL PROGRESS
// ========================================

function updateOverallStats() {
    let totalCompletedDays = 0;
    let completedTopics = 0;

    topics.forEach(topic => {
        const completed = getCompletedDays(topic).length;

        totalCompletedDays += completed;

        if (completed === TOTAL_DAYS) {
            completedTopics++;
        }
    });

    const totalPossibleDays = topics.length * TOTAL_DAYS;

    const overallScore = Math.round(
        (totalCompletedDays / totalPossibleDays) * 100
    );

    document.getElementById("completedTopics").textContent =
        completedTopics;

    document.getElementById("completedDays").textContent =
        `${totalCompletedDays} / ${totalPossibleDays}`;

    document.getElementById("overallScore").textContent =
        `${overallScore}%`;

    document.getElementById("overallProgressBar").style.width =
        `${overallScore}%`;

    document.getElementById("overallMessage").textContent =
        `🚀 You completed ${totalCompletedDays} out of ${totalPossibleDays} days. Keep going!`;
}


// ========================================
// PREVIOUS AND NEXT TOPIC NAVIGATION
// ========================================

function changeTopic(direction) {
    const newIndex = currentTopicIndex + direction;

    if (newIndex >= 0 && newIndex < topics.length) {
        // Save notes before changing topics
        saveDailyNotes();

        currentTopicIndex = newIndex;
        currentDay = 1;

        renderAll();

        document.querySelector(".tracker-card").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ========================================
// RESET SELECTED TOPIC'S PROGRESS
// ========================================

function resetCurrentTopic() {
    const topic = topics[currentTopicIndex];

    const confirmed = confirm(
        `Reset all 40 days for ${topic}? Your saved notes will remain.`
    );

    if (!confirmed) {
        return;
    }

    progress[topic] = [];

    saveProgress();

    renderAll();
}


// ========================================
// RENDER THE ENTIRE TRACKER
// ========================================

function renderAll() {
    renderTopics();
    renderDays();
    updateTopicStats();
    updateOverallStats();
    renderNotes();
}


// ========================================
// EVENT LISTENERS
// ========================================

// Save Notes button
document.getElementById("saveNotesButton").addEventListener(
    "click",
    saveTopicNotes
);

// Autosave notes whenever you type
document.getElementById("notesPad").addEventListener(
    "input",
    () => {
        saveDailyNotes();
    }
);

// Previous topic button
document.getElementById("previousButton").addEventListener(
    "click",
    () => changeTopic(-1)
);

// Next topic button
document.getElementById("nextButton").addEventListener(
    "click",
    () => changeTopic(1)
);

// Reset button
document.getElementById("resetButton").addEventListener(
    "click",
    resetCurrentTopic
);


// ========================================
// START THE STUDY TRACKER
// ========================================

renderAll();