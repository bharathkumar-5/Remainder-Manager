const reminders = [];
let reminderIdCounter = 0;
const reminderForm = document.getElementById('reminderForm');
const reminderTextInput = document.getElementById('reminderText');
const reminderDateInput = document.getElementById('reminderDate');
const reminderTimeInput = document.getElementById('reminderTime');
const reminderList = document.getElementById('reminderList');
function addReminder(text, dateStr, timeStr) {
    const id = reminderIdCounter++;
    const now = new Date();
    const triggerTime = parseDateTime(dateStr, timeStr);
    if (triggerTime <= now) {
        triggerTime.setDate(triggerTime.getDate() + 1);
    }

    const timeoutDuration = triggerTime - now;
    const reminder = {
        id,
        text,
        triggerTime,
        timeout: setTimeout(() => {
            alert(`Reminder: ${text}`);
            removeReminder(id);
        }, timeoutDuration),
        interval: setInterval(updateReminderList, 1000) 
    };

    reminders.push(reminder);
    saveReminders();
    updateReminderList();
}
function parseDateTime(dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier) {
        if (modifier.toUpperCase() === 'PM' && hours < 12) {
            hours += 12;
        } else if (modifier.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }
    } else if (hours === 12) {
        hours = 0;
    } else if (hours < 12) {
        hours += 12; 
    }

    return new Date(year, month - 1, day, hours, minutes);
}
function removeReminder(id) {
    const index = reminders.findIndex(r => r.id === id);
    if (index !== -1) {
        clearTimeout(reminders[index].timeout);
        clearInterval(reminders[index].interval);
        reminders.splice(index, 1);
        saveReminders();
        updateReminderList();
    }
}
function updateReminderList() {
    reminderList.innerHTML = '';
    const now = new Date();
    reminders.forEach(reminder => {
        const timeLeft = calculateTimeLeft(reminder.triggerTime, now);
        const li = document.createElement('li');
        li.textContent = `${reminder.text} - ${formatDate(reminder.triggerTime)} ${formatTime(reminder.triggerTime)} (${timeLeft})`;

        if (reminder.triggerTime <= now) {
            li.classList.add('expired');
        }
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit';
        editButton.onclick = () => editReminder(reminder.id);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete';
        deleteButton.onclick = () => removeReminder(reminder.id);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        reminderList.appendChild(li);
    });
}
function calculateTimeLeft(triggerTime, now) {
    const diff = triggerTime - now;
    if (diff <= 0) return 'Expired';

    const minutesLeft = Math.floor(diff / (1000 * 60));
    const days = Math.floor(minutesLeft / 1440);
    const hours = Math.floor((minutesLeft % 1440) / 60);
    const minutes = minutesLeft % 60;

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} left`;
    } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} left`;
    } else {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
    }
}
function handleFormSubmit(event) {
    event.preventDefault();
    const text = reminderTextInput.value.trim();
    const dateStr = reminderDateInput.value.trim();
    const timeStr = reminderTimeInput.value.trim();

    if (text && dateStr && timeStr) {
        addReminder(text, dateStr, timeStr);
        reminderTextInput.value = '';
        reminderDateInput.value = '';
        reminderTimeInput.value = '';
    } else {
        alert('Please enter valid reminder text, date, and time.');
    }
}
function editReminder(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminderTextInput.value = reminder.text;
        reminderDateInput.value = formatDate(reminder.triggerTime);
        reminderTimeInput.value = formatTime(reminder.triggerTime, true);
        removeReminder(id);
    }
}
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function formatTime(date, includeSeconds = false) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const modifier = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12; 
    return `${hours}:${minutes.toString().padStart(2, '0')} ${modifier}${includeSeconds ? `:${seconds.toString().padStart(2, '0')}` : ''}`;
}
function saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(reminders.map(r => ({
        id: r.id,
        text: r.text,
        triggerTime: r.triggerTime.toISOString()
    }))));
}
function loadReminders() {
    const storedReminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminderIdCounter = storedReminders.length > 0 ? Math.max(...storedReminders.map(r => r.id)) + 1 : 0;

    storedReminders.forEach(r => {
        const reminder = {
            id: r.id,
            text: r.text,
            triggerTime: new Date(r.triggerTime),
            timeout: null,
            interval: null
        };

        const now = new Date();
        const timeoutDuration = reminder.triggerTime - now;

        reminder.timeout = setTimeout(() => {
            alert(`Reminder: ${reminder.text}`);
            removeReminder(reminder.id);
        }, timeoutDuration);

        reminder.interval = setInterval(updateReminderList, 1000); 

        reminders.push(reminder);
    });
}
reminderForm.addEventListener('submit', handleFormSubmit);
loadReminders();
updateReminderList();
