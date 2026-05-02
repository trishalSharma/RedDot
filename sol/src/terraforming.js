/**
 * Terraforming progress is a community milestone.
 *
 * Milestones (total dots → % complete → what unlocks):
 *   0     →  0%   barren Mars
 *   100   →  5%   ice caps begin to show
 *   500   → 15%   atmosphere haze shifts
 *   1000  → 25%   first milestone badge
 *   5000  → 50%   surface color noticeably greener
 *   10000 → 75%
 *   25000 → 100%  fully terraformed
 */

const MILESTONES = [
    { dots:     0, pct:  0  },
    { dots:   100, pct:  5  },
    { dots:   500, pct: 15  },
    { dots:  1000, pct: 25  },
    { dots:  5000, pct: 50  },
    { dots: 10000, pct: 75  },
    { dots: 25000, pct: 100 },
  ]
  
  /**
   * Convert total dot count → terraforming percentage (0–100).
   */
  export function calcTerraformPct(totalDots) {
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (totalDots >= MILESTONES[i].dots) {
        const lower = MILESTONES[i]
        const upper = MILESTONES[i + 1] ?? lower
        if (lower === upper) return lower.pct
  
        const span   = upper.dots - lower.dots
        const within = totalDots - lower.dots
        const frac   = span > 0 ? within / span : 0
        return lower.pct + frac * (upper.pct - lower.pct)
      }
    }
    return 0
  }
  
  /**
   * Update the header progress bar.
   */
  export function updateProgressUI(pct) {
    const fill = document.getElementById('progressFill')
    const label = document.getElementById('progressPct')
    if (!fill || !label) return
  
    fill.style.width = `${pct.toFixed(1)}%`
    label.textContent = `${Math.floor(pct)}%`
  }
  
  /**
   * Check if a milestone was just crossed.
   * Returns milestone object or null.
   */
  export function checkMilestoneCrossed(prevCount, newCount) {
    for (const m of MILESTONES) {
      if (m.dots > 0 && prevCount < m.dots && newCount >= m.dots) {
        return m
      }
    }
    return null
  }