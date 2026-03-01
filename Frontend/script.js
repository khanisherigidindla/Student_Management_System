const API = "http://localhost:8080/students";

let deleteId = null;
let updateData = null;

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupEventListeners();
    loadStudents();
});

/*  NAVIGATION  */
function setupNavigation() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
        if (btn.id === "logoutBtn") return;
        
        btn.addEventListener("click", () => {
            document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(btn.dataset.view).classList.add("active");
        });
    });
}

/*  EVENT LISTENER*/
function setupEventListeners() {
    // Add student form
    document.getElementById("addForm").addEventListener("submit", handleAddStudent);
    
    // Update form
    document.getElementById("updateForm").addEventListener("submit", handleUpdateSubmit);
    
    // Delete modal
    document.getElementById("confirmDelete").addEventListener("click", handleDeleteConfirm);
    document.getElementById("cancelDelete").addEventListener("click", closeDeleteModal);
    
    // Update confirmation modal
    document.getElementById("confirmUpdateBtn").addEventListener("click", confirmUpdate);
    document.getElementById("cancelUpdateBtn").addEventListener("click", closeUpdateConfirmModal);
    
    // Logout
    document.getElementById("logoutBtn").addEventListener("click", openLogoutModal);
    document.getElementById("confirmLogout").addEventListener("click", handleLogout);
    document.getElementById("cancelLogout").addEventListener("click", closeLogoutModal);
    
    // Close modals on outside click
    document.getElementById("deleteModal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("deleteModal")) closeDeleteModal();
    });
    
    document.getElementById("updateConfirmModal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("updateConfirmModal")) closeUpdateConfirmModal();
    });
    
    document.getElementById("logoutModal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("logoutModal")) closeLogoutModal();
    });
}

/*  LOAD STUDENTS FROM DATABASE  */
async function loadStudents() {
    try {
        console.log("Fetching students from:", API);
        const res = await fetch(API);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const students = await res.json();
        console.log("Students loaded:", students);
        
        renderTable(students);
        updateStats(students);
        
        if (students.length > 0) {
            showToast(`Loaded ${students.length} student(s) from database`, "success");
        }
    } catch (error) {
        console.error("Error loading students:", error);
        showToast("Error connecting to database! Make sure backend is running.", "error");
    }
}

/*  UPDATE STATS  */
function updateStats(students) {
    const total = students.length;
    const avgPercentage = total > 0 
        ? Math.round(students.reduce((sum, s) => sum + (s.Percentage || 0), 0) / total)
        : 0;
    
    // Get unique courses
    const courses = new Set(students.map(s => s.Course).filter(c => c));
    const totalCourses = courses.size;
    
    document.getElementById("totalStudents").textContent = total;
    document.getElementById("avgMarks").textContent = avgPercentage + "%";
    document.getElementById("totalCourses").textContent = totalCourses;
}

