### At-Risk (v1) — Decision Rules
- **Confidence rule:** if `max_prob(Healthy, Diseased) < 0.70` → **At-Risk**
- **Tie rule:** if `|p_healthy − p_diseased| < 0.15` → **At-Risk**
- **Image-quality rule (pre-checks):** if simple checks fail (very dark, overexposed, tiny subject) → **At-Risk** and advise retake
- **Notes:** Frontend should display an At-Risk badge with guidance (“Retake photo in good light, fill the frame with the leaf”).
