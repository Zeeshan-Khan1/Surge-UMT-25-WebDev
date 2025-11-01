// Match Score Algorithm - calculates compatibility between user and job

export function calculateMatchScore(user, job) {
  let score = 0
  let maxScore = 0

  // Skill matching (40% weight)
  const skillWeight = 40
  maxScore += skillWeight
  if (user.skills && job.requiredSkills) {
    const matchingSkills = user.skills.filter(skill =>
      job.requiredSkills.some(reqSkill =>
        reqSkill.toLowerCase() === skill.toLowerCase()
      )
    )
    const skillMatchRatio = matchingSkills.length / Math.max(job.requiredSkills.length, 1)
    score += skillMatchRatio * skillWeight
  }

  // Tag/Interest matching (25% weight)
  const tagWeight = 25
  maxScore += tagWeight
  if (user.interests && job.tags) {
    const matchingTags = user.interests.filter(interest =>
      job.tags.some(tag =>
        tag.toLowerCase() === interest.toLowerCase()
      )
    )
    const tagMatchRatio = matchingTags.length / Math.max(job.tags.length, 1)
    score += tagMatchRatio * tagWeight
  }

  // Experience level matching (20% weight)
  const experienceWeight = 20
  maxScore += experienceWeight
  if (user.experienceLevel && job.experienceLevel) {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert']
    const userLevel = levels.indexOf(user.experienceLevel.toLowerCase())
    const jobLevel = levels.indexOf(job.experienceLevel.toLowerCase())
    
    if (userLevel >= jobLevel) {
      score += experienceWeight // Full score if user meets or exceeds requirement
    } else {
      // Partial score based on how close they are
      const ratio = (userLevel + 1) / (jobLevel + 1)
      score += ratio * experienceWeight
    }
  }

  // Profile completeness (15% weight)
  const profileWeight = 15
  maxScore += profileWeight
  let profileCompleteness = 0
  if (user.name) profileCompleteness += 0.2
  if (user.bio && user.bio.length > 50) profileCompleteness += 0.2
  if (user.skills && user.skills.length > 0) profileCompleteness += 0.2
  if (user.experienceLevel) profileCompleteness += 0.2
  if (user.profilePicture) profileCompleteness += 0.2
  score += profileCompleteness * profileWeight

  // Calculate final percentage
  const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  
  return {
    score: finalScore,
    breakdown: {
      skillMatch: user.skills && job.requiredSkills ? 
        Math.round((user.skills.filter(s =>
          job.requiredSkills.some(rs => rs.toLowerCase() === s.toLowerCase())
        ).length / Math.max(job.requiredSkills.length, 1)) * 100) : 0,
      tagMatch: user.interests && job.tags ?
        Math.round((user.interests.filter(i =>
          job.tags.some(t => t.toLowerCase() === i.toLowerCase())
        ).length / Math.max(job.tags.length, 1)) * 100) : 0,
      experienceMatch: calculateExperienceMatch(user.experienceLevel, job.experienceLevel),
      profileCompleteness: Math.round(profileCompleteness * 100)
    }
  }
}

function calculateExperienceMatch(userLevel, jobLevel) {
  if (!userLevel || !jobLevel) return 50
  
  const levels = ['beginner', 'intermediate', 'advanced', 'expert']
  const userIdx = levels.indexOf(userLevel.toLowerCase())
  const jobIdx = levels.indexOf(jobLevel.toLowerCase())
  
  if (userIdx === -1 || jobIdx === -1) return 50
  
  if (userIdx >= jobIdx) return 100
  return Math.round(((userIdx + 1) / (jobIdx + 1)) * 100)
}

// Recommendation Algorithm - ranks jobs by match score and relevance
export function getRecommendedJobs(user, allJobs, limit = 10) {
  const jobsWithScores = allJobs
    .filter(job => job.status === 'active')
    .map(job => ({
      job,
      matchScore: calculateMatchScore(user, job)
    }))
    .sort((a, b) => {
      // Sort by match score first
      if (b.matchScore.score !== a.matchScore.score) {
        return b.matchScore.score - a.matchScore.score
      }
      // Then by recency
      return new Date(b.job.createdAt) - new Date(a.job.createdAt)
    })
    .slice(0, limit)

  return jobsWithScores
}