/* RENDER TABLE  */
function renderTable(students) {
    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    if (!students || students.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-inbox"></i> No students found in database
                </td>
            </tr>
        `;
        return;
    }

    students.forEach(student => {
        const percentClass = getPercentClass(student.Percentage);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${student.Id}</strong></td>
            <td>${escapeHtml(student.Name)}</td>
            <td>${escapeHtml(student.Email)}</td>
            <td>${escapeHtml(student.Course)}</td>
            <td><span class="year-badge">Year ${student.Year}</span></td>
            <td><span class="marks-badge ${percentClass}">${student.Percentage}%</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="openUpdateView(${student.Id}, '${escapeHtml(student.Name)}', '${escapeHtml(student.Email)}', '${escapeHtml(student.Course)}', ${student.Year}, ${student.Percentage})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="openDeleteModal(${student.Id}, '${escapeHtml(student.Name)}', '${escapeHtml(student.Email)}', '${escapeHtml(student.Course)}', ${student.Year}, ${student.Percentage})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        table.appendChild(row);
    });
}

function getPercentClass(percentage) {
    if (percentage >= 80) return "high";
    if (percentage >= 50) return "medium";
    return "low";
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/*  ADD STUDENT  */
async function handleAddStudent(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const course = document.getElementById("course").value.trim();
    const year = parseInt(document.getElementById("year").value);
    const percentage = parseInt(document.getElementById("percentage").value);

    if (!name || !email || !course || isNaN(year) || isNaN(percentage)) {
        showToast("Please fill all fields correctly!", "error");
        return;
    }

    const student = { name, email, course, year, percentage };

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });

        if (res.ok) {
            showSuccessModal("Student Added!", `New student "${name}" has been added successfully.`);
            e.target.reset();
            
            setTimeout(() => {
                document.querySelector('[data-view="dashboard"]').click();
                loadStudents();
            }, 2000);
        } else {
            showToast("Error adding student!", "error");
        }
    } catch (error) {
        console.error("Error adding student:", error);
        showToast("Error connecting to server!", "error");
    }
}

/* UPDATE STUDENT  */
function openUpdateView(id, name, email, course, year, percentage) {
    // Switch to update view
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelector('[data-view="updateStudent"]').classList.add("active");
    document.getElementById("updateStudent").classList.add("active");

    // Show form, hide search
    document.getElementById("searchSection").classList.add("hidden");
    document.getElementById("updateFormContainer").classList.remove("hidden");

    // Fill form
    document.getElementById("updateId").value = id;
    document.getElementById("updateName").value = name;
    document.getElementById("updateEmail").value = email;
    document.getElementById("updateCourse").value = course;
    document.getElementById("updateYear").value = year;
    document.getElementById("updatePercentage").value = percentage;

    document.getElementById("searchUpdateId").value = "";
    document.getElementById("searchUpdateName").value = "";
    document.getElementById("updateResults").innerHTML = "";
}

async function searchForUpdate() {
    const searchId = document.getElementById("searchUpdateId").value.trim();
    const searchName = document.getElementById("searchUpdateName").value.trim();
    
    if (!searchId && !searchName) {
        showToast("Please enter Student ID or Name!", "warning");
        return;
    }

    try {
        let students = [];
        
        if (searchId) {
            // Search by ID
            const res = await fetch(`${API}/${searchId}`);
            if (res.ok) {
                const student = await res.json();
                students = [student];
            }
        } else if (searchName) {
            // Search by name
            const res = await fetch(`${API}/search?q=${encodeURIComponent(searchName)}`);
            students = await res.json();
        }
        
        const resultsDiv = document.getElementById("updateResults");
        resultsDiv.classList.remove("hidden");
        resultsDiv.innerHTML = "";

        if (!students || students.length === 0 || (students.length === 1 && students[0].error)) {
            resultsDiv.innerHTML = '<p style="padding: 20px; text-align: center; color: #64748b;">No student found with this ID or Name</p>';
            return;
        }

        resultsDiv.innerHTML = '<div class="results-header">Search Result:</div>';
        
        students.forEach(student => {
            if (student.error) return;
            const item = document.createElement("div");
            item.className = "search-result-item";
            item.innerHTML = `
                <div class="student-details">
                    <span><strong>ID:</strong> #${student.Id}</span>
                    <span><strong>Name:</strong> ${escapeHtml(student.Name)}</span>
                    <span><strong>Email:</strong> ${escapeHtml(student.Email)}</span>
                    <span><strong>Course:</strong> ${escapeHtml(student.Course)}</span>
                    <span><strong>Year:</strong> ${student.Year}</span>
                    <span><strong>Percentage:</strong> ${student.Percentage}%</span>
                </div>
                <button class="btn-edit" onclick="openUpdateView(${student.Id}, '${escapeHtml(student.Name)}', '${escapeHtml(student.Email)}', '${escapeHtml(student.Course)}', ${student.Year}, ${student.Percentage})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            `;
            resultsDiv.appendChild(item);
        });
    } catch (error) {
        console.error("Error searching:", error);
        showToast("Error searching student!", "error");
    }
}

function handleUpdateSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById("updateId").value;
    if (!id) {
        showToast("No student selected!", "error");
        return;
    }
    
    updateData = {
        name: document.getElementById("updateName").value.trim(),
        email: document.getElementById("updateEmail").value.trim(),
        course: document.getElementById("updateCourse").value.trim(),
        year: parseInt(document.getElementById("updateYear").value),
        percentage: parseInt(document.getElementById("updatePercentage").value)
    };
    
    // Show confirmation modal
    document.getElementById("confirmUpdateId").textContent = id;
    document.getElementById("confirmUpdateName").textContent = updateData.name;
    document.getElementById("confirmUpdateEmail").textContent = updateData.email;
    document.getElementById("confirmUpdateCourse").textContent = updateData.course;
    document.getElementById("confirmUpdateYear").textContent = "Year " + updateData.year;
    document.getElementById("confirmUpdatePercentage").textContent = updateData.percentage + "%";
    
    document.getElementById("updateConfirmModal").classList.remove("hidden");
}

async function confirmUpdate() {
    if (!updateData) return;
    
    const id = document.getElementById("updateId").value;
    
    try {
        const res = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });

        if (res.ok) {
            closeUpdateConfirmModal();
            document.getElementById("updateFormContainer").classList.add("hidden");
            document.getElementById("searchSection").classList.remove("hidden");
            showSuccessModal("Student Updated!", `Student ID #${id} has been updated successfully.`);
            loadStudents();
            updateData = null;
        } else {
            showToast("Error updating student!", "error");
        }
    } catch (error) {
        console.error("Error updating student:", error);
        showToast("Error connecting to server!", "error");
    }
}

function closeUpdateConfirmModal() {
    document.getElementById("updateConfirmModal").classList.add("hidden");
    updateData = null;
}

