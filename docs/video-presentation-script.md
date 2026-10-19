# Video Presentation Script (3–5 Minutes)
## PS09 Adaptive Memory Matching Game — Cerevyn x Chitkara Assessment
**Candidate:** Pulkit Singla | **Roll Number:** 2310991342 | **Branch:** Computer Science  
**Live Demo:** https://pulkitsingla16.github.io/Cerevyn-Chitkara-2310991342-PS09/  
**GitHub:** https://github.com/pulkitsingla16/Cerevyn-Chitkara-2310991342-PS09  

---

### Segment 1: Introduction (0:00 – 0:45)
- **Visual:** Open browser showing the live game URL on GitHub Pages.
- **Spoken Script:**  
  *"Hello, my name is Pulkit Singla, Roll Number 2310991342 from Chitkara University. Today I am presenting my solution for Problem Statement 09 (PS09): The Adaptive Memory Matching Game for the Cerevyn assessment.*  
  *The core challenge of PS09 is creating a memory matching game that tracks player performance in real time and automatically adapts the difficulty of the next round based on explicit rules and clear feedback.*  
  *My solution is built using React 19, TypeScript, and Vite on the frontend, with a Node.js Express telemetry backend, dual-mode persistence, and 100% test coverage with 26 automated unit and integration tests."*

---

### Segment 2: Gameplay & Cyber UI Features (0:45 – 1:45)
- **Visual:** Show the cyber-eye cards flipping in 3D.
- **Spoken Script:**  
  *"Let's look at the game interface. The design features a futuristic arcade neon theme with custom cyber-eye artwork on the back of every card, smooth 3D flip animations, and a locked aspect-ratio grid to ensure cards never overlap or distort on any screen.*  
  *When I flip the first card, the timer immediately starts. If I click two matching cards, they turn green and lock in place. If I click two mismatched cards, they reveal briefly and automatically flip back after 450 milliseconds.*  
  *Notice our strict debounce guards: rapid clicking during mismatch animations is completely ignored, and matched cards cannot be re-clicked. Even if I click Restart during an animation, the state machine resets cleanly without memory leaks or timer glitches."*

---

### Segment 3: Demonstrating the Adaptive Difficulty Engine (1:45 – 3:00)
- **Visual:** Complete an Easy game quickly to trigger promotion to Medium; show the Win Modal and Reason badge.
- **Spoken Script:**  
  *"Now, let's observe the core requirement: Adaptive Difficulty.*  
  *Our system implements three difficulty tiers:*  
  *• Easy: 4x4 grid (8 pairs)*  
  *• Medium: 4x5 grid (10 pairs)*  
  *• Hard: 4x6 grid (12 pairs)*  
  *Here, I am completing an Easy round. I finished in under 18 moves and within 60 seconds. When the round completes, confetti triggers and the victory panel clearly displays: 'Mastered Easy level within performance threshold. Advancing to Medium.'*  
  *Similarly, if a player struggles on Hard by taking more than 35 moves or 150 seconds, the algorithm steps in and demotes them to Medium with an explicit supportive explanation. This dynamic pacing keeps players engaged and reinforces learning."*

---

### Segment 4: Telemetry, Session History & Persistence (3:00 – 3:45)
- **Visual:** Click "View Analytics" to open the Performance Telemetry modal; show the Session History table and Personal Best stats.
- **Spoken Script:**  
  *"All completed rounds are permanently tracked in both the player's session history and our performance telemetry database.*  
  *Opening the Telemetry modal shows total rounds played, average moves, average completion time, difficulty distribution graphs, and the top 5 session leaderboard.*  
  *The persistence architecture is dual-mode: it synchronizes with our Node.js server database when online, and gracefully falls back to browser localStorage when offline or running as a static CDN demo, ensuring 100% reliability."*

---

### Segment 5: Testing, Cloud Deployment & Conclusion (3:45 – 4:30)
- **Visual:** Show the GitHub repository, passing GitHub Actions CI workflows, and test summary.
- **Spoken Script:**  
  *"Finally, regarding software engineering rigor: the codebase includes 26 automated tests across 6 suites verifying deck shuffle math, deterministic seeds, storage boundary conditions, timer safety, UI lifecycles, and backend REST APIs.*  
  *The project is deployed multi-cloud: hosted 24/7 on GitHub Pages CDN for zero latency and verified on Microsoft Azure App Service.*  
  *Thank you for reviewing my project, and I look forward to contributing to Cerevyn as a Software Development Trainee."*
