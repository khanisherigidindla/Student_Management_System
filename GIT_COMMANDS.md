# Git Commands to Push Code to GitHub

## Repository URL
https://github.com/khanisherigidindla/Student_Management_System

---

## Step 1: Install Git (if not installed)
Download from: https://git-scm.com/download/win

---

## Step 2: Configure Git (first time only)
```
bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 3: Initialize Git & Push Code
Run these commands in your terminal:

```
bash
cd c:/Users/khani/Documents/Company/Student_Management_System
git init
git add .
git commit -m "Initial commit - Student Management System"
git remote add origin https://github.com/khanisherigidindla/Student_Management_System.git
git push -u origin master
```

**If you get "refusing to merge unrelated histories" error, use:**
```
bash
git push -u origin master --force
```

---

## To Push Future Updates:
```
bash
git add .
git commit -m "Your commit message"
git push origin master
```