function cancelUpdate() {
    document.getElementById("updateFormContainer").classList.add("hidden");
    document.getElementById("searchSection").classList.remove("hidden");
    document.getElementById("searchUpdateId").value = "";
    document.getElementById("searchUpdateName").value = "";
    document.getElementById("updateResults").innerHTML = "";
    document.getElementById("updateResults").classList.add("hidden");
}

/*  DELETE STUDENT  */
function openDeleteModal(id, name, email, course, year, percentage) {
    deleteId = id;
    document.getElementById("deleteId").textContent = id;
    document.getElementById("deleteName").textContent = name;
    document.getElementById("deleteEmail").textContent = email;
    document.getElementById("deleteCourse").textContent = course;
    document.getElementById("deleteYear").textContent = "Year " + year;
    document.getElementById("deletePercentage").textContent = percentage + "%";
    document.getElementById("deleteModal").classList.remove("hidden");
}

async function handleDeleteConfirm() {
    if (!deleteId) return;

    try {
        const res = await fetch(`${API}/${deleteId}`, { method: "DELETE" });
        
        if (res.ok) {
            closeDeleteModal();
            showSuccessModal("Student Deleted!", `Student ID #${deleteId} has been deleted successfully.`);
            loadStudents();
            deleteId = null;
        } else {
            showToast("Error deleting student!", "error");
        }
    } catch (error) {
        console.error("Error deleting student:", error);
        showToast("Error connecting to server!", "error");
    }
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.add("hidden");
    deleteId = null;
}

async function searchForDelete() {
    const searchId = document.getElementById("searchDeleteId").value.trim();
    const searchName = document.getElementById("searchDeleteName").value.trim();
    
    if (!searchId && !searchName) {
        showToast("Please enter Student ID or Name!", "warning");
        return;
    }

    try {
        let students = [];
        
        if (searchId) {
            // Search by ID
            const res = await fetch(`${API}/${searchId}`);
            if (res.ok) {
                const student = await res.json();
                students = [student];
            }
        } else if (searchName) {
            // Search by name
            const res = await fetch(`${API}/search?q=${encodeURIComponent(searchName)}`);
            students = await res.json();
        }
        
        const resultsDiv = document.getElementById("deleteResults");
        resultsDiv.classList.remove("hidden");
        resultsDiv.innerHTML = "";

        if (!students || students.length === 0 || (students.length === 1 && students[0].error)) {
            resultsDiv.innerHTML = '<p style="padding: 20px; text-align: center; color: #64748b;">No student found with this ID or Name</p>';
            return;
        }

        resultsDiv.innerHTML = '<div class="results-header">Search Result:</div>';
        
        students.forEach(student => {
            if (student.error) return;
            const item = document.createElement("div");
            item.className = "search-result-item";
            item.innerHTML = `
                <div class="student-details">
                    <span><strong>ID:</strong> #${student.Id}</span>
                    <span><strong>Name:</strong> ${escapeHtml(student.Name)}</span>
                    <span><strong>Email:</strong> ${escapeHtml(student.Email)}</span>
                    <span><strong>Course:</strong> ${escapeHtml(student.Course)}</span>
                    <span><strong>Year:</strong> ${student.Year}</span>
                    <span><strong>Percentage:</strong> ${student.Percentage}%</span>
                </div>
                <button class="btn-delete" onclick="openDeleteModal(${student.Id}, '${escapeHtml(student.Name)}', '${escapeHtml(student.Email)}', '${escapeHtml(student.Course)}', ${student.Year}, ${student.Percentage})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            resultsDiv.appendChild(item);
        });
    } catch (error) {
        console.error("Error searching:", error);
        showToast("Error searching student!", "error");
    }
}

/*  LOGOUT  */
function openLogoutModal() {
    document.getElementById("logoutModal").classList.remove("hidden");
}

function closeLogoutModal() {
    document.getElementById("logoutModal").classList.add("hidden");
}

function handleLogout() {
    closeLogoutModal();
    showToast("Logged out successfully!", "success");
    
    // Go to Home page
    setTimeout(() => {
        document.querySelector('[data-view="home"]').click();
    }, 1000);
}

/*  GO TO DASHBOARD  */
function goToDashboard() {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    
    document.querySelector('[data-view="dashboard"]').classList.add("active");
    document.getElementById("dashboard").classList.add("active");
    
    loadStudents();
}

/*  SUCCESS MODAL  */
function showSuccessModal(title, message) {
    document.getElementById("successTitle").textContent = title;
    document.getElementById("successMessage").textContent = message;
    document.getElementById("successModal").classList.remove("hidden");
}

function closeSuccessModal() {
    document.getElementById("successModal").classList.add("hidden");
}

/*  TOAST NOTIFICATION  */
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "check-circle";
    if (type === "error") icon = "exclamation-circle";
    if (type === "warning") icon = "exclamation-triangle";
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "slideInRight 0.4s ease reverse";
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
