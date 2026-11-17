
const User = require('../models/User');
const Project = require('../models/Project');

// Calculate skill matching score
const calculateMatchScore = (studentSkills, requiredSkills) => {
  if (!requiredSkills.length) return 0;

  const normalizedStudentSkills = studentSkills.map(skill =>
    skill.toLowerCase().trim()
  );

  const normalizedRequiredSkills = requiredSkills.map(skill =>
    skill.toLowerCase().trim()
  );

  const matchedSkills = normalizedRequiredSkills.filter(skill =>
    normalizedStudentSkills.includes(skill)
  );

  return Math.round(
    (matchedSkills.length / normalizedRequiredSkills.length) * 100
  );
};

// AI Smart Team Matcher
const findTeamMatches = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.'
      });
    }

    const project = await Project.findById(projectId);

    if (!project || !project.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Active project not found.'
      });
    }

    const existingMembers = [
      project.owner.toString(),
      ...project.teamMembers.map(member => member.toString())
    ];

    const availablePositions = Math.max(
      0,
      project.positions - project.teamMembers.length
    );

    if (availablePositions === 0) {
      return res.status(200).json({
        success: true,
        message: 'This project has no available team positions.',
        matches: []
      });
    }

    const students = await User.find({
      _id: { $nin: existingMembers },
      isActive: true,
      role: 'student'
    }).select('name email college course branch skills interests profilePhoto');

    const matches = students.map(student => {
      const score = calculateMatchScore(
        student.skills || [],
        project.requiredSkills || []
      );

      const matchedSkills = (project.requiredSkills || []).filter(skill =>
        (student.skills || []).some(
          studentSkill =>
            studentSkill.toLowerCase().trim() === skill.toLowerCase().trim()
        )
      );

      return {
        student,
        score,
        matchedSkills,
        missingSkills: (project.requiredSkills || []).filter(
          skill => !matchedSkills.includes(skill)
        )
      };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

    res.status(200).json({
      success: true,
      project: project.title,
      availablePositions,
      totalMatches: matches.length,
      matches
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Team matching failed.',
      error: error.message
    });
  }
};

module.exports = { findTeamMatches };
